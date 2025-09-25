Deployed Queue System - Base Overview
This Airtable base is designed to manage an image processing and publishing queue system. It appears to be part of a SaaS application that handles user-uploaded images with scheduled publishing capabilities.

Core Purpose
The system manages the workflow of images from user upload through processing to final publication, while tracking user accounts and their subscription details.

Database Structure
📸 Image Queue Table (6 records)
This is the core operational table that tracks each image through the processing pipeline:

Key Fields:

File Name (Primary) - Unique identifier for each image
User Email - Links images to users
Image URL - Cloudinary-hosted image locations
Upload Date & Publish Date - Scheduling information
Status - Processing state (queued, processing, published, failed)
Priority - Queue ordering system
Processing Time - Performance metrics
Metadata & Notes - Additional image information
👥 Users Table (6 records, 11 fields total)
Manages user accounts and subscription data:

Account Information:

Email (Primary) - User identification
Is Verified - Account verification status
Is Paid - Payment status
Subscription Tier - Free/Basic/Pro plans
Plan Expiry - Subscription end date
Activity Tracking:

Created Date - Account creation
Last Login & Last Activity - User engagement
Total Uploads - Usage metrics
Storage Used - Resource consumption
Preferences - User settings
Current System Status
Active Users: 6 registered users with varying verification and subscription statuses

Image Processing: 6 images in various stages, primarily from two active users (ben@contemplay.ai and bvryn@umich.edu)

Subscription Model: Tiered system with Free, Basic, and Pro levels

This base supports a cloud-based image management service with user accounts, upload queuing, automated processing, and scheduled publishing capabilities.