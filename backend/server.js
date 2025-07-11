// Этот код предназначен для работы с базой данных PostgreSQL на Render.
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ТАБЛИЦ ---
const initializeDatabase = async () => {
  const entriesTableQuery = `
    CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        "clientName" TEXT,
        phone TEXT,
        "trialDate" TEXT,
        "trialTime" TEXT,
        rop TEXT,
        source TEXT,
        comment TEXT,
        status TEXT,
        "createdAt" TIMESTAMPTZ,
        "assignedTeacher" TEXT,
        "assignedTime" TEXT,
        "paymentType" TEXT,
        "packageType" TEXT,
        "paymentAmount" NUMERIC
    );
  `;
  const blockedSlotsTableQuery = `
    CREATE TABLE IF NOT EXISTS blocked_slots (
        id TEXT PRIMARY KEY,
        date TEXT,
        teacher TEXT,
        time TEXT
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(entriesTableQuery);
    await client.query(blockedSlotsTableQuery);
    client.release();
    console.log('Database tables are ready.');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

// --- МАРШРУТЫ (API) ---

app.get('/api/entries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM entries ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).send("Server Error");
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const { clientName, phone, trialDate, trialTime, rop, source, comment, status, createdAt } = req.body;
    const newEntry = await pool.query(
      'INSERT INTO entries ("clientName", phone, "trialDate", "trialTime", rop, source, comment, status, "createdAt", "assignedTeacher", "assignedTime", "paymentType", "packageType", "paymentAmount") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, NULL, NULL, NULL, 0) RETURNING *',
      [clientName, phone, trialDate, trialTime, rop, source, comment, status, createdAt]
    );
    res.json(newEntry.rows[0]);
  } catch (err) {
    console.error('Error creating entry:', err);
    res.status(500).send("Server Error");
  }
});

app.put('/api/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trialDate, assignedTeacher, assignedTime, paymentType, packageType, paymentAmount } = req.body;

        const updatedEntry = await pool.query(
            `UPDATE entries SET 
                status = $1, 
                "trialDate" = $2, 
                "assignedTeacher" = $3, 
                "assignedTime" = $4, 
                "paymentType" = $5, 
                "packageType" = $6, 
                "paymentAmount" = $7 
            WHERE id = $8 RETURNING *`,
            [status, trialDate, assignedTeacher, assignedTime, paymentType, packageType, paymentAmount, id]
        );

        if (updatedEntry.rows.length > 0) {
            res.json(updatedEntry.rows[0]);
        } else {
            res.status(404).send("Entry not found");
        }
    } catch (err) {
        console.error('Error updating entry:', err);
        res.status(500).send("Server Error");
    }
});

app.get('/api/blocked-slots', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blocked_slots');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching blocked slots:', err);
        res.status(500).send("Server Error");
    }
});

app.post('/api/blocked-slots', async (req, res) => {
    try {
        const { id, date, teacher, time } = req.body;
        const newSlot = await pool.query(
            'INSERT INTO blocked_slots (id, date, teacher, time) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING RETURNING *',
            [id, date, teacher, time]
        );
        res.json(newSlot.rows[0]);
    } catch (err) {
        console.error('Error blocking slot:', err);
        res.status(500).send("Server Error");
    }
});

app.delete('/api/blocked-slots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM blocked_slots WHERE id = $1', [id]);
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error unblocking slot:', err);
        res.status(500).send("Server Error");
    }
});


app.get('/', (req, res) => {
    res.send('Backend for Akcent CRM is working!');
});

app.listen(port, () => {
  initializeDatabase().then(() => {
    console.log(`Server is running on port ${port}`);
  });
});