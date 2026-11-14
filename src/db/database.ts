import * as SQLite from 'expo-sqlite';
import { Category, Filter, Screenshot } from '../types';

// Room equivalent: a local SQLite file. Everything the UI shows comes from here,
// so the app works offline and analysis results are only ever paid for once.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('snapsense.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS screenshots (
          id TEXT PRIMARY KEY NOT NULL,
          asset_id TEXT,
          created_at INTEGER NOT NULL,
          ocr_text TEXT,
          category TEXT,
          summary TEXT,
          is_favorite INTEGER NOT NULL DEFAULT 0,
          reminder_at INTEGER,
          notification_id TEXT
        );
      `);
      return db;
    });
  }
  return dbPromise;
}

// SQLite has no boolean and uses snake_case; convert once here so the rest of the
// app only sees the clean Screenshot type.
type Row = {
  id: string; asset_id: string | null; created_at: number; ocr_text: string | null;
  category: string | null; summary: string | null; is_favorite: number;
  reminder_at: number | null; notification_id: string | null;
};
const toScreenshot = (r: Row): Screenshot => ({
  id: r.id,
  assetId: r.asset_id,
  createdAt: r.created_at,
  ocrText: r.ocr_text,
  category: r.category as Category | null,
  summary: r.summary,
  isFavorite: r.is_favorite === 1,
  reminderAt: r.reminder_at,
  notificationId: r.notification_id,
});

// INSERT OR IGNORE makes syncing safe to repeat: existing rows keep their analysis.
export async function addIfMissing(items: { id: string; assetId: string | null; createdAt: number }[]) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const it of items) {
      await db.runAsync(
        'INSERT OR IGNORE INTO screenshots (id, asset_id, created_at) VALUES (?, ?, ?)',
        it.id, it.assetId, it.createdAt,
      );
    }
  });
}

// One query handles search + filter chips + category chip together.
export async function query(opts: { text: string; filter: Filter; category: Category | null }) {
  const db = await getDb();
  const where: string[] = [];
  const args: (string | number)[] = [];

  if (opts.text.trim()) {
    const like = `%${opts.text.trim()}%`;
    where.push('(ocr_text LIKE ? OR category LIKE ? OR summary LIKE ?)');
    args.push(like, like, like);
  }
  if (opts.filter === 'favorites') where.push('is_favorite = 1');
  if (opts.filter === 'reminders') where.push('reminder_at IS NOT NULL');
  if (opts.category) { where.push('category = ?'); args.push(opts.category); }

  const sql = `SELECT * FROM screenshots ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
  const rows = await db.getAllAsync<Row>(sql, args);
  return rows.map(toScreenshot);
}

export async function getById(id: string) {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM screenshots WHERE id = ?', id);
  return row ? toScreenshot(row) : null;
}

export async function saveAnalysis(id: string, text: string, category: Category, summary: string) {
  const db = await getDb();
  await db.runAsync('UPDATE screenshots SET ocr_text = ?, category = ?, summary = ? WHERE id = ?', text, category, summary, id);
}

export async function setFavorite(id: string, value: boolean) {
  const db = await getDb();
  await db.runAsync('UPDATE screenshots SET is_favorite = ? WHERE id = ?', value ? 1 : 0, id);
}

export async function setReminder(id: string, reminderAt: number | null, notificationId: string | null) {
  const db = await getDb();
  await db.runAsync('UPDATE screenshots SET reminder_at = ?, notification_id = ? WHERE id = ?', reminderAt, notificationId, id);
}

export async function remove(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM screenshots WHERE id = ?', id);
}
