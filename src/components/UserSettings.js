import React, { useState, useEffect } from 'react';
import axios from 'axios';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function UserSettings({ user, onClose, onUpdated }) {
  const [prefs, setPrefs] = useState({
    daysOff: [],
    preferredShift: '',
    partnerShift: '',
    fixedShiftEnabled: false,
    fixedShiftId: ''
  });

  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subdepartments, setSubdepartments] = useState([]);
  const [selectedSubdepartment, setSelectedSubdepartment] = useState(user.subdepartmentId || '');
  const [contractedHours, setContractedHours] = useState(user.contractedHours || '');

  useEffect(() => {
    setPrefs({
      daysOff: [],
      preferredShift: '',
      partnerShift: '',
      fixedShiftEnabled: false,
      fixedShiftId: '',
      ...(user.preferences || {})
    });
    setSelectedSubdepartment(user.subdepartmentId || '');
    setContractedHours(user.contractedHours || '');
  }, [user]);

  useEffect(() => {
    axios.get('http://localhost:4000/api/shifts')
      .then(res => setShifts(res.data))
      .catch(err => console.error('❌ Failed to load shifts:', err));

    axios.get('http://localhost:4000/api/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('❌ Failed to load departments:', err));
  }, []);

  useEffect(() => {
    let resolvedDeptId = user.departmentId;
    if (!resolvedDeptId && user.department && departments.length > 0) {
      const match = departments.find(d => d.name === user.department);
      if (match) resolvedDeptId = match.id;
    }

    if (resolvedDeptId) {
      axios.get(`http://localhost:4000/api/subdepartments?departmentId=${resolvedDeptId}`)
        .then(res => setSubdepartments(res.data))
        .catch(err => console.error('❌ Failed to load subdepartments:', err));
    } else {
      setSubdepartments([]);
    }
  }, [user.departmentId, user.department, departments]);

  const updatePrefs = async (newPrefs) => {
    setPrefs(newPrefs);
    try {
      await axios.put(`http://localhost:4000/api/users/${user.id}`, {
        preferences: newPrefs,
        subdepartmentId: selectedSubdepartment,
        contractedHours
      });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('❌ Failed to save preferences:', err);
    }
  };

  const updateSubdepartment = async (value) => {
    setSelectedSubdepartment(value);
    try {
      await axios.put(`http://localhost:4000/api/users/${user.id}`, {
        ...user,
        subdepartmentId: value
      });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('❌ Failed to update subdepartment:', err);
    }
  };

  const updateContractedHours = async (value) => {
    setContractedHours(value);
    try {
      await axios.put(`http://localhost:4000/api/users/${user.id}`, {
        ...user,
        contractedHours: value
      });
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('❌ Failed to update contracted hours:', err);
    }
  };

  const toggleDay = (day) => {
    const daysOff = prefs.daysOff.includes(day)
      ? prefs.daysOff.filter(d => d !== day)
      : [...prefs.daysOff, day];
    updatePrefs({ ...prefs, daysOff });
  };

  const handleFixedShiftToggle = () => {
    const updated = {
      ...prefs,
      fixedShiftEnabled: !prefs.fixedShiftEnabled,
      fixedShiftId: !prefs.fixedShiftEnabled ? (shifts[0]?.id || '') : ''
    };
    updatePrefs(updated);
  };

  return (
    <div className="user-settings-box">
      <h4>⚙️ Settings for {user.name}</h4>

      <div>
        <label><strong>Preferred Days Off:</strong></label>
        <div className="checkbox-grid">
          {weekdays.map(day => (
            <label key={day}>
              <input
                type="checkbox"
                checked={prefs.daysOff.includes(day)}
                onChange={() => toggleDay(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label><strong>Preferred Shift:</strong></label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name={`preferredShift-${user.id}`}
              checked={prefs.preferredShift === 'day'}
              onChange={() => updatePrefs({ ...prefs, preferredShift: 'day' })}
            />
            Day
          </label>
          <label>
            <input
              type="radio"
              name={`preferredShift-${user.id}`}
              checked={prefs.preferredShift === 'night'}
              onChange={() => updatePrefs({ ...prefs, preferredShift: 'night' })}
            />
            Night
          </label>
        </div>
      </div>

      <div>
        <label><strong>Fixed Shift:</strong></label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="checkbox"
            checked={prefs.fixedShiftEnabled}
            onChange={handleFixedShiftToggle}
          />
          Enable
        </label>

        {prefs.fixedShiftEnabled && (
          <div style={{ marginTop: '10px' }}>
            <select
              value={prefs.fixedShiftId}
              onChange={(e) =>
                updatePrefs({ ...prefs, fixedShiftId: e.target.value })
              }
            >
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.start} - {shift.end})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: '15px' }}>
        <label><strong>Subdepartment:</strong></label>
        <select
          value={selectedSubdepartment}
          onChange={(e) => updateSubdepartment(e.target.value)}
        >
          <option value="">-- None --</option>
          {subdepartments.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '15px' }}>
        <label><strong>Hours Contracted / Week:</strong></label>
        <select
          value={contractedHours}
          onChange={(e) => updateContractedHours(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="40">40 H</option>
          <option value="32">32 H</option>
          <option value="30">30 H</option>
          <option value="24">24 H</option>
          <option value="20">20 H</option>
        </select>
      </div>

      <button onClick={onClose} className="close-button">❌ Close</button>
    </div>
  );
}

export default UserSettings;
