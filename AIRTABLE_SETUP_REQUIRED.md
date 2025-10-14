# ⚠️ AIRTABLE SETUP REQUIRED

## What I Built

I've completed the dashboard with experience-based filtering! Here's what works now:

### ✅ Features Implemented:

1. **Experience Type Filtering**
   - Dashboard now filters images by experience type (e.g., "hnp" for Homegrown National Park)
   - Only shows images matching the user's current theme

2. **Left Card - "Players & Images"**
   - Shows thumbnail + username for each uploaded image
   - Scrollable list of recent uploads
   - Click a user to filter the activity feed
   - Shows approval status with ✓ badge

3. **Right Card - "Activity Feed"**
   - Shows upload and approval events
   - Filters to show only selected user's activity when clicked
   - Displays thumbnails, timestamps, and user info
   - Click "Show all activity" to reset filter

4. **Upload System Updated**
   - Now automatically captures `experienceType` based on theme
   - Captures `Owner` field (defaults to user email, can be edited)
   - All metadata properly tagged for filtering

---

## 🚨 REQUIRED: Manual Airtable Field Setup

Your **Image Queue** table in Airtable is missing fields. You need to add these **manually** in the Airtable UI:

### Fields to Add to "Image Queue" Table:

| Field Name | Type | Settings |
|------------|------|----------|
| **Owner** | Single Line Text | - |
| **Experience Type** | Single Select | Options: `hnp`, `general`, `nature`, `earth`, `adventure`, `wellness` |
| **Approved** | Checkbox | Default: `false` |
| **User Email** | Email | - |
| **Image URL** | URL | - |
| **File Name** | Single Line Text | - |
| **File Size** | Number | Integer |
| **Upload Date** | Date | Format: YYYY-MM-DD |
| **Publish Date** | Date | Format: YYYY-MM-DD (optional) |
| **Notes** | Long Text | - |
| **Tags** | Multiple Select | Add options as needed |
| **Metadata** | Long Text | For JSON data |

### How to Add Fields:

1. Go to your Airtable base: https://airtable.com/apps4ZTtBg4oTHLUz
2. Open the **"Image Queue"** table
3. Click the **"+"** button to add each field
4. Set the **Field Type** and **Field Name** exactly as shown above
5. For **Experience Type**: Add options: `hnp`, `general`, `nature`, `earth`, etc.

---

## 📝 What Happens Next

Once you add the fields:

1. **Upload images** from the `/upload` page with an HNP-themed email
2. Images will automatically be tagged with `experienceType: "hnp"`
3. **Dashboard** will filter to show only HNP images
4. **Click on a user** in the left card to see their specific activity

---

## 🎯 Experience Type Mapping

Current theme-to-experience mappings:

- **Homegrown National Park** → `experienceType: "hnp"`
- **Default** → `experienceType: "general"`

You can add more in [lib/themes.ts](lib/themes.ts#L161)

---

## 🔍 Testing Checklist

After adding the fields:

- [ ] Upload an image while using HNP theme
- [ ] Check that `Experience Type` is set to "hnp" in Airtable
- [ ] Check that `Owner` field is populated
- [ ] Go to `/dashboard` and verify images appear in left card
- [ ] Click a user and verify right card filters to show only their activity
- [ ] Try with a different theme/experience type to verify filtering works

---

## Need Help?

Check [airtable-fields-reference.md](airtable-fields-reference.md) for full field documentation.
