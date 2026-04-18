-- OpenSchool Fee Management System
-- Database Schema

CREATE DATABASE IF NOT EXISTS openschool CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE openschool;

-- Schools table (multi-school support)
CREATE TABLE schools (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo VARCHAR(255),
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Admin users
CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Students
CREATE TABLE students (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id INT UNSIGNED NOT NULL,
    qr_token CHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    school_year VARCHAR(20) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    photo VARCHAR(255),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    validity_start DATE NOT NULL,
    validity_end DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_qr_token (qr_token),
    INDEX idx_school_year (school_id, school_year)
) ENGINE=InnoDB;

-- Fee structure per school/grade/year
CREATE TABLE fee_structures (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id INT UNSIGNED NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    quarter_1_fee DECIMAL(10,2) DEFAULT 0,
    quarter_2_fee DECIMAL(10,2) DEFAULT 0,
    quarter_3_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY uk_school_year_grade (school_id, academic_year, grade)
) ENGINE=InnoDB;

-- Payments
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    fee_type ENUM('registration', 'quarter_1', 'quarter_2', 'quarter_3') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_slip', 'mobile_money') DEFAULT 'cash',
    bank_slip_file VARCHAR(255),
    notes TEXT,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT UNSIGNED,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_student_fee (student_id, fee_type)
) ENGINE=InnoDB;

-- Grace periods / favors
CREATE TABLE grace_periods (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    fee_type ENUM('registration', 'quarter_1', 'quarter_2', 'quarter_3') NOT NULL,
    message TEXT,
    deadline DATE,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Biometric readiness (future)
CREATE TABLE biometric_data (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL UNIQUE,
    fingerprint_hash VARCHAR(512),
    card_uid VARCHAR(100),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Classes
CREATE TABLE classes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    school_id INT UNSIGNED NOT NULL,
    category ENUM('preschool', 'elementary') NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY uk_school_class (school_id, name)
) ENGINE=InnoDB;

-- Seed: default school
INSERT INTO schools (name, address, academic_year) VALUES ('Demo School', '123 Main Street', '2025-2026');
INSERT INTO admins (school_id, name, email, password, role) VALUES (1, 'Admin', 'admin@openschool.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');
-- Default password: password
