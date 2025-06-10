const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, '../data/users.json');

const loadUsers = () => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const saveUsers = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// GET all users
router.get('/', (req, res) => {
  try {
    const users = loadUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// ADD new user
router.post('/', (req, res) => {
  try {
    const users = loadUsers();
    const newUser = {
      id: Date.now().toString(),
      name: req.body.name,
      department: req.body.department,
      subdepartmentId: null,
      daysOff: [],
      preferredShift: null,
      partnerShift: null,
      fixedShift: null,
      contractedHours: null // <-- New
    };
    users.push(newUser);
    saveUsers(users);
    res.json(newUser);
  } catch {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// UPDATE user settings
router.put('/:id', (req, res) => {
  try {
    const users = loadUsers();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });

    users[index] = { ...users[index], ...req.body };
    saveUsers(users);
    res.json(users[index]);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:id', (req, res) => {
  try {
    const users = loadUsers();
    const updated = users.filter(u => u.id !== req.params.id);
    saveUsers(updated);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
