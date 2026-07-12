CREATE DATABASE IF NOT EXISTS student_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management;
CREATE TABLE IF NOT EXISTS students(
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
 status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
 date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_name(name),INDEX idx_email(email),INDEX idx_branch(branch),INDEX idx_course(course),INDEX idx_cgpa(cgpa),INDEX idx_status(status)
);
