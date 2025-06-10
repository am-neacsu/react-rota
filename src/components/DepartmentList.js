import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DepartmentList({ departments, setDepartments }) {
  const [name, setName] = useState('');
  const [subName, setSubName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [subdepartments, setSubdepartments] = useState([]);

  useEffect(() => {
    fetchSubdepartments();
  }, []);

  const fetchSubdepartments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/subdepartments');
      setSubdepartments(res.data);
    } catch (err) {
      console.error('❌ Error loading subdepartments:', err);
    }
  };

  const handleAddDepartment = async () => {
    if (!name.trim()) return;
    try {
      const res = await axios.post('http://localhost:4000/api/departments', { name });
      setDepartments(prev => [...prev, res.data]);
      setName('');
    } catch (err) {
      console.error('❌ Error adding department:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('❗ Delete this department?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/departments/${id}`);
      setDepartments(prev => prev.filter(dep => dep.id !== id));
    } catch (err) {
      console.error('❌ Error deleting department:', err);
    }
  };

  const handleAddSub = async () => {
    if (!selectedDeptId || !subName.trim()) return;
    try {
      const res = await axios.post(`http://localhost:4000/api/subdepartments`, {
        name: subName,
        departmentId: selectedDeptId
      });
      setSubdepartments(prev => [...prev, res.data]);
      setSubName('');
    } catch (err) {
      console.error('❌ Error adding subdepartment:', err);
    }
  };

  return (
    <div className="page-container">
      <h2>🏢 Departments</h2>

      <div className="form-container">
        <input
          type="text"
          placeholder="New department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAddDepartment}>➕ Add Department</button>
      </div>

      <div className="form-container">
        <select
          value={selectedDeptId}
          onChange={(e) => setSelectedDeptId(e.target.value)}
        >
          <option value="">Select Department to Add Subdepartment</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        <input
          placeholder="Subdepartment name"
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
        />
        <button onClick={handleAddSub}>➕ Add Subdepartment</button>
      </div>

      <div className="department-grid">
        {departments.map(dep => (
          <div key={dep.id} className="department-card">
            <h3>{dep.name}</h3>
            <button onClick={() => handleDelete(dep.id)}>🗑️ Delete</button>

            <div style={{ marginTop: '10px', textAlign: 'left' }}>
              <strong>Subdepartments:</strong>
              <ul>
                {subdepartments
                  .filter(s => s.departmentId === dep.id)
                  .map(sub => (
                    <li key={sub.id}>{sub.name}</li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepartmentList;
