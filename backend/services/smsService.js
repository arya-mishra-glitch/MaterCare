/**
 * smsService.js
 * Centralized SMS dispatcher for MaterCare.
 *
 * LIVE MODE:  Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
 *             in your .env file. Real SMS will be sent via Twilio.
 *
 * MOCK MODE:  Leave the Twilio env vars blank. A beautiful receipt will be
 *             printed to the backend terminal instead. Perfect for portfolios
 *             and development without spend.
 */

const twilio = require('twilio');
require('dotenv').config();

// ── Twilio client initialisation ──────────────────────────────────────────────
const accountSid    = process.env.TWILIO_ACCOUNT_SID;
const authToken     = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber  = process.env.TWILIO_PHONE_NUMBER;

let client = null;
const isLiveMode = accountSid && authToken && twilioNumber;

if (isLiveMode) {
    client = twilio(accountSid, authToken);
    console.log('📡 SMS Service: LIVE MODE — Twilio credentials loaded. Real SMS will be sent.');
} else {
    console.log('📋 SMS Service: MOCK MODE — No Twilio credentials found. SMS will be simulated in terminal.');
}

// ── ANSI colour helpers (works in all modern terminals) ───────────────────────
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

/**
 * Sends an SMS to the given phone number.
 * Automatically switches between Twilio live delivery and mock terminal logging.
 *
 * @param {string} to      - Recipient phone number (E.164 format recommended, e.g. +919876543210)
 * @param {string} message - The SMS body text
 */
const sendSMS = async (to, message) => {
    if (!to) {
        console.warn(`${YELLOW}⚠️  [SMS SKIPPED] No phone number provided — skipping send.${RESET}`);
        return;
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    if (isLiveMode) {
        // ── LIVE: Send via Twilio ─────────────────────────────────────────────
        try {
            const result = await client.messages.create({
                body: message,
                from: twilioNumber,
                to: to
            });
            console.log(`${GREEN}${BOLD}✅ [TWILIO SMS DELIVERED]${RESET} SID: ${result.sid} → ${to} at ${timestamp}`);
        } catch (error) {
            console.error(`\x1b[31m❌ [TWILIO SMS FAILED]${RESET} to ${to}: ${error.message}`);
        }
    } else {
        // ── MOCK: Print a beautiful receipt in the terminal ───────────────────
        console.log(`\n${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${RESET}`);
        console.log(`${GREEN}${BOLD}║         📱  MOCK SMS DELIVERED  📱              ║${RESET}`);
        console.log(`${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${RESET}`);
        console.log(`${CYAN}  📞 To      :${RESET} ${to}`);
        console.log(`${CYAN}  🕐 Time    :${RESET} ${timestamp}`);
        console.log(`${CYAN}  💬 Message :${RESET} ${message}`);
        console.log(`${GREEN}${BOLD}══════════════════════════════════════════════════${RESET}\n`);
    }
};

module.exports = { sendSMS, isLiveMode };
