// server.js (Без изменений)
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
    rejectUnauthorized: false // Эта опция может потребоваться на Render
  }
});

// --- ДЕМО-ПОЛЬЗОВАТЕЛИ ДЛЯ БЭКЕНДА ---
const demoUsers = [
  { id: "admin_id", username: "admin", password: "password123", role: "general_admin", name: "Admin" }, // Роль изменена на general_admin
  { id: "arman_id", username: "arman", password: "password123", role: "super_admin", name: "Arman" },   // Новая роль super_admin
  { id: "kymbat_id", username: "kymbat", password: "password123", role: "teacher", name: "Қымбат" },
  { id: "daniyal_r_id", username: "daniyal_r", password: "password123", role: "rop", name: "Даниал" },
  // Добавьте других демо-пользователей по мере необходимости
];

// --- Middleware для имитации аутентификации (Basic Auth) ---
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        req.user = null;
        return next();
    }

    const [type, credentials] = authHeader.split(' ');
    if (type === 'Basic' && credentials) {
        try {
            const decoded = Buffer.from(credentials, 'base64').toString('utf8');
            const [username, password] = decoded.split(':');
            const user = demoUsers.find(u => u.username === username && u.password === password);
            if (user) {
                req.user = user;
            } else {
                req.user = null;
            }
        } catch (error) {
            console.error('Error decoding Basic Auth credentials:', error);
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};

// Middleware для проверки роли 'general_admin' или 'super_admin'
const authorizeGeneralAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'general_admin' && req.user.role !== 'super_admin')) {
        return res.status(403).json({ message: 'Доступ запрещен. Требуется роль администратора.' });
    }
    next();
};

// Новый Middleware для проверки роли 'super_admin' (только Арман)
const authorizeSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Доступ запрещен. Требуется роль супер-администратора.' });
    }
    next();
};

// Примените middleware для аутентификации ко всем запросам
app.use(authenticateUser);

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
    await pool.query(entriesTableQuery);
    await pool.query(blockedSlotsTableQuery);
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

// Добавление заявки (доступно РОПам, general_admin и super_admin)
app.post('/api/entries', async (req, res) => {
  if (!req.user || (req.user.role !== 'general_admin' && req.user.role !== 'super_admin' && req.user.role !== 'rop')) {
      return res.status(403).json({ message: 'Доступ запрещен. Только администраторы и РОПы могут добавлять заявки.' });
  }
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

// Маршрут для удаления заявки - ТОЛЬКО ДЛЯ СУПЕР-АДМИНА (АРМАНА)
app.delete('/api/entries/:id', authorizeSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteResult = await pool.query('DELETE FROM entries WHERE id = $1 RETURNING *', [id]);

    if (deleteResult.rowCount > 0) {
      res.status(200).json({ message: 'Тіркелгі сәтті жойылды', deletedId: id });
    } else {
      res.status(404).send("Тіркелгі табылмады");
    }
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).send("Сервер қатесі");
  }
});

// Маршрут для обновления заявки - ДЛЯ GENERAL_ADMIN, SUPER_ADMIN И НАЗНАЧЕННОГО УЧИТЕЛЯ
app.put('/api/entries/:id', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован.' });
    }

    try {
        const { id } = req.params;
        const { status, trialDate, assignedTeacher, assignedTime, paymentType, packageType, paymentAmount } = req.body;
        
        // Логика авторизации на уровне данных
        if (req.user.role !== 'general_admin' && req.user.role !== 'super_admin') {
            const currentEntryResult = await pool.query('SELECT "assignedTeacher" FROM entries WHERE id = $1', [id]);
            if (currentEntryResult.rows.length === 0) {
                return res.status(404).send("Entry not found");
            }
            const currentAssignedTeacher = currentEntryResult.rows[0].assignedTeacher;

            if (req.user.role === 'teacher' && currentAssignedTeacher !== req.user.name) {
                return res.status(403).json({ message: 'Вам разрешено редактировать только ваши назначенные уроки.' });
            } else if (req.user.role === 'rop' || req.user.role === 'public') {
                return res.status(403).json({ message: 'У вас нет прав на изменение записей.' });
            }
        }
        
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

// --- МАРШРУТЫ ДЛЯ ЗАБЛОКИРОВАННЫХ СЛОТОВ ---

app.get('/api/blocked-slots', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM blocked_slots');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching blocked slots:', err);
        res.status(500).send("Server Error");
    }
});

app.post('/api/blocked-slots', authorizeGeneralAdmin, async (req, res) => { // Обновлено
    try {
        const { id, date, teacher, time } = req.body;
        const newSlot = await pool.query(
            'INSERT INTO blocked_slots (id, date, teacher, time) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, date, teacher, time]
        );
        res.json(newSlot.rows[0]);
    } catch (err) {
        console.error('Error blocking slot:', err);
        res.status(500).send("Server Error");
    }
});

app.delete('/api/blocked-slots/:id', authorizeGeneralAdmin, async (req, res) => { // Обновлено
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

// --- ЗАПУСК СЕРВЕРА ---
app.listen(port, () => {
  initializeDatabase().then(() => {
    console.log(`Server is running on port ${port}`);
  });
});
