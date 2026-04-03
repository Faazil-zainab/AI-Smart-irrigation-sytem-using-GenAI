import React from 'react';
import './InputForm.css';

/**
 * InputForm Component
 * Collects sensor data from user for irrigation prediction
 */
const InputForm = ({ onSubmit, loading, formData, onFormDataChange }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFormDataChange((prev) => ({
      ...prev,
      [name]: name === 'crop_type' ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const cropTypes = ['wheat', 'rice', 'cotton', 'corn', 'vegetables', 'orchard'];

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <h2>🌱 Irrigation Parameters</h2>
      
      <div className="form-group">
        <label htmlFor="temperature">Temperature (°C)</label>
        <input
          type="number"
          id="temperature"
          name="temperature"
          value={formData.temperature}
          onChange={handleChange}
          min="-10"
          max="50"
          step="0.5"
          required
        />
        <span className="value-display">{formData.temperature}°C</span>
      </div>

      <div className="form-group">
        <label htmlFor="humidity">Humidity (%)</label>
        <input
          type="number"
          id="humidity"
          name="humidity"
          value={formData.humidity}
          onChange={handleChange}
          min="0"
          max="100"
          step="1"
          required
        />
        <span className="value-display">{formData.humidity}%</span>
      </div>

      <div className="form-group">
        <label htmlFor="soil_moisture">Soil Moisture (%)</label>
        <input
          type="number"
          id="soil_moisture"
          name="soil_moisture"
          value={formData.soil_moisture}
          onChange={handleChange}
          min="0"
          max="100"
          step="1"
          required
        />
        <span className="value-display">{formData.soil_moisture}%</span>
      </div>

      <div className="form-group">
        <label htmlFor="rainfall">Recent Rainfall (mm)</label>
        <input
          type="number"
          id="rainfall"
          name="rainfall"
          value={formData.rainfall}
          onChange={handleChange}
          min="0"
          max="500"
          step="0.5"
          required
        />
        <span className="value-display">{formData.rainfall}mm</span>
      </div>

      <div className="form-group">
        <label htmlFor="crop_type">Crop Type</label>
        <select
          id="crop_type"
          name="crop_type"
          value={formData.crop_type}
          onChange={handleChange}
          required
        >
          {cropTypes.map(crop => (
            <option key={crop} value={crop}>{crop.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading} className="submit-button">
        {loading ? '⏳ Analyzing...' : '📊 Get Recommendation'}
      </button>
    </form>
  );
};

export default InputForm;
