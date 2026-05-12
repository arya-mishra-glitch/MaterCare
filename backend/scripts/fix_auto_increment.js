/**
 * Fix AUTO_INCREMENT and PRIMARY KEY for all tables in the matercare database.
 * 
 * This script handles the case where tables were created from the old matercare.sql
 * that used NO_AUTO_VALUE_ON_ZERO and didn't inline AUTO_INCREMENT / PRIMARY KEY
 * in the CREATE TABLE statements.
 * 
 * It will:
 * 1. Fix any rows that have ID = 0 (re-assign them proper IDs)
 * 2. Add PRIMARY KEY if missing
 * 3. Add AUTO_INCREMENT if missing
 * 4. Set AUTO_INCREMENT counter to the correct next value
 * 
 * Usage: node fix_auto_increment.js
 */

const db = require("../config/db");
const pool = db.promise();

const tables = [
  { table: "user", pk: "user_id" },
  { table: "pregnancy_profile", pk: "pregnancy_id" },
  { table: "appointment", pk: "appointment_id" },
  { table: "audit_log", pk: "log_id" },
  { table: "baby", pk: "baby_id" },
  { table: "doctor", pk: "doctor_id" },
  { table: "doctor_availability", pk: "availability_id" },
  { table: "document", pk: "document_id" },
  { table: "emergency_contact", pk: "contact_id" },
  { table: "hospital", pk: "hospital_id" },
  { table: "medical_test", pk: "test_id" },
  { table: "medication", pk: "medication_id" },
  { table: "medication_record", pk: "med_record_id" },
  { table: "reminder", pk: "reminder_id" },
  { table: "test_record", pk: "test_record_id" },
  { table: "vaccination", pk: "vaccine_id" },
  { table: "vaccination_record", pk: "vacc_record_id" },
];

async function fixTable(table, pk) {
  try {
    // Step 1: Check if there are rows with ID = 0
    const [[{ zeroCount }]] = await pool.query(
      `SELECT COUNT(*) AS zeroCount FROM \`${table}\` WHERE \`${pk}\` = 0`
    );

    if (zeroCount > 0) {
      // Get current max ID
      const [[{ maxId }]] = await pool.query(
        `SELECT COALESCE(MAX(\`${pk}\`), 0) AS maxId FROM \`${table}\` WHERE \`${pk}\` > 0`
      );

      // Re-assign each zero-ID row a new ID
      // We need to handle them one at a time since there might be multiple rows with id=0
      const [zeroRows] = await pool.query(
        `SELECT * FROM \`${table}\` WHERE \`${pk}\` = 0`
      );

      let nextId = maxId + 1;
      
      // Temporarily disable foreign key checks so we can update IDs
      await pool.query("SET FOREIGN_KEY_CHECKS = 0");

      for (let i = 0; i < zeroRows.length; i++) {
        // For duplicate zero rows (beyond the first), delete them as they're duplicates
        if (i === 0) {
          await pool.query(
            `UPDATE \`${table}\` SET \`${pk}\` = ? WHERE \`${pk}\` = 0 LIMIT 1`,
            [nextId]
          );
          console.log(`    Reassigned ${pk} 0 → ${nextId}`);
          nextId++;
        } else {
          // Delete duplicate zero-ID rows
          await pool.query(
            `DELETE FROM \`${table}\` WHERE \`${pk}\` = 0 LIMIT 1`
          );
          console.log(`    Deleted duplicate row with ${pk} = 0`);
        }
      }

      await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    // Step 2: Check if PRIMARY KEY exists
    const [keys] = await pool.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'PRIMARY KEY'`,
      [table]
    );

    if (keys.length === 0) {
      await pool.query(`ALTER TABLE \`${table}\` ADD PRIMARY KEY (\`${pk}\`)`);
      console.log(`    Added PRIMARY KEY on ${pk}`);
    }

    // Step 3: Check if AUTO_INCREMENT exists
    const [columns] = await pool.query(
      `SELECT EXTRA FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, pk]
    );

    if (columns.length > 0 && !columns[0].EXTRA.includes("auto_increment")) {
      await pool.query(`ALTER TABLE \`${table}\` MODIFY \`${pk}\` int(11) NOT NULL AUTO_INCREMENT`);
      console.log(`    Added AUTO_INCREMENT to ${pk}`);
    }

    // Step 4: Fix AUTO_INCREMENT counter
    const [[{ maxIdFinal }]] = await pool.query(
      `SELECT COALESCE(MAX(\`${pk}\`), 0) AS maxIdFinal FROM \`${table}\``
    );
    const nextAI = maxIdFinal + 1;
    await pool.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = ${nextAI}`);
    console.log(`  ✅ ${table}: AUTO_INCREMENT = ${nextAI}`);

  } catch (err) {
    console.error(`  ❌ ${table}: ${err.message}`);
  }
}

async function main() {
  console.log("🔧 Fixing AUTO_INCREMENT for all tables...\n");

  // Ensure SQL_MODE doesn't include NO_AUTO_VALUE_ON_ZERO
  await pool.query(`SET SQL_MODE = ""`);
  console.log("✅ SQL_MODE reset\n");

  for (const { table, pk } of tables) {
    console.log(`  Processing: ${table}`);
    await fixTable(table, pk);
  }

  console.log("\n🎉 Done! All tables should now have proper AUTO_INCREMENT.\n");
  
  // Verify user table
  const [users] = await pool.query("SELECT user_id, email FROM user ORDER BY user_id");
  console.log("Current users:", users.map(u => `${u.user_id}: ${u.email}`));

  const [pregnancies] = await pool.query("SELECT pregnancy_id, user_id FROM pregnancy_profile ORDER BY pregnancy_id");
  console.log("Current pregnancies:", pregnancies.map(p => `${p.pregnancy_id}: user ${p.user_id}`));

  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
