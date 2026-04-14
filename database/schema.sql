CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    profile_photo VARCHAR(255),
    blood_group VARCHAR(10),
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    status ENUM('active','inactive') DEFAULT 'active',
    role ENUM('patient','doctor','admin') DEFAULT 'patient'
);

CREATE TABLE Pregnancy_Profile (
    pregnancy_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    start_date DATE,
    due_date DATE,
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Doctor (
    doctor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    specialization VARCHAR(100),
    contact VARCHAR(15)
);

CREATE TABLE Hospital (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(100)
);

CREATE TABLE Appointment (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    pregnancy_id INT,
    doctor_id INT,
    hospital_id INT,
    status VARCHAR(50),
    FOREIGN KEY (pregnancy_id) REFERENCES Pregnancy_Profile(pregnancy_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id),
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id)
);

CREATE TABLE Reminder (
    reminder_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    pregnancy_id INT,
    baby_id INT,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    reminder_date DATE NOT NULL,
    reminder_time TIME NOT NULL,
    status ENUM('pending','done','dismissed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);