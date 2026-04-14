const db = require('./config/db');
const p = db.promise();
async function run() {
    await p.query("UPDATE user SET phone='+19999999999', sms_notifications=TRUE WHERE user_id=6");
    await p.query("INSERT INTO reminder (user_id, title, type, reminder_date, reminder_time) VALUES (6, 'Take Prenatal Vitamins', 'Medication', CURDATE(), ADDTIME(CURTIME(), '00:01:30'))");
    console.log('Mock reminder added 1.5 minutes from now!');
    process.exit();
}
run();
