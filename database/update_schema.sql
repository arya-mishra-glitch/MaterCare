-- Step 1: Add profile and settings fields to `user`
ALTER TABLE `user` 
  ADD COLUMN `profile_photo` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `blood_group` VARCHAR(10) DEFAULT NULL,
  ADD COLUMN `email_notifications` BOOLEAN DEFAULT TRUE,
  ADD COLUMN `sms_notifications` BOOLEAN DEFAULT FALSE,
  ADD COLUMN `status` ENUM('active', 'inactive') DEFAULT 'active' NOT NULL;

-- Step 2: Reminders table updates
-- Note: schema.sql had reminder_type, due_date (DATETIME)
-- ReminderController expects: title, type, reminder_date, reminder_time
ALTER TABLE `reminder`
  ADD COLUMN `title` VARCHAR(255) NOT NULL AFTER `baby_id`,
  CHANGE `reminder_type` `type` VARCHAR(50) DEFAULT 'general',
  CHANGE `due_date` `reminder_date` DATE NOT NULL,
  ADD COLUMN `reminder_time` TIME NOT NULL AFTER `reminder_date`,
  ADD COLUMN `sms_sent` BOOLEAN DEFAULT FALSE;

-- Step 2.5: Appointment table updates
ALTER TABLE `appointment`
  ADD COLUMN `sms_sent` BOOLEAN DEFAULT FALSE;


-- Step 3: Symptom Log table
CREATE TABLE IF NOT EXISTS `symptom_log` (
  `symptom_id` INT NOT NULL AUTO_INCREMENT,
  `pregnancy_id` INT NOT NULL,
  `symptom_name` VARCHAR(255) NOT NULL,
  `severity` ENUM('Mild', 'Moderate', 'Severe') NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `logged_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`symptom_id`),

  CONSTRAINT `fk_symptom_pregnancy`
    FOREIGN KEY (`pregnancy_id`)
    REFERENCES `pregnancy_profile` (`pregnancy_id`)
    ON DELETE CASCADE
);

ALTER TABLE baby
ADD COLUMN birth_weight DECIMAL(4,2) NULL,
ADD COLUMN current_weight DECIMAL(4,2) NULL,
ADD COLUMN blood_group VARCHAR(10) NULL,
ADD COLUMN health_status VARCHAR(50) DEFAULT 'Healthy',
ADD COLUMN delivery_type ENUM('normal', 'c-section') NULL;