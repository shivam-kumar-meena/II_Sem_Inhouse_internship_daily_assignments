CREATE DATABASE IF NOT EXISTS student_portal
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE student_portal;

CREATE TABLE IF NOT EXISTS students (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    college VARCHAR(120) NOT NULL,
    address TEXT NOT NULL,
    photo VARCHAR(255) DEFAULT NULL,
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_name (name),
    INDEX idx_student_cgpa (cgpa),
    INDEX idx_date_registered (date_registered)
);
