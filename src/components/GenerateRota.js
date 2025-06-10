
import React from 'react';
import axios from 'axios';
import { generateRotaForDepartment } from '../utils/rotaUtils';

function GenerateRota({ staff, shifts, selectedWeek, selectedDepartment, onRotaGenerated }) {
  const handleGenerate = async () => {
    if (!selectedDepartment || !selectedWeek) {
      alert("Please select a department and week.");
      return;
    }

    const departmentUsers = staff.filter(user => user.department === selectedDepartment);

    const rota = generateRotaForDepartment(departmentUsers, shifts, selectedWeek);

    try {
      await axios.post('http://localhost:4000/api/rota', { rota, week: selectedWeek, department: selectedDepartment });
      if (onRotaGenerated) onRotaGenerated();
      alert("✅ Rota generated successfully!");
    } catch (err) {
      console.error("❌ Failed to save rota:", err);
      alert("❌ Failed to save rota. See console for details.");
    }
  };

  return (
    <div className="generate-rota">
      <h3>📅 Generate Rota</h3>
      <button onClick={handleGenerate}>⚙️ Generate</button>
    </div>
  );
}

export default GenerateRota;
