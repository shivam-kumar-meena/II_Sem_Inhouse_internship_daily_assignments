# Student Registration System

A complete PHP + Bootstrap student registration project.

## Features

- Responsive Bootstrap form
- Fields for name, email, branch, phone, year, gender, and address
- PHP `POST` form processing
- Required-field validation
- Email validation
- Exact 10-digit phone validation
- Safe output using `htmlspecialchars()`
- Friendly error messages
- Old form values preserved after validation errors
- Success confirmation page
- Dynamic student profile card
- Generated student ID
- Print profile button

## Run with XAMPP

1. Extract this project folder.
2. Copy the `student_registration_system` folder into:

   `C:\xampp\htdocs\`

3. Start **Apache** from the XAMPP Control Panel.
4. Open this URL in your browser:

   `http://localhost/student_registration_system/`

## Project Files

- `index.php` — Bootstrap registration form
- `process.php` — PHP processing, validation, and success profile
- `assets/css/style.css` — custom responsive styling

Internet access is required for Bootstrap and Bootstrap Icons CDN.


## Upgrade Features

- Profile photo file input
- Front-end photo preview with placeholder
- Gender radio-button cards
- Required course dropdown
- Required address with minimum length validation
- Name input blocks numbers on the front end
- Gender, course, and address are shown on the PHP confirmation page
- All validation errors appear together in the styled Bootstrap error box

The profile photo is intentionally preview-only, as required by the assignment.
