# Chat File Upload Implementation

This guide explains how to set up and use the chat file upload feature for your Artist Communication Portal.

## Overview

Users can now share files (images, videos, documents, audio) in chat conversations. Files are stored in Supabase Storage and linked to messages through the `message_attachments` database table.

## Architecture

```
┌─────────────────────────────────────┐
│  Chat UI (MessageThread)            │
│  - ChatFileUpload Component         │
│  - File preview & drag-drop         │
└──────────────┬──────────────────────┘
               │ /api/messages/upload
               ▼
┌─────────────────────────────────────┐
│  Upload API Endpoint                │
│  - Validates file & auth            │
│  - Uploads to Supabase Storage      │
│  - Creates attachment record in DB  │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    Supabase      message_attachments
    Storage       Table (RLS Protected)
    (public)
```

## Setup Instructions

### Step 1: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **Create Bucket**
4. Configure:
   - **Name**: `chat-attachments`
   - **Public bucket**: ✅ Enable (so users can access files)
   - **File size limit**: 10 MB

### Step 2: Create Database Table

Run the migration in your Supabase SQL editor:

```sql
-- From: scripts/004_create_message_attachments.sql
-- This creates the message_attachments table with RLS policies
```

To apply:
1. Go to Supabase Dashboard → **SQL Editor**
2. Create new query
3. Copy content from `scripts/004_create_message_attachments.sql`
4. Click **Run**

### Step 3: Configure Storage Policies (Optional - Already Configured in Script)

The storage policies are configured to:
- ✅ Allow authenticated users to upload files
- ✅ Allow public read access to files
- ✅ Allow users to delete their own files

These are automatically set via SQL when you run the migration.

### Step 4: Environment Variables

The following environment variables should already be set:

```
NEXT_PUBLIC_SUPABASE_URL=https://fpnwqamqypgllpnuhpte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=https://fpnwqamqypgllpnuhpte.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_S3_ENDPOINT=https://fpnwqamqypgllpnuhpte.storage.supabase.co/storage/v1/s3
SUPABASE_S3_REGION=us-east-1
SUPABASE_S3_ACCESS_KEY=8636da61ce0455c7dad545edad985712
SUPABASE_S3_SECRET_KEY=b77d7e1993af8851c9c4345c79c7553b89a3e7dad508c9cda59b8cf69d236cc4
```

## File Upload Flow

### User Experience

1. **Open Chat**: User navigates to a conversation
2. **Attach Files**: User clicks the attachment icon or drags files into the upload area
3. **File Validation**: Frontend validates:
   - File type (images, videos, documents, audio)
   - File size (max 10MB)
4. **Upload**: Files are uploaded to Supabase Storage
5. **Preview**: User sees file preview in the chat
6. **Send**: User sends the message with attached files

### Technical Flow

1. **File Upload Request**: `POST /api/messages/upload`
   - Accepts: FormData with `file` and `messageId`
   - Authentication: Required (JWT token)
   - Rate limiting: 20 requests per 60 seconds per IP

2. **Validation on Server**:
   - File size check (max 10MB)
   - MIME type whitelist validation
   - User authentication check
   - Message ownership verification

3. **Storage**:
   - Files stored in: `chat-attachments/messages/{messageId}/{filename}`
   - Public URL returned to client

4. **Database Record**:
   - Entry created in `message_attachments` table
   - Linked to message via `message_id`
   - RLS policies enforce access control

5. **Real-time Delivery**:
   - Attachment appears in recipient's chat via Supabase Realtime
   - Subscription updates automatically

## Supported File Types

| Category | Formats |
|----------|---------|
| **Images** | JPG, PNG, WebP, GIF, AVIF |
| **Videos** | MP4, WebM, MOV |
| **Documents** | PDF, DOC, DOCX, XLS, XLSX |
| **Audio** | MP3, WAV, OGG |

## API Endpoints

### POST `/api/messages/upload`

Upload a file for a chat message.

**Request:**
```
FormData:
- file: File (binary)
- messageId: string (UUID)
```

**Response (Success - 200):**
```json
{
  "success": true,
  "url": "https://fpnwqamqypgllpnuhpte.supabase.co/storage/v1/object/public/chat-attachments/messages/...",
  "storage_path": "messages/{messageId}/{filename}",
  "file_name": "document.pdf",
  "file_size": 2048000,
  "file_type": "application/pdf"
}
```

**Error Responses:**
- `401`: Unauthorized (not authenticated)
- `400`: Invalid file or missing parameters
- `429`: Rate limit exceeded
- `500`: Server error

## Database Schema

### `message_attachments` Table

```sql
CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY,
  message_id uuid REFERENCES messages(id),
  file_name text,
  file_size integer,
  file_type text,
  storage_path text,
  created_at timestamptz
);
```

**Row Level Security (RLS):**
- Users can only see attachments in messages they're part of
- Users can only upload attachments to their own messages
- Users can only delete attachments from their own messages

## Component Usage

### ChatFileUpload Component

```tsx
import { ChatFileUpload } from "@/components/chat-file-upload"

<ChatFileUpload
  messageId={messageId}
  onFileUpload={(file) => {
    // Handle successful upload
    // file: { url, storage_path, file_name, file_size, file_type }
  }}
  onError={(error) => {
    // Handle upload error
  }}
  disabled={isLoading}
/>
```

### Displaying Attachments

Attachments are automatically displayed in messages:
```tsx
{message.attachments?.map((attachment) => (
  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
    {attachment.file_name}
  </a>
))}
```

## Security Considerations

1. **File Type Validation**: Both client and server validate MIME types
2. **File Size Limits**: 10MB per file to prevent abuse
3. **Rate Limiting**: 20 uploads per minute per IP
4. **Authentication Required**: All uploads require valid JWT token
5. **Row Level Security**: RLS policies enforce message privacy
6. **Public URLs**: Files are public read-only (no direct modification)

## Cleanup

When a message is deleted, its attachments are automatically removed from the database via trigger:

```sql
CREATE TRIGGER on_message_deleted
  BEFORE DELETE on public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_message_attachments();
```

**Note**: Storage files are not automatically deleted from Supabase Storage. For production, implement a cloud function to delete orphaned files periodically.

## Troubleshooting

### Files not uploading
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Ensure bucket `chat-attachments` exists and is public
4. Check rate limiting (20/min)

### Files showing as inaccessible
1. Verify bucket is set to **Public**
2. Check storage policies allow public read
3. Verify file URL format: `https://{project}.supabase.co/storage/v1/object/public/chat-attachments/...`

### RLS errors
1. Ensure message exists in database
2. Verify user is sender of message (for RLS insert)
3. Check auth token is valid

## Future Enhancements

- [ ] Image compression on upload
- [ ] Thumbnail generation for videos
- [ ] Virus scanning integration
- [ ] Archive old attachments
- [ ] Storage quota per user
- [ ] Download analytics
