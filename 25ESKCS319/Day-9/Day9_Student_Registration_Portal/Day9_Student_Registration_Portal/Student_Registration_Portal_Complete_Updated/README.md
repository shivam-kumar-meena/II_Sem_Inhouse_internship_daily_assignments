# Student Registration Portal — Complete Updated Version

This version fully implements all requested additions.

## Added Fields

- `photo` — stored filename
- `address` — TEXT
- `course` — VARCHAR(100)
- `date_registered` — TIMESTAMP

## Included Features

- Bootstrap registration form
- PHP server-side validation
- MySQL storage
- Secure prepared statements
- Duplicate email prevention
- Real image upload to `uploads/`
- Image type and size validation
- Address and course validation
- Responsive Bootstrap table
- Photo, address, course and registration date displayed in table
- Student record counter
- Highest CGPA row highlighted in green
- Professional navbar and responsive UI

## Fresh Installation

1. Extract the ZIP.
2. Copy `Student_Registration_Portal_Complete_Updated` into:

   `C:\xampp\htdocs\`

3. Start Apache and MySQL.
4. Open phpMyAdmin:

   `http://localhost/phpmyadmin`

5. Import `database.sql`.
6. Open:

   `http://localhost/Student_Registration_Portal_Complete_Updated/`

## Updating an Existing Database

If the old `student_portal` database and `students` table already exist, import:

`upgrade_existing_database.sql`

Then use this updated project folder.

## Default Database Settings

- Host: `localhost`
- Database: `student_portal`
- Username: `root`
- Password: empty

Edit `config/database.php` only when your MySQL settings are different.

## Upload Permissions

The project includes an `uploads` folder. On XAMPP/Windows it should work automatically.
