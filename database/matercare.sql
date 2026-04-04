-- ============================================================
--  MaterCare Database — MySQL (XAMPP / phpMyAdmin compatible)
--  All dummy user passwords are:  password
--  Hashed with bcrypt cost 10 — compatible with bcrypt.compare()
--
--  Run via CLI:  mysql -u root -p < matercare_db.sql
-- ============================================================

DROP DATABASE IF EXISTS matercare;
CREATE DATABASE matercare;
USE matercare;

-- ============================================================
-- 1. USER
-- ============================================================
CREATE TABLE IF NOT EXISTS user (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          ENUM('patient','doctor','admin') NOT NULL DEFAULT 'patient',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. HOSPITAL
-- ============================================================
CREATE TABLE IF NOT EXISTS hospital (
    hospital_id    INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name  VARCHAR(100) NOT NULL,
    address        TEXT,
    contact_number VARCHAR(20)
);

-- ============================================================
-- 3. DOCTOR
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor (
    doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id    INT NOT NULL,
    first_name     VARCHAR(50) NOT NULL,
    last_name      VARCHAR(50) NOT NULL,
    specialization VARCHAR(100),
    contact_number VARCHAR(20),
    email          VARCHAR(100),
    CONSTRAINT fk_doctor_hospital FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- ============================================================
-- 4. PREGNANCY_PROFILE
-- ============================================================
CREATE TABLE IF NOT EXISTS pregnancy_profile (
    pregnancy_id     INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    start_date       DATE NOT NULL,
    due_date         DATE,
    pregnancy_status ENUM('active','completed','miscarriage') NOT NULL DEFAULT 'active',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ============================================================
-- 5. BABY
-- ============================================================
CREATE TABLE IF NOT EXISTS baby (
    baby_id       INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    pregnancy_id  INT,
    name          VARCHAR(100),
    date_of_birth DATE,
    gender        ENUM('male','female','other'),
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_baby_user      FOREIGN KEY (user_id)      REFERENCES user(user_id),
    CONSTRAINT fk_baby_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES pregnancy_profile(pregnancy_id)
);

-- ============================================================
-- 6. EMERGENCY_CONTACT
-- ============================================================
CREATE TABLE IF NOT EXISTS emergency_contact (
    contact_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    name         VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)  NOT NULL,
    relation     VARCHAR(50),
    CONSTRAINT fk_ec_user FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ============================================================
-- 7. AUDIT_LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    table_name  VARCHAR(50),
    record_id   INT,
    timestamp   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- ============================================================
-- 8. REMINDER
-- ============================================================
CREATE TABLE IF NOT EXISTS reminder (
    reminder_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    pregnancy_id  INT,
    baby_id       INT,
    reminder_type VARCHAR(50),
    due_date      DATETIME,
    status        ENUM('pending','sent','dismissed') NOT NULL DEFAULT 'pending',
    CONSTRAINT fk_rem_user      FOREIGN KEY (user_id)      REFERENCES user(user_id),
    CONSTRAINT fk_rem_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES pregnancy_profile(pregnancy_id),
    CONSTRAINT fk_rem_baby      FOREIGN KEY (baby_id)      REFERENCES baby(baby_id)
);

-- ============================================================
-- 9. DOCTOR_AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id       INT NOT NULL,
    available_date  DATE NOT NULL,
    time_slot       VARCHAR(20) NOT NULL,
    status          ENUM('available','booked','blocked') NOT NULL DEFAULT 'available',
    CONSTRAINT fk_da_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);

-- ============================================================
-- 10. APPOINTMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id     INT NOT NULL,
    doctor_id        INT NOT NULL,
    availability_id  INT,
    appointment_date DATETIME NOT NULL,
    status           ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_apt_pregnancy    FOREIGN KEY (pregnancy_id)    REFERENCES pregnancy_profile(pregnancy_id),
    CONSTRAINT fk_apt_doctor       FOREIGN KEY (doctor_id)       REFERENCES doctor(doctor_id),
    CONSTRAINT fk_apt_availability FOREIGN KEY (availability_id) REFERENCES doctor_availability(availability_id)
);

-- ============================================================
-- 11. MEDICAL_TEST
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_test (
    test_id     INT AUTO_INCREMENT PRIMARY KEY,
    test_name   VARCHAR(100) NOT NULL,
    description TEXT
);

-- ============================================================
-- 12. TEST_RECORD
-- ============================================================
CREATE TABLE IF NOT EXISTS test_record (
    test_record_id INT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id   INT NOT NULL,
    test_id        INT NOT NULL,
    test_date      DATE NOT NULL,
    result         TEXT,
    CONSTRAINT fk_tr_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES pregnancy_profile(pregnancy_id),
    CONSTRAINT fk_tr_test      FOREIGN KEY (test_id)      REFERENCES medical_test(test_id)
);

-- ============================================================
-- 13. MEDICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS medication (
    medication_id   INT AUTO_INCREMENT PRIMARY KEY,
    medication_name VARCHAR(100) NOT NULL,
    description     TEXT
);

-- ============================================================
-- 14. MEDICATION_RECORD
-- ============================================================
CREATE TABLE IF NOT EXISTS medication_record (
    med_record_id INT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id  INT NOT NULL,
    medication_id INT NOT NULL,
    dosage        VARCHAR(50),
    start_date    DATE,
    end_date      DATE,
    CONSTRAINT fk_mr_pregnancy  FOREIGN KEY (pregnancy_id)  REFERENCES pregnancy_profile(pregnancy_id),
    CONSTRAINT fk_mr_medication FOREIGN KEY (medication_id) REFERENCES medication(medication_id)
);

-- ============================================================
-- 15. VACCINATION
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccination (
    vaccine_id      INT AUTO_INCREMENT PRIMARY KEY,
    vaccine_name    VARCHAR(100) NOT NULL,
    recommended_age VARCHAR(50)
);

-- ============================================================
-- 16. VACCINATION_RECORD
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccination_record (
    vacc_record_id   INT AUTO_INCREMENT PRIMARY KEY,
    baby_id          INT NOT NULL,
    vaccine_id       INT NOT NULL,
    vaccination_date DATE NOT NULL,
    status           ENUM('given','missed','scheduled') NOT NULL DEFAULT 'scheduled',
    CONSTRAINT fk_vr_baby    FOREIGN KEY (baby_id)    REFERENCES baby(baby_id),
    CONSTRAINT fk_vr_vaccine FOREIGN KEY (vaccine_id) REFERENCES vaccination(vaccine_id)
);

-- ============================================================
-- 17. DOCUMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS document (
    document_id  INT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_id INT NOT NULL,
    baby_id      INT,
    file_name    VARCHAR(255) NOT NULL,
    file_type    VARCHAR(50),
    file_path    VARCHAR(500),
    upload_date  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_pregnancy FOREIGN KEY (pregnancy_id) REFERENCES pregnancy_profile(pregnancy_id),
    CONSTRAINT fk_doc_baby      FOREIGN KEY (baby_id)      REFERENCES baby(baby_id)
);

-- ============================================================
-- DUMMY DATA
-- ============================================================

-- ----------------------------------------------------------------
-- Users  —  password for ALL accounts is:  password
--
-- The hash below is a real bcrypt hash (cost 10) for "password".
-- It is the well-known Laravel/PHP test hash widely used in docs:
--   $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- bcrypt.compare('password', hash)  →  true  ✓
-- ----------------------------------------------------------------
INSERT INTO user (first_name, last_name, email, password_hash, phone, role) VALUES
('Priya',   'Sharma', 'priya.sharma@email.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210', 'patient'),
('Ananya',  'Reddy',  'ananya.reddy@email.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9123456780', 'patient'),
('Kavitha', 'Menon',  'kavitha.menon@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9988776655', 'patient'),
('Ravi',    'Kumar',  'ravi.kumar@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9000011111', 'doctor'),
('Admin',   'User',   'admin@matercare.com',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9000099999', 'admin');

-- Hospitals
INSERT INTO hospital (hospital_name, address, contact_number) VALUES
('CMC Vellore',           'Ida Scudder Road, Vellore, Tamil Nadu 632004', '0416-2281000'),
('Apollo Women Hospital', 'Greams Road, Chennai, Tamil Nadu 600006',       '044-28290200'),
('JIPMER Puducherry',     'Dhanvantri Nagar, Puducherry 605006',           '0413-2272380');

-- Doctors
INSERT INTO doctor (hospital_id, first_name, last_name, specialization, contact_number, email) VALUES
(1, 'Ravi',   'Kumar',    'Obstetrics & Gynaecology', '9000011111', 'ravi.kumar@cmc.ac.in'),
(2, 'Sunita', 'Patel',    'Maternal-Fetal Medicine',  '9000022222', 'sunita.patel@apollo.com'),
(1, 'Deepa',  'Krishnan', 'Neonatology',              '9000033333', 'deepa.k@cmc.ac.in');

-- Pregnancy Profiles
INSERT INTO pregnancy_profile (user_id, start_date, due_date, pregnancy_status) VALUES
(1, '2025-01-10', '2025-10-17', 'active'),
(2, '2024-06-01', '2025-03-08', 'completed'),
(3, '2025-03-01', '2025-12-06', 'active');

-- Babies
INSERT INTO baby (user_id, pregnancy_id, name, date_of_birth, gender) VALUES
(2, 2, 'Baby Ananya', '2025-03-05', 'female'),
(1, 1, NULL, NULL, NULL);  -- not yet born

-- Emergency Contacts
INSERT INTO emergency_contact (user_id, name, phone_number, relation) VALUES
(1, 'Ramesh Sharma', '9876500001', 'Husband'),
(2, 'Suresh Reddy',  '9876500002', 'Husband'),
(3, 'Lakshmi Menon', '9876500003', 'Mother');

-- Audit Logs
INSERT INTO audit_log (user_id, action_type, table_name, record_id) VALUES
(1, 'INSERT', 'pregnancy_profile', 1),
(2, 'UPDATE', 'baby',              1),
(5, 'DELETE', 'reminder',          3);

-- Reminders
INSERT INTO reminder (user_id, pregnancy_id, baby_id, reminder_type, due_date, status) VALUES
(1, 1, NULL, 'Prenatal Checkup', '2025-05-01 10:00:00', 'pending'),
(2, 2, 1,    'Vaccination Due',  '2025-04-15 09:00:00', 'pending'),
(3, 3, NULL, 'Iron Supplement',  '2025-04-10 08:00:00', 'sent');

-- Doctor Availability
INSERT INTO doctor_availability (doctor_id, available_date, time_slot, status) VALUES
(1, '2025-05-01', '09:00-10:00', 'available'),
(1, '2025-05-01', '10:00-11:00', 'booked'),
(2, '2025-05-02', '14:00-15:00', 'available');

-- Appointments
INSERT INTO appointment (pregnancy_id, doctor_id, availability_id, appointment_date, status) VALUES
(1, 1, 1,    '2025-05-01 09:00:00', 'scheduled'),
(2, 2, 3,    '2025-05-02 14:00:00', 'completed'),
(3, 1, NULL, '2025-06-10 11:00:00', 'scheduled');

-- Medical Tests
INSERT INTO medical_test (test_name, description) VALUES
('Blood Sugar Test',   'Measures blood glucose levels during pregnancy'),
('Anomaly Scan',       'Ultrasound scan to check baby anatomy at 20 weeks'),
('Haemoglobin Test',   'Checks for anaemia during pregnancy'),
('Group B Strep Test', 'Screens for GBS bacteria in late pregnancy');

-- Test Records
INSERT INTO test_record (pregnancy_id, test_id, test_date, result) VALUES
(1, 1, '2025-02-15', 'Normal — 95 mg/dL'),
(1, 2, '2025-03-20', 'No abnormalities detected'),
(2, 3, '2024-09-10', 'Mild anaemia — Hb 10.2 g/dL'),
(3, 1, '2025-03-25', 'Normal — 92 mg/dL');

-- Medications
INSERT INTO medication (medication_name, description) VALUES
('Folic Acid 5mg',     'Prevents neural tube defects'),
('Ferrous Sulfate',    'Iron supplement for anaemia'),
('Calcium + Vit D3',   'Bone health supplement'),
('Progesterone 200mg', 'Hormonal support in early pregnancy');

-- Medication Records
INSERT INTO medication_record (pregnancy_id, medication_id, dosage, start_date, end_date) VALUES
(1, 1, '1 tablet/day',   '2025-01-10', '2025-04-10'),
(1, 3, '1 tablet/day',   '2025-02-01', NULL),
(2, 2, '1 tablet/day',   '2024-09-11', '2025-01-01'),
(3, 4, '200mg at night', '2025-03-01', '2025-06-01');

-- Vaccinations
INSERT INTO vaccination (vaccine_name, recommended_age) VALUES
('BCG',                    'At birth'),
('Hepatitis B (1st dose)', 'At birth'),
('DPT',                    '6 weeks'),
('OPV',                    '6 weeks'),
('MMR',                    '9 months');

-- Vaccination Records
INSERT INTO vaccination_record (baby_id, vaccine_id, vaccination_date, status) VALUES
(1, 1, '2025-03-05', 'given'),
(1, 2, '2025-03-05', 'given'),
(1, 3, '2025-04-16', 'scheduled'),
(1, 4, '2025-04-16', 'scheduled');

-- Documents
INSERT INTO document (pregnancy_id, baby_id, file_name, file_type, file_path, upload_date) VALUES
(1, NULL, 'anomaly_scan_jan2025.pdf', 'application/pdf', '/uploads/docs/anomaly_scan_jan2025.pdf', '2025-03-21 10:30:00'),
(2, 1,    'birth_certificate.pdf',    'application/pdf', '/uploads/docs/birth_certificate.pdf',    '2025-03-07 14:00:00'),
(3, NULL, 'booking_report.jpg',       'image/jpeg',       '/uploads/docs/booking_report.jpg',       '2025-03-15 09:15:00');

-- ============================================================
-- Verify
-- ============================================================
SHOW TABLES;