const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/rota.json');

// Load existing rota data
function loadRota() {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

// Save rota data
function saveRota(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// GET: full rota
router.get('/', (req, res) => {
  try {
    const rota = loadRota();
    res.json(rota);
  } catch (err) {
    console.error('Failed to load rota:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { rota, week } = req.body;
    if (!rota || !week) {
      return res.status(400).json({ error: 'Missing rota or week' });
    }

    const all = loadRota();
    const weekData = rota[week];
    if (!weekData) {
      return res.status(400).json({ error: 'Invalid week data' });
    }

    all[week] = { ...(all[week] || {}), ...weekData };
    saveRota(all);

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to save rota:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', (req, res) => {
  try {
    const rota = req.body;
    if (!rota || typeof rota !== 'object') {
      return res.status(400).json({ error: 'Invalid rota data' });
    }

    saveRota(rota);
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to replace rota:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
