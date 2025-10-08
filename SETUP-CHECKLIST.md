# Airtable Automation Setup Checklist

## Current Status ✅

Your Image Queue table currently has:
- ✅ **Image Title** - Added and populated
- ✅ **Experience Type Airtable Id** - Added and populated (e.g., "recquHAhmVdggGNOp")
- ✅ **Experience Type** - Text field with experience name (e.g., "nature playground")
- ✅ **Image URL** - Cloudinary URL
- ✅ **Image Queue #** - Auto-number for sort order
- ✅ **Upload Date** - Date field

## Required Actions Before Automation Can Work

### 1. Add "Notes" Field to Image Queue Table ⚠️ REQUIRED

**Field Configuration:**
- **Field Name:** "Notes"
- **Field Type:** Long text
- **Purpose:** Stores detailed image information (artist, medium, dimensions, description)
- **Example Value:** "This image is titled Person Who Can No Longer Fly by artist Tetsuya Ishida in 1996. The medium is acrylic on board and the work measures 40 ⅝ × 57 ⅜ inches."

**Why Required:**
- The automation script validates this field
- Maps to `imageInfo` in the backend API
- Backend requires this for the image description

**How to Add:**
1. Go to Image Queue table in Airtable
2. Click "+" to add a new field
3. Choose "Long text" as the field type
4. Name it exactly: "Notes"
5. Save the field

### 2. Optional Fields (Can be added later)

These fields are NOT required for the automation to work, but will be sent to backend if present:

- **Home Blurb Text** (Long text) - Short description for homepage
- **Home Blurb Name** (Single line text) - Attribution initials (e.g., "MJ")
- **Info Link** (URL) - Optional external link

## Testing the Automation

### Step 1: Verify Required Fields are Populated

Before deploying an image to the queue, ensure:

1. **Image Title** ✅ - Must have a value
   - Example: "Beautiful Sunset Over Mountains"

2. **Notes** ⚠️ - Must have a value (add field first!)
   - Example: "Photograph by John Doe, 2024. Digital print, 24x36 inches."

3. **Experience Type Airtable Id** ✅ - Auto-populated by frontend
   - Example: "recquHAhmVdggGNOp"

4. **Image URL** ✅ - Auto-populated by upload
   - Example: "https://res.cloudinary.com/..."

### Step 2: Create Test Record

1. Upload an image through your app
2. Add values to "Image Title" and "Notes" fields
3. Verify "Experience Type Airtable Id" is set
4. Move to deployed queue (this triggers automation)

### Step 3: Check Automation Logs

1. Go to Automations in Airtable
2. Find your "Deploy to Backend" automation
3. Check the run history
4. Look for:
   - ✅ Success logs showing payload sent
   - Backend response status 200
   - "Successfully sent image to backend" message

## Automation Script Summary

The automation will:

1. **Trigger** when a record is created in Image Queue
2. **Validate** required fields (Image Title, Notes, Experience Type Airtable Id, Image URL)
3. **Build payload** with all necessary data
4. **Send POST** to `https://api.contemplay.ai/api/airtable/add-image`
5. **Log results** in Airtable automation console

## Error Handling

If the automation fails, check for these common issues:

### Error: "Image Title is required"
- **Cause:** Image Title field is empty
- **Fix:** Populate the Image Title field before deploying

### Error: "Notes is required"
- **Cause:** Notes field is empty OR doesn't exist
- **Fix:**
  1. Make sure "Notes" field exists in the table
  2. Populate it with image description

### Error: "Experience Type Airtable Id is required"
- **Cause:** The Experience Type Airtable Id field is empty
- **Fix:** Check frontend code - this should be auto-populated based on workspace theme

### Error: "Image URL is required"
- **Cause:** Upload failed or image wasn't saved to Cloudinary
- **Fix:** Re-upload the image

## Field Mapping Reference

| Required Field | Airtable Column | Backend Key | Example |
|----------------|-----------------|-------------|---------|
| ✅ Title | Image Title | `imageName` | "Sunset Scene" |
| ⚠️ Info | Notes | `imageInfo` | "Photo by..." |
| ✅ Type ID | Experience Type Airtable Id | `experienceTypeAirtableId` | "recquHAhmVdggGNOp" |
| ✅ Type Name | Experience Type | `experienceType` | "nature playground" |
| ✅ URL | Image URL | `imageUrl` | "https://res..." |
| ✅ Order | Image Queue # | `sortOrder` | 1 |

## Next Steps

1. ⚠️ **Add "Notes" field** to Image Queue table in Airtable
2. ✅ Copy automation script to Airtable automation
3. ✅ Set trigger to "When record created" on Image Queue table
4. ✅ Test with a sample image
5. ✅ Verify backend receives the data correctly

## Support

If you encounter issues:
1. Check automation run logs in Airtable
2. Verify all required fields are populated
3. Check backend API logs for validation errors
4. Ensure the Experience Type Airtable Id matches expected values:
   - HNP: `recquHAhmVdggGNOp`
   - Art Playground: `recgfbT7nxSsW2Y02`
