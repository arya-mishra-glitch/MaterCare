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
  ADD COLUMN `reminder_time` TIME NOT NULL AFTER `reminder_date`;
