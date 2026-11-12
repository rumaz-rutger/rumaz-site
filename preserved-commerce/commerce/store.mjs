// A separate Postgres database is required for hosted testing. Never use production credentials.
export const schema = `CREATE TABLE IF NOT EXISTS rumaz_test_orders (
 id TEXT PRIMARY KEY, request_hash TEXT NOT NULL, data TEXT NOT NULL,
 payment_id TEXT UNIQUE, checkout_url TEXT, status TEXT NOT NULL DEFAULT 'created',
 created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL
);`;
export function postgresStore(pool) {
  return {
    async create(row) {
      await pool.query('INSERT INTO rumaz_test_orders (id,request_hash,data,created_at,updated_at) VALUES ($1,$2,$3,$4,$4) ON CONFLICT (id) DO NOTHING',[row.id,row.request_hash,JSON.stringify(row.data),row.created_at]);
      return this.get(row.id);
    },
    async get(id) { const {rows}=await pool.query('SELECT * FROM rumaz_test_orders WHERE id=$1',[id]);return decode(rows[0]); },
    async attach(id,paymentId,url) {
      const r=await pool.query('UPDATE rumaz_test_orders SET payment_id=$2,checkout_url=COALESCE($3,checkout_url),updated_at=$4 WHERE id=$1 AND (payment_id IS NULL OR payment_id=$2)',[id,paymentId,url,Date.now()]);
      if(!r.rowCount) throw new Error('Payment association conflict');
    },
    async status(id,paymentId,status) {
      await pool.query("UPDATE rumaz_test_orders SET status=CASE WHEN status='paid' THEN 'paid' ELSE $3 END, updated_at=$4 WHERE id=$1 AND payment_id=$2",[id,paymentId,status,Date.now()]);
    }
  };
}
const decode = row => row ? {...row,data:JSON.parse(row.data),created_at:Number(row.created_at)} : null;
export async function sqliteStore(path) {
  const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(path);
  db.exec('PRAGMA journal_mode=WAL;');db.exec(schema);
  return {
    async create(r) { db.prepare('INSERT INTO rumaz_test_orders (id,request_hash,data,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING').run(r.id,r.request_hash,JSON.stringify(r.data),r.created_at,r.created_at);return this.get(r.id); },
    async get(id) { return decode(db.prepare('SELECT * FROM rumaz_test_orders WHERE id=?').get(id)); },
    async attach(id,pid,url) { const r=db.prepare('UPDATE rumaz_test_orders SET payment_id=?,checkout_url=COALESCE(?,checkout_url),updated_at=? WHERE id=? AND (payment_id IS NULL OR payment_id=?)').run(pid,url,Date.now(),id,pid);if(!r.changes)throw new Error('Payment association conflict'); },
    async status(id,pid,status) {db.prepare("UPDATE rumaz_test_orders SET status=CASE WHEN status='paid' THEN 'paid' ELSE ? END,updated_at=? WHERE id=? AND payment_id=?").run(status,Date.now(),id,pid);},
    close(){db.close();}
  };
}
