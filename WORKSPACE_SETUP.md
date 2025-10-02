# Workspace Setup Guide

## 1. Create Workspaces Table

Create a new table in your Airtable base called `Workspaces` with these fields:

### Workspaces Table Fields

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Workspace ID** | Single line text | Primary field | Auto-generated unique ID |
| **Name** | Single line text | Required | Workspace display name |
| **Theme** | Single select | Required | Options: default, homegrownnationalpark |
| **Password Hash** | Single line text | Required | Bcrypt hashed password (handled by app) |
| **Owner Email** | Email | Required | Creator's email |
| **Created Date** | Date | Required | YYYY-MM-DD format |
| **Member Emails** | Long text | Optional | JSON array of member emails |
| **Settings** | Long text | Optional | JSON for workspace settings |

### Theme Options
- `default`
- `homegrownnationalpark`

## 2. Update Users Table

Add these fields to your existing `Users` table:

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Workspace ID** | Single line text | Optional | Link to workspace |
| **Workspaces** | Long text | Optional | JSON array of workspace IDs user has access to |

## 3. Update Image Queue Table

Add this field to your existing `Image Queue` table:

| Field Name | Field Type | Configuration | Notes |
|------------|------------|---------------|-------|
| **Workspace ID** | Single line text | Optional | Link to workspace |

## 4. Testing

After setup, test with:
1. Create a workspace with password
2. Add team members
3. Verify theme applies correctly
4. Test image uploads are workspace-scoped
