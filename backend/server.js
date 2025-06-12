const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const usersRouter = require('./routes/users');
const departmentsRouter = require('./routes/departments');
const shiftsRouter = require('./routes/shifts');
const subdepartmentsRouter = require('./routes/subdepartments');
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

// Legacy read-only routes
app.get('/api/rota', (_, res) => {
  readFile('rota.json').then(data => res.json(data));
});

app.get('/api/settings', (_, res) => {
  readFile('settings.json').then(data => res.json(data));
});

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/shifts', shiftsRouter);
app.use('/api/subdepartments', subdepartmentsRouter);
app.use('/api/rota', rotaRouter);

// =================================================== //

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
