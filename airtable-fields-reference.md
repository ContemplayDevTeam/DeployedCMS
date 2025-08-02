# Airtable Fields Reference

## Queue Table Fields

| Field Name | Type | Description | Example Value |
|------------|------|-------------|---------------|
| **User Email** | Email | Email address of the user who uploaded the image | `user@example.com` |
| **Image URL** | Link | Link field pointing to an image (e.g., hosted on Cloudinary) | `https://res.cloudinary.com/...` |
| **Upload Date** | Date | Date when the image was uploaded | `2024-01-15` |
| **Publish Date** | Date | Date field for when the image is intended to be published | `2024-01-20` |
| **Publish Time** | Date | Date field with time indicating when the image should go live | `2025-08-02T08:00:00.000Z` |
| **Image Queue #** | Number | Auto-assigned by Airtable, not sent in payload | `1, 2, 3...` |

## Notes

- **Image Queue #** is auto-assigned by Airtable and should NOT be included in the payload
- **Priority** field has been removed as it's not in the official field list
- **Status** field has been removed to prevent 422 errors
- All date fields use YYYY-MM-DD format
- Publish Time field uses full ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SS.sssZ)

## Payload Structure

```javascript
{
  "User Email": "user@example.com",
  "Image URL": "https://res.cloudinary.com/...",
  "Upload Date": "2024-01-15",
  "Publish Date": "2024-01-20", 
  "Publish Time": "2025-08-02T08:00:00.000Z"
}
```

## Removed Fields

- ❌ Status
- ❌ File Name  
- ❌ File Size
- ❌ Notes
- ❌ Priority
- ❌ Image Queue # (not sent in payload) 