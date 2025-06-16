import React, { useState } from 'react';
import axios from 'axios';
import './calculator.css'; // 👈 Import the CSS file

const Calculator = () => {
  const initialFormData = {
    Disaster_Type: '',
    Severity: '',
    Area_Size_sq_km: '',
    Population_Affected: '',
    Duration_days: '',
    Babies_0_2: '',
    Elderly_60_plus: '',
    Women_18_60: '',
    Adults_18_60: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [prediction, setPrediction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setPrediction(null);

    const formattedData = {
      Disaster_Type: formData.Disaster_Type.trim(),
      Severity: parseInt(formData.Severity),
      Area_Size_sq_km: parseFloat(formData.Area_Size_sq_km),
      Population_Affected: parseInt(formData.Population_Affected),
      Duration_days: parseInt(formData.Duration_days),
      Babies_0_2: parseInt(formData.Babies_0_2),
      Elderly_60_plus: parseInt(formData.Elderly_60_plus),
      Women_18_60: parseInt(formData.Women_18_60),
      Adults_18_60: parseInt(formData.Adults_18_60),
    };

    try {
      const response = await axios.post('http://localhost:8000/predict', formattedData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 && response.data?.prediction) {
        setPrediction(response.data.prediction);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      if (err.response) {
        setErrorMessage(`Server Error: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setErrorMessage('No response from server. Make sure FastAPI is running.');
      } else {
        setErrorMessage(`Request Error: ${err.message}`);
      }
    }
  };

  const formatLabel = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className={`calculator-container ${prediction ? 'with-results' : ''}`}>
      <h1 className="main-heading">Disaster Relief Supply Calculator</h1>
      <div className="left-panel">
        <h1 className="calculator-title">Input Parameters</h1>
        <form onSubmit={handleSubmit} className="calculator-form">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="form-group">
              <label className="form-label">
                {formatLabel(key)}:
                <input
                  type={key !== 'Disaster_Type' ? 'number' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </label>
            </div>
          ))}
          <button type="submit" className="submit-button">Predict</button>
        </form>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>

      {prediction && (
        <div className="right-panel">
          <h2 className="prediction-title">Predicted Relief Supplies</h2>
          <div className="card-grid">
            {Object.entries(prediction).map(([item, amount]) => (
              <div key={item} className="prediction-card">
                <h3>{item}</h3>
                <p>{amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
