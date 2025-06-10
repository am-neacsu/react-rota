const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

console.log('✅ departments.js loaded');

const departmentsFile = path.join(__dirname, '../data/departments.json');

const loadDepartments = () => JSON.parse(fs.readFileSync(departmentsFile, 'utf8'));
const saveDepartments = (deps) => fs.writeFileSync(departmentsFile, JSON.stringify(deps, null, 2));

router.get('/', (req, res) => {
  try {
    const deps = loadDepartments();
    res.json(deps);
  } catch {
    res.status(500).json({ error: 'Failed to load departments' });
  }
});

router.post('/', (req, res) => {
  try {
    const deps = loadDepartments();
    const newDep = {
      id: Date.now().toString(),
      name: req.body.name,
      subcategories: []
    };
    deps.push(newDep);
    saveDepartments(deps);
    res.json(newDep);
  } catch {
    res.status(500).json({ error: 'Failed to add department' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const deps = loadDepartments();
    const index = deps.findIndex(d => d.id === req.params.id);
    if (index === -1) return res.status(404).send('Department not found');

    deps[index] = { ...deps[index], ...req.body };
    saveDepartments(deps);
    res.json(deps[index]);
  } catch {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.post('/:id/subcategory', (req, res) => {
  console.log(`📥 POST /api/departments/${req.params.id}/subcategory`);
  try {
    const deps = loadDepartments();
    const dep = deps.find(d => d.id === req.params.id);
    if (!dep) return res.status(404).send('Department not found');

    const newSub = {
      id: Date.now().toString(),
      name: req.body.name
    };

    if (!dep.subcategories) dep.subcategories = [];
    dep.subcategories.push(newSub);
    saveDepartments(deps);
    res.json(newSub);
  } catch {
    res.status(500).json({ error: 'Failed to add subcategory' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deps = loadDepartments();
    const updated = deps.filter(d => d.id !== req.params.id);
    saveDepartments(updated);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router;