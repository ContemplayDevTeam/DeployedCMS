# Airtable Fields Reference

## Image Queue Table Fields

### Core Fields (Required)
| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| **User Email** | Email | Email address of the user who uploaded the image | `user@example.com` |
| **Image URL** | URL | Link field pointing to an image (hosted on Cloudinary) | `https://res.cloudinary.com/...` |
| **File Name** | Single Line Text | Original filename of the uploaded image | `vacation-photo.jpg` |
| **File Size** | Number | File size in bytes | `2048576` |
| **Status** | Single Select | Processing status of the image | `queued`, `processing`, `published`, `failed` |
| **Upload Date** | Date | Date when the image was uploaded | `2024-01-15` |
| **Publish Date** | Date | Date field for when the image is intended to be published | `2024-01-20` |
| **Image Queue #** | Auto Number | Auto-assigned by Airtable (primary field) | `1, 2, 3...` |

### Optional Fields
| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| **Publish Time** | Date & Time | Full datetime for when the image should go live | `2025-08-02T08:00:00.000Z` |
| **Notes** | Long Text | User notes about the image | `Marketing campaign image` |
| **Tags** | Multiple Select | Content tags for categorization | `marketing`, `campaign`, `product` |
| **Metadata** | Long Text | JSON metadata about the image | `{"campaign": "summer2024"}` |
| **Processing Time** | Number | Time taken to process in seconds | `45` |
| **Owner** | Single Line Text | Username or identifier of the player/uploader | `john@example.com` |
| **Experience Type** | Single Select | Type of experience/project this image belongs to | `hnp`, `general` |
| **Approved** | Checkbox | Whether the image has been approved for publishing | `true` |

## Users Table Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| **Email** | Email | Primary user identifier | `user@example.com` |
| **Is Verified** | Checkbox | Email verification status | `true` |
| **Is Paid** | Checkbox | Payment/subscription status | `false` |
| **Subscription Tier** | Single Select | Free/Basic/Pro subscription level | `Free` |
| **Created Date** | Date | User registration date | `2024-01-15` |
| **Last Login** | Date | Last login date | `2024-01-20` |
| **Last Activity** | Date | Last activity date | `2024-01-20` |
| **Total Uploads** | Number | Count of uploaded images | `42` |
| **Storage Used** | Number | Storage used in bytes | `104857600` |
| **Preferences** | Long Text | JSON user preferences | `{"theme": "dark"}` |
| **Plan Expiry** | Date | Subscription expiry date | `2024-12-31` |

## Important Notes

### Field Requirements
- **Image Queue #** is auto-assigned by Airtable and should NOT be included in API payloads
- **Status** field uses Single Select with options: `queued`, `processing`, `published`, `failed`
- All date fields use YYYY-MM-DD format for consistency
- **Publish Time** field uses full ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SS.sssZ)
- **Metadata** and **Preferences** store JSON as text strings

### Status Field Options
Create a Single Select field with these exact options:
- `queued` (default)
- `processing`
- `published`
- `failed`

### Schema Changes
✅ **Added Back**: Status field for proper queue management
✅ **Updated**: Field types and descriptions
❌ **Removed**: Priority field (not needed)

## API Payload Structures

### Create Queue Item (Required Fields)
```javascript
{
  "User Email": "user@example.com",
  "Image URL": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "File Name": "vacation-photo.jpg",
  "File Size": 2048576,
  "Status": "queued",
  "Upload Date": "2024-01-15",
  "Publish Date": "2024-01-20"
}
```

### Create Queue Item (With Optional Fields)
```javascript
{
  "User Email": "user@example.com",
  "Image URL": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "File Name": "vacation-photo.jpg",
  "File Size": 2048576,
  "Status": "queued",
  "Upload Date": "2024-01-15",
  "Publish Date": "2024-01-20",
  "Publish Time": "2025-08-02T08:00:00.000Z",
  "Notes": "Marketing campaign image",
  "Tags": ["marketing", "campaign"],
  "Metadata": "{\"campaign\": \"summer2024\"}"
}
```

### Update Queue Item Status
```javascript
{
  "Status": "processing"
}
```

## Field Validation

- **Email**: Must be valid email format
- **Image URL**: Must be valid URL
- **File Size**: Positive integer (bytes)
- **Dates**: YYYY-MM-DD format
- **Status**: Must be one of the predefined options
- **Tags**: Array of strings
- **Metadata**: Valid JSON string

## Setup Instructions

### 1. Image Queue Table Setup
1. Create fields with exact names and types as listed above
2. Set **Image Queue #** as the primary field (Auto Number)
3. Configure **Status** as Single Select with options: `queued`, `processing`, `published`, `failed`
4. Set **Status** default value to `queued`
5. Configure **Experience Type** as Single Select with options: `hnp`, `general`, `nature`, `earth`, `adventure`, `wellness` (add more as needed)
6. Set **Approved** checkbox default to `false`

### 2. Users Table Setup
1. Create fields with exact names and types as listed above
2. Set **Email** as the primary field
3. Configure **Subscription Tier** with options: `Free`, `Basic`, `Pro`
4. Set **Is Verified** and **Is Paid** default values to `false`

### 3. API Configuration
- Update `AIRTABLE_BASE_ID` and `AIRTABLE_API_KEY` in environment variables
- Ensure table names match exactly: `Users` and `Image Queue`
- Test with the provided payload structures 