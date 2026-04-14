/**
 * reminderCron.js
 * MaterCare Active SMS Notification Engine.
 *
 * Fires every 60 seconds and:
 *   1. Finds pending reminders due within the next 30 minutes where sms_sent = FALSE.
 *   2. Finds scheduled appointments happening tomorrow    where sms_sent = FALSE.
 *   3. Verifies the user has sms_notifications = TRUE and a valid phone number.
 *   4. Dispatches the text via smsService (LIVE or MOCK).
 *   5. Immediately flips sms_sent = TRUE so it never fires twice.
 */

const cron      = require('node-cron');
const db        = require('../config/db');
const { sendSMS, isLiveMode } = require('../services/smsService');

// Use the promise-based pool wrapper
const pool = db.promise();

// ── Helper ────────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const timestamp = () => {
    const d = new Date();
    return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
};

// ── Core job ──────────────────────────────────────────────────────────────────
const runSMSJob = async () => {
    try {
        // ── 1. Reminders due within the next 30 minutes ───────────────────────
        const [reminders] = await pool.query(`
            SELECT
                r.reminder_id,
                r.title,
                r.type,
                r.reminder_date,
                r.reminder_time,
                u.phone,
                u.first_name
            FROM reminder r
            JOIN user u ON r.user_id = u.user_id
            WHERE r.status             = 'pending'
              AND r.sms_sent           = FALSE
              AND u.sms_notifications  = TRUE
              AND u.phone              IS NOT NULL
              AND u.phone              != ''
              AND CONCAT(r.reminder_date, ' ', r.reminder_time)
                  BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        `);

        if (reminders.length > 0) {
            console.log(`${timestamp()} ⏰ Cron: Found ${reminders.length} reminder(s) to notify.`);
        }

        for (const r of reminders) {
            const msg = `Hi ${r.first_name}! 💊 MaterCare Reminder: Your ${r.type} is coming up soon — "${r.title}". Stay healthy! 🌸`;
            await sendSMS(r.phone, msg);
            await pool.query(
                `UPDATE reminder SET sms_sent = TRUE WHERE reminder_id = ?`,
                [r.reminder_id]
            );
        }

        // ── 2. Appointments scheduled for tomorrow ────────────────────────────
        const [appointments] = await pool.query(`
            SELECT
                a.appointment_id,
                d.first_name   AS doc_fn,
                d.last_name    AS doc_ln,
                h.hospital_name,
                da.time_slot,
                u.phone,
                u.first_name
            FROM appointment a
            JOIN pregnancy_profile  pp ON a.pregnancy_id    = pp.pregnancy_id
            JOIN user               u  ON pp.user_id        = u.user_id
            JOIN doctor             d  ON a.doctor_id       = d.doctor_id
            JOIN hospital           h  ON d.hospital_id     = h.hospital_id
            LEFT JOIN doctor_availability da ON a.availability_id = da.availability_id
            WHERE a.status            = 'scheduled'
              AND a.sms_sent          = FALSE
              AND u.sms_notifications = TRUE
              AND u.phone             IS NOT NULL
              AND u.phone             != ''
              AND DATE(a.appointment_date) = CURDATE() + INTERVAL 1 DAY
        `);

        if (appointments.length > 0) {
            console.log(`${timestamp()} 📅 Cron: Found ${appointments.length} appointment reminder(s) for tomorrow.`);
        }

        for (const a of appointments) {
            const slot = a.time_slot || 'confirm with your clinic';
            const msg  = `Hi ${a.first_name}! 🏥 MaterCare Reminder: You have an appointment tomorrow with Dr. ${a.doc_fn} ${a.doc_ln} at ${a.hospital_name} (${slot}). Take care! 🌸`;
            await sendSMS(a.phone, msg);
            await pool.query(
                `UPDATE appointment SET sms_sent = TRUE WHERE appointment_id = ?`,
                [a.appointment_id]
            );
        }

    } catch (error) {
        console.error(`${timestamp()} ❌ SMS Cron error:`, error.message);
    }
};

// ── Scheduler ─────────────────────────────────────────────────────────────────
const startTask = () => {
    const mode = isLiveMode ? '📡 LIVE (Twilio)' : '📋 MOCK (terminal)';

    // Schedule: every 1 minute
    cron.schedule('* * * * *', runSMSJob);

    console.log(`⏰ Active SMS Engine started — checking every 60 s | Mode: ${mode}`);
};

module.exports = { startTask };
