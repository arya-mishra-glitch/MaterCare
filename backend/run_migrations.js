const db = require('./config/db');

const q2 = `ALTER TABLE reminder
  ADD COLUMN title VARCHAR(255) NOT NULL,
  CHANGE reminder_type type VARCHAR(50) DEFAULT 'general',
  CHANGE due_date reminder_date DATE NOT NULL,
  ADD COLUMN reminder_time TIME NOT NULL;`;

    db.query(q2, (err2) => {
        if (err2) {
             if (err2.code === 'ER_DUP_FIELDNAME') console.log('Reminder fields already exist');
             else console.error(err2);
        } else {
             console.log('Reminder table updated');
        }
        process.exit();
    });
