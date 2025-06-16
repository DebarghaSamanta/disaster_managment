import React, { useState } from 'react';
import axios from 'axios';

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

    // Format and type-cast inputs for FastAPI
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
        console.error('Server Error:', err.response.data);
      } else if (err.request) {
        setErrorMessage('No response from server. Make sure FastAPI is running.');
        console.error('No Response:', err.request);
      } else {
        setErrorMessage(`Request Error: ${err.message}`);
        console.error('Error:', err.message);
      }
    }
  };

  // Utility for better labels
  const formatLabel = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className='main_div'>
      <h1>Disaster Relief Supply Predictor</h1>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => {
          const isNumber = key !== 'Disaster_Type';
          return (
            <div key={key} >
              <label>
                {formatLabel(key)}:
                <input
                  type={isNumber ? 'number' : 'text'}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required
                  
                />
              </label>
            </div>
          );
        })}
        <button type="submit" >Predict</button>
      </form>

      {errorMessage && (
        <div >
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {prediction && (
        <div >
          <h2>Predicted Relief Supplies:</h2>
          <ul>
            {Object.entries(prediction).map(([item, amount]) => (
              <li key={item}>
                {item}: {amount.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calculator;
