import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StaffList.css';
import UserSettings from './UserSettings';

function StaffList({ staff, setStaff, departments, onUpdate }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [subdepartments, setSubdepartments] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/subdepartments')
      .then(res => setSubdepartments(res.data))
      .catch(err => console.error('❌ Failed to load subdepartments:', err));
  }, []);

  const getSubdepartmentName = (subId) => {
    const sub = subdepartments.find(s => s.id === subId);
    return sub ? sub.name : '';
  };

  const handleAdd = async () => {
    if (!name.trim() || !department) return;
    try {
      const res = await axios.post('http://localhost:4000/api/users', {
        name,
        department
      });
      setStaff(prev => [...prev, res.data]);
      setName('');
      setDepartment('');
    } catch (err) {
      console.error('❌ Error adding user:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('❗ Delete this user?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      setStaff(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('❌ Error deleting user:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/users');
      setStaff(res.data);
    } catch (err) {
      console.error('❌ Failed to refresh users:', err);
    }
  };

  const grouped = departments.map(dep => ({
    name: dep.name,
    users: staff.filter(u => u.department === dep.name)
  }));

  return (
    <div className="page-container">
      <h2>👤 Staff List</h2>

      <div className="form-container">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.name}>{dep.name}</option>
          ))}
        </select>
        <button onClick={handleAdd}>➕ Add</button>
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(group => (
            <React.Fragment key={group.name}>
              <tr>
                <td colSpan="4"><strong>🏢 {group.name}</strong></td>
              </tr>
              {group.users.map(user => (
                <React.Fragment key={user.id}>
                  <tr>
                    <td>{user.name}</td>
                    <td>{user.department}</td>
                    <td>{getSubdepartmentName(user.subdepartmentId)}</td>
                    <td>
                      <button onClick={() => handleDelete(user.id)}>🗑️</button>
                      <button onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}>⚙️</button>
                    </td>
                  </tr>
                  {editingUserId === user.id && (
                    <tr>
                      <td colSpan="4">
                        <UserSettings
                          user={user}
                          onClose={() => setEditingUserId(null)}
                          onUpdated={handleUpdate}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StaffList;
