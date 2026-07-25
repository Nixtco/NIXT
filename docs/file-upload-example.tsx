/**
 * مثال على استخدام نظام رفع الملفات في الدردشة
 * يمكن دمج هذا الكود في ChatWidget.tsx
 */

import React, { useState, useRef } from 'react';

interface MessageAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
}

// ============================================
// مثال 1: رفع ملف عبر REST API
// ============================================

/**
 * رفع ملف إلى الخادم
 */
async function uploadFileToServer(file: File, token: string): Promise<MessageAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'فشل رفع الملف');
  }

  const result = await response.json();
  return result.data;
}

/**
 * إرسال رسالة مع مرفق (REST API)
 */
async function sendMessageWithAttachmentREST(
  conversationId: string,
  text: string,
  attachment: MessageAttachment,
  token: string
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      text: text,
      attachment: attachment
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'فشل إرسال الرسالة');
  }

  return await response.json();
}

// ============================================
// مثال 2: رفع ملف عبر WebSocket (Base64)
// ============================================

/**
 * تحويل ملف إلى Base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // إزالة "data:image/png;base64,"
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * إرسال رسالة مع مرفق (WebSocket)
 */
async function sendMessageWithAttachmentWS(
  ws: WebSocket,
  conversationId: string,
  text: string,
  file: File
) {
  const base64Data = await fileToBase64(file);

  const message = {
    type: 'send_message',
    data: {
      conversation_id: conversationId,
      text: text,
      attachment: {
        data: base64Data,
        filename: file.name
      }
    }
  };

  ws.send(JSON.stringify(message));
}

// ============================================
// مثال 3: مكون React لرفع الملفات
// ============================================

interface FileUploadChatProps {
  conversationId: string;
  token: string;
  ws: WebSocket | null;
  useWebSocket?: boolean; // true = WebSocket, false = REST API
}

export function FileUploadChat({ conversationId, token, ws, useWebSocket = false }: FileUploadChatProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // معالجة اختيار الملف
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من حجم الملف (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('حجم الملف يتجاوز 10MB');
      return;
    }

    // التحقق من نوع الملف
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('نوع الملف غير مسموح');
      return;
    }

    setSelectedFile(file);
  };

  // إرسال الرسالة
  const handleSendMessage = async () => {
    if (!message.trim() && !selectedFile) {
      alert('يجب كتابة رسالة أو اختيار ملف');
      return;
    }

    setUploading(true);

    try {
      if (useWebSocket && ws && selectedFile) {
        // استخدام WebSocket
        await sendMessageWithAttachmentWS(ws, conversationId, message, selectedFile);
      } else if (!useWebSocket && selectedFile) {
        // استخدام REST API
        // 1. رفع الملف أولاً
        const attachment = await uploadFileToServer(selectedFile, token);
        
        // 2. إرسال الرسالة
        await sendMessageWithAttachmentREST(conversationId, message, attachment, token);
      } else if (!selectedFile) {
        // إرسال رسالة نصية فقط
        if (useWebSocket && ws) {
          ws.send(JSON.stringify({
            type: 'send_message',
            data: {
              conversation_id: conversationId,
              text: message
            }
          }));
        } else {
          await sendMessageWithAttachmentREST(conversationId, message, null as any, token);
        }
      }

      // إعادة تعيين الحقول
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء الإرسال');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="chat-input-container">
      {/* عرض الملف المحدد */}
      {selectedFile && (
        <div className="selected-file">
          <span>📎 {selectedFile.name}</span>
          <button onClick={() => setSelectedFile(null)}>✕</button>
        </div>
      )}

      {/* حقل الرسالة */}
      <div className="input-row">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالة..."
          disabled={uploading}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !uploading) {
              handleSendMessage();
            }
          }}
        />

        {/* زر اختيار الملف */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          📎
        </button>

        {/* زر الإرسال */}
        <button
          onClick={handleSendMessage}
          disabled={uploading}
        >
          {uploading ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>

      {/* حقل رفع الملف المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* شريط التقدم */}
      {uploading && uploadProgress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
    </div>
  );
}

// ============================================
// مثال 4: عرض المرفقات في الرسائل
// ============================================

interface MessageWithAttachmentProps {
  text: string;
  attachment?: MessageAttachment | null;
}

export function MessageWithAttachment({ text, attachment }: MessageWithAttachmentProps) {
  return (
    <div className="message">
      {/* النص */}
      {text && <p>{text}</p>}

      {/* المرفق */}
      {attachment && (
        <div className="attachment">
          {attachment.type === 'image' && (
            <img
              src={attachment.url}
              alt={attachment.name}
              style={{ maxWidth: '300px', borderRadius: '8px' }}
            />
          )}

          {attachment.type === 'file' && (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="file-link"
            >
              📄 {attachment.name} ({formatFileSize(attachment.size)})
            </a>
          )}

          {attachment.type === 'video' && (
            <video
              src={attachment.url}
              controls
              style={{ maxWidth: '300px', borderRadius: '8px' }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// دوال مساعدة
// ============================================

/**
 * تنسيق حجم الملف
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// Styles (يمكن إضافتها في CSS module)
// ============================================

const styles = `
.chat-input-container {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.selected-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.selected-file button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.input-row input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-row button {
  padding: 0.5rem 1rem;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.input-row button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.progress-bar {
  margin-top: 0.5rem;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.message {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.attachment {
  margin-top: 0.5rem;
}

.file-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
}

.file-link:hover {
  background: #e0e0e0;
}
`;
