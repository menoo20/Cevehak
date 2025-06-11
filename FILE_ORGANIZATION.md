# File Organization System

## Overview
The CV to Website service now uses an organized file structure where each user gets their own dedicated folder for uploaded files.

## Folder Structure
```
public/uploads/
├── user_email_timestamp1/
│   ├── profile_image_original_name.jpg
│   ├── portfolio_files_project1.pdf
│   ├── portfolio_files_project2.jpg
│   └── testimonial_files_recommendation.pdf
├── user_email_timestamp2/
│   ├── profile_image_photo.png
│   └── portfolio_files_portfolio.pdf
└── .gitkeep
```

## Implementation Details

### User Folder Naming Convention
- Format: `user_{sanitized_email}_{timestamp}`
- Example: `user_john_doe_example_com_1749645123456`
- Email sanitization: Replace non-alphanumeric characters with underscores
- Timestamp: Unix timestamp for uniqueness

### File Naming Convention
- Format: `{field_name}_{original_filename}`
- Examples:
  - `profile_image_headshot.jpg`
  - `portfolio_files_project_design.pdf`
  - `testimonial_files_recommendation.pdf`

### Database Storage
Files are stored in the database with their full relative path:
- `profile_image`: `user_email_timestamp/profile_image_filename.jpg`
- `portfolio_files`: `user_email_timestamp/file1.pdf,user_email_timestamp/file2.jpg`
- `testimonial_files`: `user_email_timestamp/recommendation.pdf`

### Benefits
1. **Organization**: Each client has their own folder
2. **Scalability**: Easy to manage thousands of users
3. **Security**: Isolated file storage per user
4. **Maintenance**: Easy to identify and manage user files
5. **Backup**: Can backup individual user folders
6. **Cleanup**: Easy to remove old submissions

### File Access
Files are accessible via the `/uploads/` endpoint:
- `http://localhost:3000/uploads/user_email_timestamp/profile_image_photo.jpg`

### Backward Compatibility
The system maintains compatibility with existing files in the root uploads folder while organizing new uploads in user-specific folders.
