import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

import StaffList from './components/StaffList';
import DepartmentList from './components/DepartmentList';
import ShiftForm from './components/ShiftForm';
import ShiftCalendar from './components/ShiftCalendar';

import './App.css';

function App() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);

  const loadStaff = useCallback(() => {
    axios.get('http://localhost:4000/api/users')
      .then(res => setStaff(res.data))
      .catch(err => console.error('❌ Failed to load staff:', err));
  }, []);

  const loadDepartments = useCallback(() => {
    axios.get('http://localhost:4000/api/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('❌ Failed to load departments:', err));
  }, []);

  const loadShifts = useCallback(() => {
    axios.get('http://localhost:4000/api/shifts')
      .then(res => setShifts(res.data))
      .catch(err => console.error('❌ Failed to load shifts:', err));
  }, []);

  useEffect(() => {
    loadStaff();
    loadDepartments();
    loadShifts();
  }, [loadStaff, loadDepartments, loadShifts]);

  return (
    <Router>
      <div className="App">
        <h1>🗓️ Rota Generator</h1>

        <nav className="menu">
          <Link to="/staff">👤 Staff</Link>
          <Link to="/shifts">🕓 Shifts</Link>
          <Link to="/departments">🏢 Departments</Link>
          <Link to="/rota">📅 Rota</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/staff" />} />

          <Route
            path="/staff"
            element={
              <StaffList
                staff={staff}
                setStaff={setStaff}
                departments={departments}
                onUpdate={loadStaff}
              />
            }
          />

          <Route
            path="/departments"
            element={<DepartmentList departments={departments} setDepartments={setDepartments} onUpdate={loadDepartments} />}
          />

          <Route
            path="/shifts"
            element={<ShiftForm shifts={shifts} setShifts={setShifts} onUpdate={loadShifts} />}
          />

          <Route
            path="/rota"
            element={
              <ShiftCalendar
                staff={staff}
                shifts={shifts}
                departments={departments}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
