# Airtable Setup Instructions

## 1. Create Your Airtable Base

1. Go to [Airtable.com](https://airtable.com) and sign in
2. Create a new base called "Image Uploader Queue"
3. Copy your Base ID from the URL (it looks like: `appXXXXXXXXXXXXXX`)

## 2. Create Required Tables

### Users Table
Create a table called "Users" with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Email | Single line text | - |
| Is Verified | Checkbox | - |
| Is Paid | Checkbox | - |
| Subscription Tier | Single select | Free, Basic, Pro |
| Created Date | Date | - |
| Last Login | Date | - |

### Image Queue Table
Create a table called "Image Queue" with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| User Email | Single line text | - |
| Image URL | URL | - |
| File Name | Single line text | - |
| File Size | Number | - |
| Status | Single select | Queued, Processing, Published, Failed |
| Upload Date | Date | - |
| Publish Date | Date | - |
| Priority | Number | - |
| Notes | Long text | - |

## 3. Environment Configuration

Create a `.env.local` file in your project root:

```env
AIRTABLE_API_KEY=pat7OlfrIjGxb9zT4.70dffbf37f8a9ff8e823b9d38fb01890e335cc5ee3eb2ce4e5e59a7e067619e0
AIRTABLE_BASE_ID=your_base_id_here
```

Replace `your_base_id_here` with your actual Base ID.

## 4. Test the Integration

1. Start your development server: `npm run dev`
2. Go to the upload page
3. Enter your email and upload an image
4. Check your Airtable base to see the queued image

## 5. API Key Security

Your API key is already configured. Make sure to:
- Never commit `.env.local` to version control
- Use environment variables in production
- Rotate your API key periodically

## 6. Next Steps

Once the basic integration is working, you can:
- Add payment verification
- Implement automated publishing
- Add user management features
- Set up webhooks for status updates 