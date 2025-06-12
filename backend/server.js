const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rotaRouter = require('./routes/rota');
const app = express();

const PORT = 4000;
const dataPath = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

// Serve static files (e.g., React frontend build if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read JSON files
function readFile(filePath) {
  return fs.promises.readFile(path.join(dataPath, filePath), 'utf8')
    .then(data => JSON.parse(data))
    .catch(err => {
      console.error(`❌ Failed to read ${filePath}:`, err);
      return {};
    });
}

// Helper function to write JSON files
function writeFile(filePath, data) {
  return fs.promises.writeFile(path.join(dataPath, filePath), data, 'utf8');
}

// =================== API ROUTES =================== //

// GET all data
app.get('/api/users', (_, res) => {
  readFile('users.json').then(data => res.json(data));
});

app.get('/api/departments', (_, res) => {
  readFile('departments.json').then(data => res.json(data));
});

app.get('/api/shifts', (_, res) => {
  readFile('shifts.json').then(data => res.json(data));
});


app.get('/api/settings', (_, res) => {
  readFile('settings.json').then(data => res.json(data));
});

app.get('/api/subdepartments', (_, res) => {
  readFile('subdepartments.json').then(data => res.json(data));
});

// Rota routes
app.use('/api/rota', rotaRouter);

// =================================================== //

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
