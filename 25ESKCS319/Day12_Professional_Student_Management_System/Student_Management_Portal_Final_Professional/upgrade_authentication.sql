USE student_management;
CREATE TABLE IF NOT EXISTS users (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(120) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 profile_picture VARCHAR(255) DEFAULT NULL,
 last_login DATETIME DEFAULT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (name,email,password)
SELECT 'Administrator','admin@example.com','$2y$12$ooLkHA2rJNH5ay7s6HR9K.afZgvY5Vsxmsd7QPfjIvY9/1nxfEWfe'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@example.com');
