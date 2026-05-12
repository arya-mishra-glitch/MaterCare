-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 12, 2026 at 07:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `matercare`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointment`
--

CREATE TABLE `appointment` (
  `appointment_id` int(11) NOT NULL,
  `pregnancy_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `availability_id` int(11) DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `status` enum('scheduled','completed','cancelled','missed') NOT NULL DEFAULT 'scheduled',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `sms_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment`
--

INSERT INTO `appointment` (`appointment_id`, `pregnancy_id`, `doctor_id`, `availability_id`, `appointment_date`, `status`, `created_at`, `sms_sent`) VALUES
(1, 1, 0, NULL, '0000-00-00 00:00:00', 'cancelled', '2026-04-04 22:23:26', 0),
(2, 2, 2, 3, '2025-05-02 14:00:00', 'completed', '2026-04-04 22:23:26', 0),
(3, 3, 1, NULL, '2025-06-10 11:00:00', 'scheduled', '2026-04-04 22:23:26', 0),
(7, 1, 0, NULL, '0000-00-00 00:00:00', 'completed', '2026-04-04 23:58:38', 0),
(8, 5, 1, 20, '2026-05-16 00:00:00', 'scheduled', '2026-05-12 09:24:55', 0),
(9, 6, 1, 20, '2026-05-16 00:00:00', 'scheduled', '2026-05-12 15:05:40', 0);

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`log_id`, `user_id`, `action_type`, `table_name`, `record_id`, `timestamp`) VALUES
(1, 1, 'INSERT', 'pregnancy_profile', 1, '2026-04-04 22:23:26'),
(2, 2, 'UPDATE', 'baby', 1, '2026-04-04 22:23:26'),
(3, 5, 'DELETE', 'reminder', 3, '2026-04-04 22:23:26');

-- --------------------------------------------------------

--
-- Table structure for table `baby`
--

CREATE TABLE `baby` (
  `baby_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pregnancy_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `birth_weight` decimal(4,2) DEFAULT NULL,
  `current_weight` decimal(4,2) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `health_status` varchar(50) DEFAULT 'Healthy',
  `delivery_type` enum('normal','c-section') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `baby`
--

INSERT INTO `baby` (`baby_id`, `user_id`, `pregnancy_id`, `name`, `date_of_birth`, `gender`, `created_at`, `birth_weight`, `current_weight`, `blood_group`, `health_status`, `delivery_type`) VALUES
(1, 2, 2, 'Baby Ananya', '2025-03-05', 'female', '2026-04-04 22:23:26', NULL, NULL, NULL, 'Healthy', NULL),
(4, 1, 1, 'Aarav Sharma', '2025-10-17', 'male', '2026-05-12 22:32:28', 3.50, 4.10, 'AB+', 'Healthy', 'c-section'),
(6, 8, 8, 'Asmita sharma', '2025-11-10', 'female', '2026-05-12 23:20:21', 3.45, 3.95, 'AB+', 'Healthy', 'c-section');

-- --------------------------------------------------------

--
-- Table structure for table `doctor`
--

CREATE TABLE `doctor` (
  `doctor_id` int(11) NOT NULL,
  `hospital_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor`
--

INSERT INTO `doctor` (`doctor_id`, `hospital_id`, `first_name`, `last_name`, `specialization`, `contact_number`, `email`) VALUES
(1, 1, 'Ravi', 'Kumar', 'Obstetrics & Gynaecology', '9000011111', 'ravi.kumar@cmc.ac.in'),
(2, 2, 'Sunita', 'Patel', 'Maternal-Fetal Medicine', '9000022222', 'sunita.patel@apollo.com'),
(3, 1, 'Deepa', 'Krishnan', 'Neonatology', '9000033333', 'deepa.k@cmc.ac.in');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_availability`
--

CREATE TABLE `doctor_availability` (
  `availability_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `available_date` date NOT NULL,
  `time_slot` varchar(20) NOT NULL,
  `status` enum('available','booked','blocked') NOT NULL DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_availability`
--

INSERT INTO `doctor_availability` (`availability_id`, `doctor_id`, `available_date`, `time_slot`, `status`) VALUES
(4, 1, '2026-04-06', '09:00-10:00', 'available'),
(5, 1, '2026-04-06', '10:00-11:00', 'available'),
(6, 1, '2026-04-06', '11:00-12:00', 'available'),
(7, 1, '2026-04-09', '09:00-10:00', 'available'),
(8, 1, '2026-04-09', '14:00-15:00', 'available'),
(9, 1, '2026-04-13', '10:00-11:00', 'available'),
(10, 2, '2026-04-07', '14:00-15:00', 'available'),
(11, 2, '2026-04-07', '15:00-16:00', 'available'),
(12, 2, '2026-04-11', '10:00-11:00', 'available'),
(13, 2, '2026-04-11', '11:00-12:00', 'available'),
(14, 2, '2026-04-14', '14:00-15:00', 'available'),
(15, 3, '2026-04-05', '09:00-10:00', 'available'),
(16, 3, '2026-04-05', '10:00-11:00', 'available'),
(17, 3, '2026-04-08', '14:00-15:00', 'available'),
(18, 3, '2026-04-12', '09:00-10:00', 'available'),
(19, 3, '2026-04-12', '11:00-12:00', 'available'),
(20, 1, '2026-05-17', '09:00-10:00', 'booked');

-- --------------------------------------------------------

--
-- Table structure for table `document`
--

CREATE TABLE `document` (
  `document_id` int(11) NOT NULL,
  `pregnancy_id` int(11) NOT NULL,
  `baby_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `upload_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document`
--

INSERT INTO `document` (`document_id`, `pregnancy_id`, `baby_id`, `file_name`, `file_type`, `file_path`, `upload_date`) VALUES
(1, 1, NULL, 'anomaly_scan_jan2025.pdf', 'application/pdf', '/uploads/docs/anomaly_scan_jan2025.pdf', '2025-03-21 10:30:00'),
(2, 2, 1, 'birth_certificate.pdf', 'application/pdf', '/uploads/docs/birth_certificate.pdf', '2025-03-07 14:00:00'),
(3, 3, NULL, 'booking_report.jpg', 'image/jpeg', '/uploads/docs/booking_report.jpg', '2025-03-15 09:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contact`
--

CREATE TABLE `emergency_contact` (
  `contact_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `relation` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_contact`
--

INSERT INTO `emergency_contact` (`contact_id`, `user_id`, `name`, `phone_number`, `relation`) VALUES
(1, 1, 'Ramesh Sharma', '9876500001', 'Husband'),
(2, 2, 'Suresh Reddy', '9876500002', 'Husband'),
(3, 3, 'Lakshmi Menon', '9876500003', 'Mother'),
(4, 2, 'Ananya', '9123456780', 'Reddy'),
(5, 6, 'Ananya', '9123456780', 'Reddy'),
(6, 6, 'Ananya', '9123456780', 'Friend'),
(7, 7, 'Akshat', '9129129121', 'Spouse');

-- --------------------------------------------------------

--
-- Table structure for table `hospital`
--

CREATE TABLE `hospital` (
  `hospital_id` int(11) NOT NULL,
  `hospital_name` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hospital`
--

INSERT INTO `hospital` (`hospital_id`, `hospital_name`, `address`, `contact_number`) VALUES
(1, 'CMC Vellore', 'Ida Scudder Road, Vellore, Tamil Nadu 632004', '0416-2281000'),
(2, 'Apollo Women Hospital', 'Greams Road, Chennai, Tamil Nadu 600006', '044-28290200'),
(3, 'JIPMER Puducherry', 'Dhanvantri Nagar, Puducherry 605006', '0413-2272380');

-- --------------------------------------------------------

--
-- Table structure for table `medical_test`
--

CREATE TABLE `medical_test` (
  `test_id` int(11) NOT NULL,
  `test_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_test`
--

INSERT INTO `medical_test` (`test_id`, `test_name`, `description`) VALUES
(1, 'Blood Sugar Test', 'Measures blood glucose levels during pregnancy'),
(2, 'Anomaly Scan', 'Ultrasound scan to check baby anatomy at 20 weeks'),
(3, 'Haemoglobin Test', 'Checks for anaemia during pregnancy'),
(4, 'Group B Strep Test', 'Screens for GBS bacteria in late pregnancy');

-- --------------------------------------------------------

--
-- Table structure for table `medication`
--

CREATE TABLE `medication` (
  `medication_id` int(11) NOT NULL,
  `medication_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medication`
--

INSERT INTO `medication` (`medication_id`, `medication_name`, `description`) VALUES
(1, 'Folic Acid 5mg', 'Prevents neural tube defects'),
(2, 'Ferrous Sulfate', 'Iron supplement for anaemia'),
(3, 'Calcium + Vit D3', 'Bone health supplement'),
(4, 'Progesterone 200mg', 'Hormonal support in early pregnancy');

-- --------------------------------------------------------

--
-- Table structure for table `medication_record`
--

CREATE TABLE `medication_record` (
  `med_record_id` int(11) NOT NULL,
  `pregnancy_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medication_record`
--

INSERT INTO `medication_record` (`med_record_id`, `pregnancy_id`, `medication_id`, `dosage`, `start_date`, `end_date`) VALUES
(1, 1, 1, '1 tablet/day', '2025-01-10', '2025-04-10'),
(2, 1, 3, '1 tablet/day', '2025-02-01', NULL),
(3, 2, 2, '1 tablet/day', '2024-09-11', '2025-01-01'),
(4, 3, 4, '200mg at night', '2025-03-01', '2025-06-01'),
(5, 1, 4, '1 tablet/ 2 times day', '2026-04-05', '2026-04-07'),
(6, 5, 3, '1 tablet/ 2 times day', '2026-05-11', '2026-05-13'),
(7, 6, 1, '1 tablet/ 2 times day', '2026-05-12', '2026-05-14');

-- --------------------------------------------------------

--
-- Table structure for table `pregnancy_profile`
--

CREATE TABLE `pregnancy_profile` (
  `pregnancy_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `pregnancy_status` enum('active','completed','miscarriage') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pregnancy_profile`
--

INSERT INTO `pregnancy_profile` (`pregnancy_id`, `user_id`, `start_date`, `due_date`, `pregnancy_status`, `created_at`) VALUES
(1, 1, '2025-01-10', '2025-10-17', 'completed', '2026-04-04 22:23:26'),
(2, 2, '2024-06-01', '2025-03-08', 'active', '2026-04-04 22:23:26'),
(3, 3, '2025-03-01', '2025-12-06', 'active', '2026-04-04 22:23:26'),
(6, 6, '2026-01-01', '2026-10-19', 'active', '2026-05-12 14:58:26'),
(7, 7, '2025-12-11', '2026-09-17', 'active', '2026-05-12 23:15:19'),
(8, 8, '2025-02-03', '2025-11-10', 'completed', '2026-05-12 23:19:45');

-- --------------------------------------------------------

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `reminder_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pregnancy_id` int(11) DEFAULT NULL,
  `baby_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `reminder_date` date NOT NULL,
  `reminder_time` time NOT NULL,
  `status` enum('pending','done','dismissed') NOT NULL DEFAULT 'pending',
  `sms_sent` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reminder`
--

INSERT INTO `reminder` (`reminder_id`, `user_id`, `pregnancy_id`, `baby_id`, `title`, `type`, `reminder_date`, `reminder_time`, `status`, `sms_sent`) VALUES
(1, 1, NULL, NULL, 'Vaccination', 'appointment', '2026-05-13', '10:00:00', 'done', 0),
(2, 6, NULL, NULL, 'Take medicine', 'medication', '2026-05-12', '10:20:00', 'done', 1),
(3, 6, 4, NULL, 'Test SMS Reminder', 'general', '2026-05-12', '10:05:18', 'done', 1),
(4, 6, NULL, NULL, 'hydrate', 'water', '2026-05-12', '15:24:00', 'pending', 0);

-- --------------------------------------------------------

--
-- Table structure for table `symptom_log`
--

CREATE TABLE `symptom_log` (
  `symptom_id` int(11) NOT NULL,
  `pregnancy_id` int(11) NOT NULL,
  `symptom_name` varchar(255) NOT NULL,
  `severity` enum('Mild','Moderate','Severe') NOT NULL,
  `notes` text DEFAULT NULL,
  `logged_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `symptom_log`
--

INSERT INTO `symptom_log` (`symptom_id`, `pregnancy_id`, `symptom_name`, `severity`, `notes`, `logged_at`) VALUES
(3, 6, 'Fatigue', 'Mild', NULL, '2026-05-12 09:36:00');

-- --------------------------------------------------------

--
-- Table structure for table `test_record`
--

CREATE TABLE `test_record` (
  `test_record_id` int(11) NOT NULL,
  `pregnancy_id` int(11) NOT NULL,
  `test_id` int(11) NOT NULL,
  `test_date` date NOT NULL,
  `result` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_record`
--

INSERT INTO `test_record` (`test_record_id`, `pregnancy_id`, `test_id`, `test_date`, `result`) VALUES
(1, 1, 1, '2025-02-15', 'Normal — 95 mg/dL'),
(2, 1, 2, '2025-03-20', 'No abnormalities detected'),
(3, 2, 3, '2024-09-10', 'Mild anaemia — Hb 10.2 g/dL'),
(4, 3, 1, '2025-03-25', 'Normal — 92 mg/dL'),
(5, 1, 1, '2026-04-04', 'Normal'),
(6, 1, 2, '2026-04-03', NULL),
(7, 5, 1, '2026-05-12', 'Normal'),
(8, 6, 3, '2026-05-01', '11.5');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `role` enum('patient','doctor','admin') NOT NULL DEFAULT 'patient',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `profile_photo`, `blood_group`, `email_notifications`, `sms_notifications`, `status`, `role`, `created_at`) VALUES
(1, 'Priya', 'Sharma', 'priya.sharma@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210', NULL, NULL, 1, 1, 'active', 'patient', '2026-04-04 22:23:26'),
(2, 'Ananya', 'Reddy', 'ananya.reddy@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9123456780', NULL, 'B+', 1, 1, 'active', 'patient', '2026-04-04 22:23:26'),
(3, 'Kavitha', 'Menon', 'kavitha.menon@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9988776655', NULL, NULL, 1, 1, 'active', 'patient', '2026-04-04 22:23:26'),
(4, 'Ravi', 'Kumar', 'ravi.kumar@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9000011111', NULL, NULL, 1, 1, 'active', 'doctor', '2026-04-04 22:23:26'),
(5, 'Admin', 'User', 'admin@matercare.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9000099999', NULL, NULL, 1, 1, 'active', 'admin', '2026-04-04 22:23:26'),
(6, 'Arya', 'Mishra', 'aryamishra@email.com', '$2b$10$/JMP1DfyveSHe0tM.bgLPOicKPzGRd0Lkr1lZEVTTxxjJFGshPMk.', NULL, NULL, 'B+', 1, 0, 'active', 'patient', '2026-05-12 08:58:39'),
(7, 'Bhavya', 'Mishra', 'bhavyamishra@email.com', '$2b$10$CV7gWeM/GSCKEhEHnhrwwODfuXIhMRLewRz0tIBKltghoZe1l3Qk.', '1231231231', NULL, 'O+', 1, 0, 'active', 'patient', '2026-05-12 23:14:11'),
(8, 'Shreya', 'Sharma', 'shreyasharma@email.com', '$2b$10$MdcAwX3UY84nczmzdwuza.OXfGhN0T6eLbworArFlmP8vtVDoYzV2', '987654321', NULL, 'AB+', 1, 0, 'active', 'patient', '2026-05-12 23:19:14');

-- --------------------------------------------------------

--
-- Table structure for table `vaccination`
--

CREATE TABLE `vaccination` (
  `vaccine_id` int(11) NOT NULL,
  `vaccine_name` varchar(100) NOT NULL,
  `recommended_age` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vaccination`
--

INSERT INTO `vaccination` (`vaccine_id`, `vaccine_name`, `recommended_age`) VALUES
(1, 'BCG', 'At birth'),
(2, 'Hepatitis B (1st dose)', 'At birth'),
(3, 'DPT', '6 weeks'),
(4, 'OPV', '6 weeks'),
(5, 'MMR', '9 months');

-- --------------------------------------------------------

--
-- Table structure for table `vaccination_record`
--

CREATE TABLE `vaccination_record` (
  `vacc_record_id` int(11) NOT NULL,
  `baby_id` int(11) NOT NULL,
  `vaccine_id` int(11) NOT NULL,
  `vaccination_date` date NOT NULL,
  `status` enum('given','missed','scheduled') NOT NULL DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vaccination_record`
--

INSERT INTO `vaccination_record` (`vacc_record_id`, `baby_id`, `vaccine_id`, `vaccination_date`, `status`) VALUES
(1, 1, 1, '2025-03-05', 'given'),
(2, 1, 2, '2025-03-05', 'given'),
(3, 1, 3, '2025-04-16', ''),
(4, 1, 4, '2025-04-16', ''),
(5, 2, 1, '2026-04-05', 'scheduled'),
(6, 4, 1, '2026-05-12', 'scheduled'),
(7, 6, 5, '2026-05-13', 'scheduled');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointment`
--
ALTER TABLE `appointment`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `fk_apt_pregnancy` (`pregnancy_id`),
  ADD KEY `fk_apt_doctor` (`doctor_id`),
  ADD KEY `fk_apt_availability` (`availability_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_al_user` (`user_id`);

--
-- Indexes for table `baby`
--
ALTER TABLE `baby`
  ADD PRIMARY KEY (`baby_id`),
  ADD KEY `fk_baby_user` (`user_id`),
  ADD KEY `fk_baby_pregnancy` (`pregnancy_id`);

--
-- Indexes for table `doctor`
--
ALTER TABLE `doctor`
  ADD PRIMARY KEY (`doctor_id`),
  ADD KEY `fk_doctor_hospital` (`hospital_id`);

--
-- Indexes for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `fk_da_doctor` (`doctor_id`);

--
-- Indexes for table `document`
--
ALTER TABLE `document`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `fk_doc_pregnancy` (`pregnancy_id`),
  ADD KEY `fk_doc_baby` (`baby_id`);

--
-- Indexes for table `emergency_contact`
--
ALTER TABLE `emergency_contact`
  ADD PRIMARY KEY (`contact_id`),
  ADD KEY `fk_ec_user` (`user_id`);

--
-- Indexes for table `hospital`
--
ALTER TABLE `hospital`
  ADD PRIMARY KEY (`hospital_id`);

--
-- Indexes for table `medical_test`
--
ALTER TABLE `medical_test`
  ADD PRIMARY KEY (`test_id`);

--
-- Indexes for table `medication`
--
ALTER TABLE `medication`
  ADD PRIMARY KEY (`medication_id`);

--
-- Indexes for table `medication_record`
--
ALTER TABLE `medication_record`
  ADD PRIMARY KEY (`med_record_id`);

--
-- Indexes for table `pregnancy_profile`
--
ALTER TABLE `pregnancy_profile`
  ADD PRIMARY KEY (`pregnancy_id`);

--
-- Indexes for table `reminder`
--
ALTER TABLE `reminder`
  ADD PRIMARY KEY (`reminder_id`);

--
-- Indexes for table `symptom_log`
--
ALTER TABLE `symptom_log`
  ADD PRIMARY KEY (`symptom_id`),
  ADD KEY `fk_symptom_pregnancy` (`pregnancy_id`);

--
-- Indexes for table `test_record`
--
ALTER TABLE `test_record`
  ADD PRIMARY KEY (`test_record_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `vaccination`
--
ALTER TABLE `vaccination`
  ADD PRIMARY KEY (`vaccine_id`);

--
-- Indexes for table `vaccination_record`
--
ALTER TABLE `vaccination_record`
  ADD PRIMARY KEY (`vacc_record_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointment`
--
ALTER TABLE `appointment`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `baby`
--
ALTER TABLE `baby`
  MODIFY `baby_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `doctor`
--
ALTER TABLE `doctor`
  MODIFY `doctor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `document`
--
ALTER TABLE `document`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `emergency_contact`
--
ALTER TABLE `emergency_contact`
  MODIFY `contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `hospital`
--
ALTER TABLE `hospital`
  MODIFY `hospital_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `medical_test`
--
ALTER TABLE `medical_test`
  MODIFY `test_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `medication`
--
ALTER TABLE `medication`
  MODIFY `medication_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `medication_record`
--
ALTER TABLE `medication_record`
  MODIFY `med_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `pregnancy_profile`
--
ALTER TABLE `pregnancy_profile`
  MODIFY `pregnancy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `reminder`
--
ALTER TABLE `reminder`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `symptom_log`
--
ALTER TABLE `symptom_log`
  MODIFY `symptom_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `test_record`
--
ALTER TABLE `test_record`
  MODIFY `test_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `vaccination`
--
ALTER TABLE `vaccination`
  MODIFY `vaccine_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `vaccination_record`
--
ALTER TABLE `vaccination_record`
  MODIFY `vacc_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `symptom_log`
--
ALTER TABLE `symptom_log`
  ADD CONSTRAINT `fk_symptom_pregnancy` FOREIGN KEY (`pregnancy_id`) REFERENCES `pregnancy_profile` (`pregnancy_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
