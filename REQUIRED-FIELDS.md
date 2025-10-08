# Required Fields for Airtable Automation

## ⚠️ REQUIRED FIELDS (Must be populated before deploying to queue)

The automation script validates these fields and will **throw an error** if any are missing:

### 1. **Image Title** ✅ ADDED
- **Field Type:** Single line text
- **Airtable Field Name:** "Image Title"
- **Backend Payload Key:** `imageName`
- **Example:** "Person Who Can No Longer Fly"
- **Validation:** Automation will fail if empty
- **Purpose:** The name/title of the image shown in the experience

### 2. **Notes** ⚠️ CHECK IF EXISTS
- **Field Type:** Long text
- **Airtable Field Name:** "Notes"
- **Backend Payload Key:** `imageInfo`
- **Example:** "This image is titled Person Who Can No Longer Fly by artist Tetsuya Ishida in 1996. The medium is acrylic on board and the work measures 40 ⅝ × 57 ⅜ inches."
- **Validation:** Automation will fail if empty
- **Purpose:** Full description of the image including artist, medium, dimensions, etc.

### 3. **Experience Type Airtable Id** ✅ ADDED
- **Field Type:** Single line text
- **Airtable Field Name:** "Experience Type Airtable Id"
- **Backend Payload Key:** `experienceTypeAirtableId`
- **Example:** "recquHAhmVdggGNOp" (for HNP workspace)
- **Validation:** Automation will fail if empty
- **Purpose:** Links the image to the correct experience type in the backend
- **Auto-populated by:** Frontend when images are uploaded with workspace theme

### 4. **Image URL** ✅ ALREADY EXISTS
- **Field Type:** URL or Text field
- **Airtable Field Name:** "Image URL"
- **Backend Payload Key:** `imageUrl`
- **Example:** "https://res.cloudinary.com/dyeywnxdi/image/upload/v1759954187/..."
- **Validation:** Automation will fail if empty
- **Purpose:** The actual image URL from Cloudinary
- **Auto-populated by:** Upload flow after successful Cloudinary upload

---

## Optional Fields (Can be empty, backend has defaults)

These fields are sent to the backend but can be `null`:

### 5. **Home Blurb Text**
- **Field Type:** Long text
- **Backend Payload Key:** `homeBlurbText`
- **Example:** "A man is stuck inside an immobile airplane with a propeller attached to his head..."
- **Can be empty:** Yes - backend has defaults

### 6. **Home Blurb Name**
- **Field Type:** Single line text
- **Backend Payload Key:** `homeBlurbName`
- **Example:** "MJ"
- **Can be empty:** Yes - backend has defaults

### 7. **Info Link**
- **Field Type:** URL
- **Backend Payload Key:** `infoLink`
- **Example:** "https://example.com/more-info"
- **Can be empty:** Yes (optional feature)

---

## Auto-Populated Fields

These are set automatically by the system:

### 8. **Experience Type** ✅ ALREADY EXISTS
- **Field Type:** Text (or linked record)
- **Backend Payload Key:** `experienceType`
- **Example:** "nature playground"
- **Auto-populated by:** Frontend based on workspace theme

### 9. **Image Queue #** ✅ ALREADY EXISTS
- **Field Type:** Number (auto-number)
- **Backend Payload Key:** `sortOrder`
- **Purpose:** Determines the order images appear in the experience
- **Auto-populated by:** Airtable

### 10. **Upload Date** ✅ ALREADY EXISTS
- **Field Type:** Date
- **Backend Payload Key:** `createdAt`
- **Auto-populated by:** Frontend when image is uploaded

---

## Always Set by Automation (Hardcoded)

These values are always the same and set by the automation script:

- **`isLive`**: Always `true`
- **`oldAssistantId`**: Always `null`
- **`contemplaytions`**: Always empty array `[]`
- **`substitutions`**: Always empty array `[]`
- **`updatedAt`**: Current timestamp when automation runs

---

## Summary Checklist

Before an image can be deployed to the queue and sent to the backend, ensure:

- [ ] **Image Title** is filled in
- [ ] **Notes** field has content (artist info, description, etc.)
- [ ] **Experience Type Airtable Id** is set (auto-populated by frontend)
- [ ] **Image URL** exists (auto-populated by upload)

If any of these are missing, the automation will **throw an error** and the image will not be sent to the backend.

---

## Field Mapping Reference

| Airtable Field | Backend Key | Required | Example |
|----------------|-------------|----------|---------|
| Record ID | `airtableId` | ✅ Auto | "recABC123" |
| Image Title | `imageName` | ✅ | "Beautiful Sunset" |
| Notes | `imageInfo` | ✅ | "Artist: Jane Doe..." |
| Experience Type Airtable Id | `experienceTypeAirtableId` | ✅ | "recquHAhmVdggGNOp" |
| Experience Type | `experienceType` | ✅ Auto | "nature playground" |
| Image URL | `imageUrl` | ✅ Auto | "https://res.cloudinary..." |
| Image Queue # | `sortOrder` | ✅ Auto | 1 |
| Upload Date | `createdAt` | ✅ Auto | "2025-10-08T..." |
| Home Blurb Text | `homeBlurbText` | ❌ | "A stunning view..." |
| Home Blurb Name | `homeBlurbName` | ❌ | "JD" |
| Info Link | `infoLink` | ❌ | "https://..." |
| N/A | `updatedAt` | ✅ Auto | "2025-10-08T..." |
| N/A | `isLive` | ✅ Auto | true |
| N/A | `oldAssistantId` | ✅ Auto | null |
| N/A | `contemplaytions` | ✅ Auto | [] |
| N/A | `substitutions` | ✅ Auto | [] |
