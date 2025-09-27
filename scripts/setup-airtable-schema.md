# Airtable Schema Setup Guide

This guide will help you set up the correct Airtable base schema for the AirTable Queue for Customers application.

## Prerequisites

1. **Airtable Account**: You need an Airtable account with a base created
2. **API Access**: Generate an API key from your Airtable account
3. **Base ID**: Copy your base ID from the Airtable API documentation

## Table Setup

### 1. Image Queue Table

#### Table Configuration
- **Table Name**: `Image Queue` (exact name required)
- **Primary Field**: `Image Queue #` (Auto Number)

#### Required Fields

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Image Queue #** | Auto Number | Primary field, starting at 1 | Auto-generated, don't include in API calls |
| **User Email** | Email | Required field | User identifier |
| **Image URL** | URL | Required field | Cloudinary image URL |
| **File Name** | Single line text | Required field | Original filename |
| **File Size** | Number | Integer, required | File size in bytes |
| **Status** | Single select | Required, default: "queued" | See options below |
| **Upload Date** | Date | Required field | YYYY-MM-DD format |
| **Publish Date** | Date | Required field | YYYY-MM-DD format |

#### Status Field Options
Configure the **Status** field as a Single Select with these exact options:
- `queued` (set as default)
- `processing`
- `published`
- `failed`

#### Optional Fields

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Publish Time** | Date & time | Optional | Full datetime (ISO 8601) |
| **Notes** | Long text | Optional | User notes about the image |
| **Tags** | Multiple select | Optional | Content categorization tags |
| **Metadata** | Long text | Optional | JSON string for additional data |
| **Processing Time** | Number | Optional | Processing duration in seconds |

### 2. Users Table

#### Table Configuration
- **Table Name**: `Users` (exact name required)
- **Primary Field**: `Email` (Email field)

#### Required Fields

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Email** | Email | Primary field, required | User identifier |
| **Is Verified** | Checkbox | Default: false | Email verification status |
| **Is Paid** | Checkbox | Default: false | Payment status |
| **Subscription Tier** | Single select | Default: "Free" | See options below |
| **Created Date** | Date | Required | Registration date |
| **Last Login** | Date | Required | Last login date |
| **Last Activity** | Date | Required | Last activity date |
| **Total Uploads** | Number | Default: 0 | Upload counter |
| **Storage Used** | Number | Default: 0 | Storage in bytes |
| **Preferences** | Long text | Optional | JSON user preferences |
| **Plan Expiry** | Date | Optional | Subscription end date |

#### Subscription Tier Options
Configure the **Subscription Tier** field as a Single Select with these options:
- `Free` (set as default)
- `Basic`
- `Pro`

## Environment Configuration

After setting up the tables, update your environment variables:

```bash
# .env.local
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

## Verification Steps

### 1. Test API Access
Run the test script to verify your setup:
```bash
# PowerShell
.\test-airtable-api.ps1

# Bash
./test-airtable-curl.sh
```

### 2. Check Field Names
Use the schema checker to verify field names match exactly:
```javascript
// In your app or a test script
const airtable = new AirtableBackend(process.env.AIRTABLE_API_KEY, process.env.AIRTABLE_BASE_ID)
await airtable.getTableSchema('Image Queue')
await airtable.getTableSchema('Users')
```

### 3. Test Record Creation
Try creating a test queue item:
```javascript
await airtable.queueImage('test@example.com', {
  url: 'https://example.com/test.jpg',
  name: 'test.jpg',
  size: 1024,
  notes: 'Test upload'
})
```

## Common Issues

### 422 Error - Invalid Field
- **Cause**: Field names don't match exactly
- **Solution**: Check spelling and case sensitivity of field names

### Missing Status Options
- **Cause**: Status field not configured as Single Select
- **Solution**: Change field type to Single Select with exact options

### Auto Number Issues
- **Cause**: Including Image Queue # in API payload
- **Solution**: This field is auto-generated, don't include it in requests

### Permission Errors
- **Cause**: API key doesn't have proper permissions
- **Solution**: Ensure API key has read/write access to the base

## Field Validation Rules

- **Email fields**: Must be valid email format
- **URL fields**: Must be valid URL format
- **Date fields**: Use YYYY-MM-DD format
- **Number fields**: Must be positive integers
- **JSON fields**: Must be valid JSON strings

## Best Practices

1. **Field Naming**: Use exact field names as specified
2. **Data Types**: Match field types exactly
3. **Required Fields**: Always include required fields in API calls
4. **Status Management**: Use the Status field for proper queue tracking
5. **Date Formats**: Stick to YYYY-MM-DD for dates
6. **Error Handling**: Implement proper error handling for API calls

## Support

If you encounter issues:
1. Check the airtable-fields-reference.md for field specifications
2. Verify your API key and base ID
3. Use the test scripts to validate your setup
4. Check Airtable API documentation for field type requirements