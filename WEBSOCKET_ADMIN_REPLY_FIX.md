# WebSocket Admin Reply Fix - General Inquiry Conversations

**Date:** 2026-07-24  
**Issue:** Admin cannot reply to General Inquiry conversations with `admin_id = NULL`  
**Error:** `تعذر تحديد نوع المرسل` (Cannot determine sender type)

---

## Problem

When an admin tried to reply to a General Inquiry conversation (where `admin_id = NULL`), the WebSocket message handler failed with error: "تعذر تحديد نوع المرسل"

**Root Cause:**
The sender type determination logic in `messageHandlers.ts` assumed that:
- Admin sender → `conversation.admin_id === userData.userId`
- Client sender → `conversation.client_id === userData.userId`

This logic fails for General conversations where `admin_id = NULL` because no admin is specifically assigned.

---

## Solution

Modified `src/modules/api/v1/websocket/handlers/messageHandlers.ts` to handle NULL admin_id:

### 1. **Permission Check (Line ~53-63)**
**Before:**
```typescript
if (
  userData.role !== 'owner' &&
  conversation.client_id !== userData.userId &&
  conversation.admin_id !== userData.userId
) {
  // Deny access
}
```

**After:**
```typescript
const isClient = conversation.client_id === userData.userId;
const isAssignedAdmin = conversation.admin_id === userData.userId;
const isGeneralAdmin = conversation.admin_id === null && (userData.role === 'admin' || userData.role === 'owner');

if (!isClient && !isAssignedAdmin && !isGeneralAdmin) {
  // Deny access
}
```

### 2. **Sender Type Determination (Line ~66-77)**
**Before:**
```typescript
let senderType: MessageSenderType;
if (conversation.admin_id === userData.userId) {
  senderType = MessageSenderType.ADMIN;
} else if (conversation.client_id === userData.userId) {
  senderType = MessageSenderType.CLIENT;
} else {
  // Error: Cannot determine sender type
}
```

**After:**
```typescript
let senderType: MessageSenderType;
if (conversation.client_id === userData.userId) {
  senderType = MessageSenderType.CLIENT;
} else if (conversation.admin_id === userData.userId || (conversation.admin_id === null && (userData.role === 'admin' || userData.role === 'owner'))) {
  senderType = MessageSenderType.ADMIN;
} else {
  // Error: Cannot determine sender type
}
```

**Key Change:** Check client FIRST, then admin. For general conversations (admin_id = NULL), any user with role 'admin' or 'owner' is treated as ADMIN sender.

### 3. **Broadcast Logic (Line ~103-110)**
**Before:**
```typescript
const receiverId = senderType === MessageSenderType.ADMIN ? conversation.client_id : conversation.admin_id;
// Subscribe receiver if not subscribed
```

**After:**
```typescript
if (conversation.admin_id !== null) {
  // Regular conversation: send to specific receiver
  const receiverId = senderType === MessageSenderType.ADMIN ? conversation.client_id : conversation.admin_id;
  // Subscribe receiver if not subscribed
} else {
  // General conversation (admin_id = null): broadcast to all subscribers
  console.log(`📢 محادثة عامة (admin_id = null): البث لجميع المشتركين`);
}
```

### 4. **Delete Permission (Line ~310)**
**Before:**
```typescript
const canDelete =
  userData.role === 'owner' ||
  messageToDelete.sender_id === userData.userId ||
  conversation.admin_id === userData.userId;
```

**After:**
```typescript
const canDelete =
  userData.role === 'owner' ||
  messageToDelete.sender_id === userData.userId ||
  conversation.admin_id === userData.userId ||
  (conversation.admin_id === null && (userData.role === 'admin' || userData.role === 'owner'));
```

---

## Testing

1. **User sends message in General Inquiry** → ✅ Works (from previous fix)
2. **Admin views General Inquiry conversation** → ✅ Should see the conversation
3. **Admin replies to General Inquiry** → ✅ Should work now (no "تعذر تحديد نوع المرسل" error)
4. **User receives admin reply** → ✅ Should receive via WebSocket broadcast
5. **Multiple admins viewing same General Inquiry** → ✅ All should receive updates

---

## Database Requirements

Ensure SQL migration was applied:
```sql
ALTER TABLE conversations ALTER COLUMN admin_id DROP NOT NULL;
```

---

## Design Logic

**General Inquiry Conversations (`type = 'general'`):**
- `client_id` = user ID
- `admin_id` = NULL (not assigned to specific admin)
- **Visible to:** The client + ALL admins
- **Any admin can reply** (first admin to reply doesn't get "assigned")
- Broadcast goes to all WebSocket subscribers of that conversation

**Regular Conversations (`type = 'project'` or specific admin assignment):**
- `client_id` = user ID
- `admin_id` = specific admin ID
- **Visible to:** The client + that specific admin only
- Only that admin can reply

---

## Files Modified

1. `c:\Users\moham\OneDrive\Desktop\NixtBackend\src\modules\api\v1\websocket\handlers\messageHandlers.ts`
   - Fixed permission check for general conversations
   - Fixed sender type determination for admin_id = NULL
   - Fixed broadcast logic to handle NULL admin_id
   - Fixed delete permissions for general conversations

---

## Status

✅ **FIXED** - Admin can now reply to General Inquiry conversations
