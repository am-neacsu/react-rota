import React, { useState } from 'react';
import axios from 'axios';

function ShiftForm({ shifts, setShifts, onUpdate }) {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setName('');
    setStart('');
    setEnd('');
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !start || !end) return;

    if (editingId) {
      // 🔁 UPDATE EXISTING
      try {
        const updated = { name, start, end };
        await axios.put(`http://localhost:4000/api/shifts/${editingId}`, updated);
        setShifts(prev =>
          prev.map(s => (s.id === editingId ? { ...s, ...updated } : s))
        );
        onUpdate();
        resetForm();
      } catch (err) {
        console.error('❌ Error updating shift:', err);
      }
    } else {
      // ➕ ADD NEW
      try {
        const res = await axios.post('http://localhost:4000/api/shifts', { name, start, end });
        setShifts(prev => [...prev, res.data]);
        onUpdate();
        resetForm();
      } catch (err) {
        console.error('❌ Error adding shift:', err);
      }
    }
  };

  const handleEdit = (shift) => {
    setEditingId(shift.id);
    setName(shift.name);
    setStart(shift.start);
    setEnd(shift.end);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/shifts/${id}`);
      setShifts(prev => prev.filter(s => s.id !== id));
      onUpdate();
    } catch (err) {
      console.error('❌ Error deleting shift:', err);
    }
  };

  return (
    <div className="page-container">
      <h2>🕓 Shift Management</h2>

      <div className="form-container">
        <input placeholder="Shift name" value={name} onChange={e => setName(e.target.value)} />
        <input type="time" value={start} onChange={e => setStart(e.target.value)} />
        <input type="time" value={end} onChange={e => setEnd(e.target.value)} />
        <button onClick={handleAddOrUpdate}>
          {editingId ? '💾 Save Changes' : '➕ Add Shift'}
        </button>
        {editingId && <button onClick={resetForm}>❌ Cancel</button>}
      </div>

      <div className="shift-grid compact-grid">
        {shifts.map(shift => (
          <div key={shift.id} className="shift-card compact">
            <h4>{shift.name}</h4>
            <p>{shift.start} - {shift.end}</p>
            <div className="action-buttons">
              <button onClick={() => handleEdit(shift)}>✏️</button>
              <button onClick={() => handleDelete(shift.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShiftForm;
