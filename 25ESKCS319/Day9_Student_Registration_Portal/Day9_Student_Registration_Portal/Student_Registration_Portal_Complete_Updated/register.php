<?php
session_start();
require __DIR__ . '/config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

function clean(string $value): string {
    return trim($value);
}

$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$phone = preg_replace('/\D+/', '', $_POST['phone'] ?? '');
$cgpaInput = clean($_POST['cgpa'] ?? '');
$branch = clean($_POST['branch'] ?? '');
$course = clean($_POST['course'] ?? '');
$college = clean($_POST['college'] ?? '');
$address = clean($_POST['address'] ?? '');

$allowedBranches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration'
];
$allowedCourses = ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'MCA', 'MBA'];

$errors = [];

if ($name === '') {
    $errors[] = 'Full name is required.';
} elseif (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    $errors[] = 'Full name must be between 2 and 80 characters.';
} elseif (!preg_match("/^[\p{L}\s.'-]+$/u", $name)) {
    $errors[] = 'Full name must not contain numbers or invalid symbols.';
}

if ($email === '') {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if ($phone === '') {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[0-9]{10}$/', $phone)) {
    $errors[] = 'Phone number must contain exactly 10 digits.';
}

if ($cgpaInput === '') {
    $errors[] = 'CGPA is required.';
} elseif (!is_numeric($cgpaInput)) {
    $errors[] = 'CGPA must be a valid number.';
} else {
    $cgpa = (float) $cgpaInput;
    if ($cgpa < 0 || $cgpa > 10) {
        $errors[] = 'CGPA must be between 0 and 10.';
    }
}

if (!in_array($branch, $allowedBranches, true)) {
    $errors[] = 'Please select a valid branch.';
}

if (!in_array($course, $allowedCourses, true)) {
    $errors[] = 'Please select a valid course.';
}

if ($college === '') {
    $errors[] = 'College name is required.';
} elseif (mb_strlen($college) < 3 || mb_strlen($college) > 120) {
    $errors[] = 'College name must be between 3 and 120 characters.';
}

if ($address === '') {
    $errors[] = 'Address is required.';
} elseif (mb_strlen($address) < 10) {
    $errors[] = 'Address must contain at least 10 characters.';
} elseif (mb_strlen($address) > 500) {
    $errors[] = 'Address must not exceed 500 characters.';
}

$photoFilename = null;

if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Photo upload failed. Please try again.';
    } else {
        $maxSize = 2 * 1024 * 1024;
        $allowedMimeTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if ($_FILES['photo']['size'] > $maxSize) {
            $errors[] = 'Photo must not exceed 2 MB.';
        } else {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($_FILES['photo']['tmp_name']);

            if (!isset($allowedMimeTypes[$mimeType])) {
                $errors[] = 'Photo must be a JPG, PNG or WebP image.';
            } else {
                $extension = $allowedMimeTypes[$mimeType];
                $photoFilename = bin2hex(random_bytes(12)) . '.' . $extension;
            }
        }
    }
}

if (empty($errors)) {
    $check = $pdo->prepare('SELECT id FROM students WHERE email = ? LIMIT 1');
    $check->execute([$email]);

    if ($check->fetch()) {
        $errors[] = 'A student with this email already exists.';
    }
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'cgpa' => $cgpaInput,
        'branch' => $branch,
        'course' => $course,
        'college' => $college,
        'address' => $address
    ];

    header('Location: index.php');
    exit;
}

if ($photoFilename !== null) {
    $uploadDir = __DIR__ . '/uploads';

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destination = $uploadDir . '/' . $photoFilename;

    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $destination)) {
        $_SESSION['errors'] = ['Unable to save the uploaded photo.'];
        $_SESSION['old'] = [
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'cgpa' => $cgpaInput,
            'branch' => $branch,
            'course' => $course,
            'college' => $college,
            'address' => $address
        ];

        header('Location: index.php');
        exit;
    }
}

$stmt = $pdo->prepare(
    'INSERT INTO students
     (name, email, phone, cgpa, branch, course, college, address, photo)
     VALUES
     (:name, :email, :phone, :cgpa, :branch, :course, :college, :address, :photo)'
);

$stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':phone' => $phone,
    ':cgpa' => $cgpa,
    ':branch' => $branch,
    ':course' => $course,
    ':college' => $college,
    ':address' => $address,
    ':photo' => $photoFilename
]);

$_SESSION['success'] = 'Student registered successfully.';
header('Location: index.php');
exit;
