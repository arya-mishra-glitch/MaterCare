CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    password VARCHAR(255)
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