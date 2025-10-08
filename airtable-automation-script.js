// Airtable Automation Script for Image Queue Table
// This script runs when a new record is added to the Image Queue table
// It sends the image data to the backend API for processing

// Get triggering record
let inputConfig = input.config();
let recordId = inputConfig.id;
const table = base.getTable("Image Queue");

// Select full record, all fields
const record = await table.selectRecordAsync(recordId);
await sendPayload(record);

async function sendPayload(record) {
    if (!record) {
        console.log('No record found');
        return;
    }

    console.log('Processing record:', record.id);

    // Get required fields first and validate
    let imageTitle = record.getCellValue("Image Title");
    let experienceTypeAirtableId = record.getCellValue("Experience Type Airtable Id");
    let experienceTypeRecord = record.getCellValue("Experience Type");
    let imageUrlField = record.getCellValue("Image URL");
    let notes = record.getCellValue("Notes");

    // Validate required fields
    if (!imageTitle) {
        console.error('❌ REQUIRED FIELD MISSING: Image Title is required');
        throw new Error('Image Title is required before pushing to backend');
    }

    if (!notes) {
        console.error('❌ REQUIRED FIELD MISSING: Notes is required');
        throw new Error('Notes is required before pushing to backend');
    }

    if (!experienceTypeAirtableId) {
        console.error('❌ REQUIRED FIELD MISSING: Experience Type Airtable Id is required');
        throw new Error('Experience Type Airtable Id is required before pushing to backend');
    }

    // Handle Image URL - could be attachment or text field
    let imageUrl = null;
    if (Array.isArray(imageUrlField) && imageUrlField.length > 0) {
        imageUrl = imageUrlField[0].url;
    } else if (typeof imageUrlField === 'string') {
        imageUrl = imageUrlField;
    }

    if (!imageUrl) {
        console.error('❌ REQUIRED FIELD MISSING: Image URL is required');
        throw new Error('Image URL is required before pushing to backend');
    }

    // Get experience type name (text value)
    let experienceType = null;
    if (experienceTypeRecord) {
        if (Array.isArray(experienceTypeRecord) && experienceTypeRecord.length > 0) {
            experienceType = experienceTypeRecord[0].name.toLowerCase();
        } else if (typeof experienceTypeRecord === 'string') {
            experienceType = experienceTypeRecord.toLowerCase();
        }
    }

    console.log('✅ Image Title:', imageTitle);
    console.log('✅ Notes:', notes);
    console.log('✅ Experience Type:', experienceType);
    console.log('✅ Experience Type Airtable ID:', experienceTypeAirtableId);
    console.log('✅ Image URL:', imageUrl);

    // Get queue position for sort order
    let sortOrder = record.getCellValue("Image Queue #");

    console.log('Sort Order (Queue #):', sortOrder);

    // Construct payload matching the backend API expectations
    let payload = {
        airtableId: record.id,
        experienceTypeAirtableId: experienceTypeAirtableId,
        experienceType: experienceType,
        imageUrl: imageUrl,
        contemplaytions: [], // Empty array as specified
        substitutions: [], // Empty array as specified
        isLive: true, // Always true for deployed queue items
        imageName: imageTitle, // Required - from Image Title field
        imageInfo: notes, // Required - from Notes field
        homeBlurbText: record.getCellValue("Home Blurb Text") || null,
        homeBlurbName: record.getCellValue("Home Blurb Name") || null,
        oldAssistantId: null, // Always null as specified
        infoLink: record.getCellValue("Info Link") || null,
        sortOrder: sortOrder,
        createdAt: record.getCellValue("Upload Date") || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Send POST request to backend
    try {
        let response = await fetch("https://api.contemplay.ai/api/airtable/add-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        // Log backend response
        let result = await response.text();
        console.log("Response status:", response.status);
        console.log("Response from backend:", result);

        if (!response.ok) {
            console.error("❌ Backend returned error:", result);
        } else {
            console.log("✅ Successfully sent image to backend");
        }
    } catch (error) {
        console.error("❌ Error sending to backend:", error);
    }
}
