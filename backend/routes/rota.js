const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/rota.json');

// Load existing rota data
function loadRota() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Save rota data
function saveRota(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// POST: save rota
router.post('/', (req, res) => {
  try {
    const { rota, week, department } = req.body;
    if (!rota || !week || !department) {
      return res.status(400).json({ error: 'Missing rota, week, or department' });
    }

    const all = loadRota();
    const filtered = all.filter(r => r.week !== week || r.department !== department);

    filtered.push({ rota, week, department, savedAt: new Date().toISOString() });
    saveRota(filtered);

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save rota:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
