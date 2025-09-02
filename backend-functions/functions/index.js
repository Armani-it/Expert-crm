const { onRequest } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Point Admin SDK at your RTDB instance explicitly
admin.initializeApp({
  databaseURL: 'https://expert-academy.firebaseio.com'
});
const db = admin.database();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- Вспомогалка: безопасный чтение списка как массива объектов ---
const snapshotToArray = (snap) => {
  const val = snap.val() || {};
  return Object.entries(val).map(([id, obj]) => ({ id, ...obj }));
};

// --- ROOT ---
app.get('/', (req, res) => {
  res.send('Backend for Akcent CRM is working (Firebase)!');
});

// --- ENTRIES ---

// GET /entries  (отсортированы по createdAt DESC)
app.get('/api/entries', async (req, res) => {
  try {
    const ref = db.ref('entries');
    const snap = await ref.orderByChild('createdAt').once('value');
    const list = snapshotToArray(snap).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json(list);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).send('Server Error');
  }
});

// POST /entries
app.post('/api/entries', async (req, res) => {
  try {
    const {
      clientName, phone, trialDate, trialTime, rop, source,
      comment, status, createdAt, score
    } = req.body;

    const ref = db.ref('entries').push();
    const payload = {
      clientName: clientName || null,
      phone: phone || null,
      trialDate: trialDate || null,
      trialTime: trialTime || null,
      rop: rop || null,
      source: source || null,
      comment: comment || null,
      status: status || null,
      createdAt: typeof createdAt === 'number'
        ? createdAt
        : admin.database.ServerValue.TIMESTAMP,
      assignedTeacher: null,
      assignedTime: null,
      paymentType: null,
      packageType: null,
      paymentAmount: 0,
      score: score || null
    };

    await ref.set(payload);
    const snap = await ref.once('value');
    res.json({ id: ref.key, ...snap.val() });
  } catch (err) {
    console.error('Error creating entry:', err);
    res.status(500).send('Server Error');
  }
});

// PUT /entries/:id
app.put('/api/entries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, trialDate, assignedTeacher, assignedTime,
      paymentType, packageType, paymentAmount
    } = req.body;

    const ref = db.ref(`entries/${id}`);
    const snap = await ref.once('value');
    if (!snap.exists()) return res.status(404).send('Entry not found');

    const update = {
      ...(status !== undefined && { status }),
      ...(trialDate !== undefined && { trialDate }),
      ...(assignedTeacher !== undefined && { assignedTeacher }),
      ...(assignedTime !== undefined && { assignedTime }),
      ...(paymentType !== undefined && { paymentType }),
      ...(packageType !== undefined && { packageType }),
      ...(paymentAmount !== undefined && { paymentAmount }),
    };

    await ref.update(update);
    const after = await ref.once('value');
    res.json({ id, ...after.val() });
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).send('Server Error');
  }
});

// --- BLOCKED SLOTS ---

// GET /blocked-slots
app.get('/api/blocked-slots', async (req, res) => {
  try {
    const ref = db.ref('blocked_slots');
    const snap = await ref.once('value');
    res.json(snapshotToArray(snap));
  } catch (err) {
    console.error('Error fetching blocked slots:', err);
    res.status(500).send('Server Error');
  }
});

// POST /blocked-slots  (аналог ON CONFLICT DO NOTHING через transaction)
app.post('/api/blocked-slots', async (req, res) => {
  try {
    const { id, date, teacher, time } = req.body;
    if (!id) return res.status(400).send('id is required');

    const ref = db.ref(`blocked_slots/${id}`);
    const result = await ref.transaction(current => {
      if (current) return;        // уже существует -> NOOP
      return { id, date, teacher, time };
    });

    if (!result.committed && result.snapshot.exists()) {
      return res.json(result.snapshot.val());
    }

    const snap = await ref.once('value');
    res.json(snap.val());
  } catch (err) {
    console.error('Error blocking slot:', err);
    res.status(500).send('Server Error');
  }
});

// DELETE /blocked-slots/:id
app.delete('/api/blocked-slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.ref(`blocked_slots/${id}`).remove();
    res.status(204).send();
  } catch (err) {
    console.error('Error unblocking slot:', err);
    res.status(500).send('Server Error');
  }
});

// Экспортируем как одну HTTP Function
exports.expert = onRequest(app);
