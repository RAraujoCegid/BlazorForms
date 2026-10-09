const Database = require("better-sqlite3")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const migrationDir = path.join(__dirname, "..", "prisma", "migrations", "20261001221629_add_ux_effort")
const sql = fs.readFileSync(path.join(migrationDir, "migration.sql"), "utf8")
const checksum = crypto.createHash("sha256").update(sql).digest("hex")

for (const dbPath of ["Data/dev.db", "Data/prod.db"]) {
  const full = path.join(__dirname, "..", dbPath)
  const db = new Database(full)
  const already = db.prepare(`SELECT 1 FROM _prisma_migrations WHERE migration_name = ?`).get("20261001221629_add_ux_effort")
  if (already) {
    console.log(dbPath, "-> migration already applied, skipping")
    db.close()
    continue
  }
  const now = Date.now()
  db.exec(sql)
  db.prepare(
    `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)`
  ).run(crypto.randomUUID(), checksum, now, "20261001221629_add_ux_effort", now)
  const sample = db.prepare(`SELECT id, className, uxEffort FROM Form LIMIT 3`).all()
  console.log(dbPath, "-> OK", JSON.stringify(sample))
  db.close()
}
