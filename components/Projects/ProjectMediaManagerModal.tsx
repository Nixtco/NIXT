'use client'

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styles from './ProjectMediaManagerModal.module.css'
import {
  type Project as APIProject,
  type ProjectMediaItem,
  updateProjectMedia,
} from '@/app/Projects/apiFunctions'
import { loadProjectMedia, saveProjectMedia } from '@/lib/projectMediaStorage'

const MAX_IMAGE_SIZE = 3 * 1024 * 1024
const MAX_VIDEO_SIZE = 6 * 1024 * 1024

interface ProjectMediaManagerModalProps {
  project: APIProject
  isRTL: boolean
  onClose: () => void
  onSaved: (projectId: string, media: ProjectMediaItem[]) => void
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatDate(dateStr: string, isRTL: boolean): string {
  return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const ProjectMediaManagerModal: FC<ProjectMediaManagerModalProps> = ({
  project,
  isRTL,
  onClose,
  onSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [mediaItems, setMediaItems] = useState<ProjectMediaItem[]>(() =>
    loadProjectMedia(project.id, project.media_updates)
  )
  const [caption, setCaption] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isLightboxOpen = lightboxIndex !== null
  const currentItem = isLightboxOpen ? mediaItems[lightboxIndex] : null

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      return prev === 0 ? mediaItems.length - 1 : prev - 1
    })
  }, [mediaItems.length])

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      return prev === mediaItems.length - 1 ? 0 : prev + 1
    })
  }, [mediaItems.length])

  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowLeft') isRTL ? goNext() : goPrev()
      else if (e.key === 'ArrowRight') isRTL ? goPrev() : goNext()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen, isRTL, goPrev, goNext])

  useEffect(() => {
    if (currentItem?.type === 'video' && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [currentItem?.id, currentItem?.type])

  const processFile = async (file: File) => {
    setUploadError(null)
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      setUploadError(isRTL ? 'يرجى اختيار صورة أو فيديو' : 'Please select an image or video')
      return
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
    if (file.size > maxSize) {
      setUploadError(
        isRTL
          ? `حجم الملف كبير (الحد ${isImage ? '5MB' : '12MB'})`
          : `File too large (max ${isImage ? '5MB' : '12MB'})`
      )
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      const type: ProjectMediaItem['type'] = isImage ? 'image' : 'video'
      const newItem: ProjectMediaItem = {
        id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        url: dataUrl,
        thumbnail: isVideo ? dataUrl : undefined,
        caption: caption.trim() || undefined,
        uploaded_at: new Date().toISOString(),
      }

      setMediaItems((prev) => [newItem, ...prev])
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch {
      setUploadError(isRTL ? 'فشل قراءة الملف' : 'Failed to read file')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMediaItems((prev) => prev.filter((item) => item.id !== id))
    setLightboxIndex((prev) => {
      if (prev === null) return null
      const newLength = mediaItems.length - 1
      if (newLength <= 0) return null
      return Math.min(prev, newLength - 1)
    })
  }

  const handleSave = async () => {
    setUploadError(null)
    setIsSaving(true)
    try {
      const response = await updateProjectMedia(project.id, mediaItems)
      if (!response.success) {
        throw new Error(isRTL ? 'فشل حفظ الوسائط على الخادم' : 'Failed to save media on server')
      }

      saveProjectMedia(project.id, mediaItems)
      onSaved(project.id, mediaItems)
      onClose()
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : (isRTL ? 'تعذر حفظ الوسائط. حاول مرة أخرى' : 'Could not save media. Please try again')
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} role="presentation">
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
          role="dialog"
          aria-modal="true"
          aria-label={isRTL ? 'معرض وسائط المشروع' : 'Project media gallery'}
        >
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>
                {isRTL ? '📸 معرض تطورات المشروع' : '📸 Project Visual Updates'}
              </h2>
              <p className={styles.subtitle}>{project.name}</p>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={isRTL ? 'إغلاق' : 'Close'}>
              ✕
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.uploadSection}>
              <div
                className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDragging : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div className={styles.uploadIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className={styles.uploadTitle}>
                  {isRTL ? 'اسحب صورة أو فيديو هنا' : 'Drag & drop image or video here'}
                </p>
                <p className={styles.uploadHint}>
                  {isRTL ? 'أو انقر للاختيار · PNG, JPG, MP4 · حتى 3MB للصور و6MB للفيديو' : 'Or click to browse · PNG, JPG, MP4 · up to 3MB images and 6MB videos'}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />

              <div className={styles.captionRow}>
                <input
                  type="text"
                  className={styles.captionInput}
                  placeholder={isRTL ? 'وصف اختياري (مثال: تصميم الصفحة الرئيسية)' : 'Optional caption (e.g. Homepage design)'}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isRTL ? 'اختيار ملف' : 'Choose File'}
                </button>
              </div>

              {uploadError && <p className={styles.error} role="alert">{uploadError}</p>}
            </div>

            <h3 className={styles.sectionTitle}>
              <span>{isRTL ? 'الوسائط المرفوعة' : 'Uploaded Media'}</span>
              <span className={styles.countBadge}>{mediaItems.length}</span>
            </h3>

            <div className={styles.grid}>
              {mediaItems.length === 0 ? (
                <div className={styles.emptyState}>
                  {isRTL
                    ? 'لا توجد صور أو فيديوهات بعد. ارفع أول تحديث بصري للمشروع.'
                    : 'No media yet. Upload the first visual update for this project.'}
                </div>
              ) : (
                mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={styles.mediaCard}
                    onClick={() => setLightboxIndex(index)}
                    onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.caption || (item.type === 'video' ? 'Video' : 'Image')}
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.caption || ''} className={styles.thumb} />
                    ) : (
                      <>
                        <video src={item.url} className={styles.thumb} muted preload="metadata" />
                        <div className={styles.videoOverlay}>
                          <div className={styles.playIcon}>
                            <svg width="10" height="10" viewBox="0 0 8 8" fill="currentColor">
                              <polygon points="2,1 7,4 2,7" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}
                    {item.caption && (
                      <span className={styles.cardMeta}>{item.caption}</span>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(item.id, e)}
                      aria-label={isRTL ? 'حذف' : 'Delete'}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                : (isRTL ? 'حفظ ونشر للعميل' : 'Save & Publish to Client')}
            </button>
          </div>
        </div>
      </div>

      {isLightboxOpen && currentItem && (
        <div className={styles.lightbox} onClick={() => setLightboxIndex(null)} role="presentation">
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label={isRTL ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>

          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label={isRTL ? 'السابق' : 'Previous'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isRTL ? '9 18 15 12 9 6' : '15 18 9 12 15 6'} />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.lightboxNav} ${styles.lightboxNext}`}
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label={isRTL ? 'التالي' : 'Next'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={isRTL ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
            </svg>
          </button>

          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {currentItem.type === 'image' ? (
              <img src={currentItem.url} alt={currentItem.caption || ''} className={styles.lightboxImage} />
            ) : (
              <video
                ref={videoRef}
                src={currentItem.url}
                controls
                playsInline
                className={styles.lightboxVideo}
              />
            )}
            {currentItem.caption && (
              <p className={styles.lightboxCaption}>{currentItem.caption}</p>
            )}
            <p className={styles.lightboxCounter}>
              {formatDate(currentItem.uploaded_at, isRTL)}
              {' · '}
              {(lightboxIndex ?? 0) + 1} / {mediaItems.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ProjectMediaManagerModal
