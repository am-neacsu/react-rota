const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

console.log('✅ Subdepartments.js loaded');

const filePath = path.join(__dirname, '../data/subdepartments.json');

const load = () => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const save = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  try {
    const all = load();
    const filtered = req.query.departmentId
      ? all.filter(s => s.departmentId === req.query.departmentId)
      : all;
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load subdepartments' });
  }
});

router.post('/', (req, res) => {
  try {
    const all = load();
    const newEntry = {
      id: Date.now().toString(),
      name: req.body.name,
      departmentId: req.body.departmentId || null
    };
    all.push(newEntry);
    save(all);
    res.json(newEntry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add subdepartment' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const all = load();
    const updated = all.filter(s => s.id !== req.params.id);
    save(updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subdepartment' });
  }
});

module.exports = router;