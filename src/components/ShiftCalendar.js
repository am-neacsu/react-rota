import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { startOfWeek, addDays, addWeeks, subWeeks, format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { generateRotaForDepartment } from '../utils/rotaUtils';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const getWeekKey = (date) => format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

function ShiftCalendar({ staff, shifts, departments }) {
  const [rota, setRota] = useState({});
  const [selectedDept, setSelectedDept] = useState('all');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekKey = getWeekKey(weekStart);

  useEffect(() => {
    axios.get('http://localhost:4000/api/rota')
      .then(res => setRota(res.data || {}))
      .catch(err => console.error('❌ Error loading rota', err));
  }, []);

  const saveRota = async (updated) => {
    try {
      await axios.put('http://localhost:4000/api/rota', updated);
      console.log('✅ Rota saved to backend');
    } catch (err) {
      console.error('❌ Failed to save rota:', err);
    }
  };

  const handleShiftChange = (userId, day, shiftId) => {
    const updated = {
      ...rota,
      [weekKey]: {
        ...(rota[weekKey] || {}),
        [userId]: {
          ...(rota[weekKey]?.[userId] || {}),
          [day]: shiftId,
        },
      },
    };
    setRota(updated);
    saveRota(updated); // Save to JSON file when manually edited
  };

  const handleExport = () => {
    const sheet = [['Name', ...days.map((day, i) => `${day} ${format(addDays(weekStart, i), 'dd')}`)]];
    const visibleUsers = selectedDept === 'all'
      ? staff
      : staff.filter(s => s.department === selectedDept);
    visibleUsers.forEach(user => {
      const row = [user.name];
      days.forEach(day => {
        const shiftId = rota[weekKey]?.[user.id]?.[day];
        const shift = shifts.find(s => s.id === shiftId);
        row.push(shift ? shift.name : '');
      });
      sheet.push(row);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheet);
    XLSX.utils.book_append_sheet(wb, ws, 'Rota');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `rota-${weekKey}.xlsx`);
  };

  const handleGenerate = async () => {
    if (selectedDept === 'all') {
      alert('Please select a department to generate the rota.');
      return;
    }

    const newBlock = generateRotaForDepartment(
      staff.filter(s => s.department === selectedDept),
      shifts,
      weekStart
    );

    console.log('🧠 New Rota Block:', newBlock);

    if (!newBlock[weekKey]) {
      alert('⚠️ No rota generated — check staff and shift data.');
      return;
    }

    const updated = {
      ...rota,
      [weekKey]: {
        ...rota[weekKey],
        ...newBlock[weekKey]
      }
    };

    try {
      await axios.put('http://localhost:4000/api/rota', updated);
      const refreshed = await axios.get('http://localhost:4000/api/rota');
      setRota(refreshed.data || {});
      console.log('🔄 UI rota refreshed');
    } catch (err) {
      console.error('❌ Failed to save or fetch rota:', err);
      alert('❌ Failed to save rota. See console for details.');
    }
  };

  const visibleStaff = selectedDept === 'all'
    ? staff
    : staff.filter(user => user.department === selectedDept);

  return (
    <div className="page-container">
      <h2>📅 Rota Calendar</h2>

      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <button onClick={() => setWeekStart(prev => subWeeks(prev, 1))}>⬅️ Prev</button>
        <strong style={{ margin: '0 15px' }}>
          Week of {format(weekStart, 'MMM dd, yyyy')}
        </strong>
        <button onClick={() => setWeekStart(prev => addWeeks(prev, 1))}>Next ➡️</button>
      </div>

      <div className="form-container">
        <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
          <option value="all">General View</option>
          {departments.map(dep => (
            <option key={dep.id} value={dep.name}>{dep.name}</option>
          ))}
        </select>
        <button onClick={handleExport}>📤 Export Week</button>
        <button onClick={handleGenerate} disabled={selectedDept === 'all'}>
          🧠 Generate Rota
        </button>
      </div>

      <table className="staff-table">
        <thead>
          <tr>
            <th>Staff</th>
            {days.map((day, i) => (
              <th key={day}>{day} <br />{format(addDays(weekStart, i), 'dd')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleStaff.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              {days.map(day => (
                <td key={day}>
                  <select
                    value={rota[weekKey]?.[user.id]?.[day] || ''}
                    onChange={(e) => handleShiftChange(user.id, day, e.target.value)}
                  >
                    <option value="">--</option>
                    {shifts.map(shift => (
                      <option key={shift.id} value={shift.id}>{shift.name}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShiftCalendar;
