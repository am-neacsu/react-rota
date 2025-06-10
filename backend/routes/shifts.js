const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const shiftsFile = path.join(__dirname, '../data/shifts.json');

// 📥 Load shifts
const loadShifts = () => {
  const data = fs.readFileSync(shiftsFile, 'utf8');
  return JSON.parse(data);
};

// 💾 Save shifts
const saveShifts = (shifts) => {
  fs.writeFileSync(shiftsFile, JSON.stringify(shifts, null, 2));
};

// ✅ GET all shifts
router.get('/', (req, res) => {
  try {
    const shifts = loadShifts();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shifts' });
  }
});

// ➕ POST new shift
router.post('/', (req, res) => {
  try {
    const shifts = loadShifts();
    const newShift = {
      id: Date.now().toString(),
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
    };
    shifts.push(newShift);
    saveShifts(shifts);
    res.json(newShift);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add shift' });
  }
});

// ✏️ PUT update shift
router.put('/:id', (req, res) => {
  try {
    const shifts = loadShifts();
    const id = req.params.id;
    const index = shifts.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).send('Shift not found');

    shifts[index] = {
      ...shifts[index],
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
    };
    saveShifts(shifts);
    res.json(shifts[index]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

// 🗑️ DELETE shift
router.delete('/:id', (req, res) => {
  try {
    const shifts = loadShifts();
    const id = req.params.id;
    const updated = shifts.filter(s => s.id !== id);
    if (updated.length === shifts.length) return res.status(404).send('Shift not found');

    saveShifts(updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

module.exports = router;
