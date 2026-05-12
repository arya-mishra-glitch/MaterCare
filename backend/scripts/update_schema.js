const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function updateDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'matercare'
  });

  const queries = [
    `ALTER TABLE user ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;`,
    `ALTER TABLE user ADD COLUMN blood_group VARCHAR(10) DEFAULT NULL;`,
    `ALTER TABLE user ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;`,
    `ALTER TABLE user ADD COLUMN sms_notifications BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE user ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' NOT NULL;`,
    `ALTER TABLE reminder ADD COLUMN title VARCHAR(255) NOT NULL AFTER baby_id;`,
    `ALTER TABLE reminder CHANGE due_date reminder_date DATE NOT NULL;`,
    `ALTER TABLE reminder ADD COLUMN reminder_time TIME NOT NULL AFTER reminder_date;`,
    `ALTER TABLE reminder CHANGE reminder_type type VARCHAR(50) DEFAULT 'general';`,
    `ALTER TABLE reminder ADD COLUMN sms_sent BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE appointment ADD COLUMN sms_sent BOOLEAN DEFAULT FALSE;`
  ];

  for (let q of queries) {
    try {
      await connection.query(q);
      console.log('Success:', q);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Already exists:', q);
      } else {
        console.error('Error on:', q, '->', e.message);
      }
    }
  }

  await connection.end();
}

updateDb();
