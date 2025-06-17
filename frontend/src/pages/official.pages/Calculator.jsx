import React, { useState } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  FaTshirt,
  FaBaby,
  FaFirstAid,
  FaTint,
  FaDrumstickBite,
  FaCarrot,
  FaLeaf,
  FaBox
} from 'react-icons/fa';
import './calculator.css';

const Calculator = () => {
  const [formData, setFormData] = useState({
    area_name: '',
    area_size: '',
    days: '',
    disaster_type: 'Flood',
    severity: 'mild',
    region: 'Urban',
    children: '',
    adult_males: '',
    adult_females: '',
    elderly: ''
  });

  const [result, setResult] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    setTimeout(async () => {
      try {
        const payload = {
          ...formData,
          area_size: parseFloat(formData.area_size),
          days: parseInt(formData.days, 10),
          children: parseInt(formData.children, 10),
          adult_males: parseInt(formData.adult_males, 10),
          adult_females: parseInt(formData.adult_females, 10),
          elderly: parseInt(formData.elderly, 10)
        };

        const response = await axios.post('http://localhost:3000/api/v1/calculator/predict', payload);

        setResult(response.data);

        setSubmittedData({
          area_name: formData.area_name,
          area_size: parseFloat(formData.area_size),
          days: parseInt(formData.days, 10),
          severity: formData.severity,
          region: formData.region,
          children: parseInt(formData.children, 10),
          adult_males: parseInt(formData.adult_males, 10),
          adult_females: parseInt(formData.adult_females, 10),
          elderly: parseInt(formData.elderly, 10)
        });
      } catch (err) {
        setError('Backend error. Check server logs.');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const totalPopulation = () => {
    if (!submittedData) return 0;
    const { children, adult_males, adult_females, elderly } = submittedData;
    return [children, adult_males, adult_females, elderly]
      .map(x => x || 0)
      .reduce((a, b) => a + b, 0);
  };

  const genderRatio = () => {
    if (!submittedData) return 'N/A';
    const males = submittedData.adult_males || 0;
    const females = submittedData.adult_females || 0;
    if (females === 0) return 'N/A';
    return `${(males / females).toFixed(2)} : 1`;
  };

  const pieData = {
    labels: ['Children', 'Adult Males', 'Adult Females', 'Elderly'],
    datasets: [{
      data: submittedData
        ? [
          submittedData.children || 0,
          submittedData.adult_males || 0,
          submittedData.adult_females || 0,
          submittedData.elderly || 0
        ]
        : [0, 0, 0, 0],
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
      borderWidth: 0
    }]
  };

  const getReadableName = (key) => {
    const map = {
      Rice_kg: { name: 'Rice (kg)', icon: <FaDrumstickBite /> },
      Lentils_kg: { name: 'Lentils (kg)', icon: <FaLeaf /> },
      Oil_l: { name: 'Oil (L)', icon: <FaTint /> },
      Salt_kg: { name: 'Salt (kg)', icon: <FaBox /> },
      Sugar_kg: { name: 'Sugar (kg)', icon: <FaBox /> },
      DryFood_kg: { name: 'Dry Food (kg)', icon: <FaCarrot /> },
      Protein_kg: { name: 'Protein (kg)', icon: <FaBox /> },
      Vegetables_kg: { name: 'Vegetables (kg)', icon: <FaCarrot /> },
      Water_l: { name: 'Water (L)', icon: <FaTint /> },
      Medicines_Units: { name: 'Medicines (Units)', icon: <FaFirstAid /> },
      Sanitary_Napkin_Packets: { name: 'Sanitary Napkins (Packets)', icon: <FaBaby /> },
      Clothing_Sets: { name: 'Clothing Sets', icon: <FaTshirt /> }
    };
    return map[key] || { name: key, icon: <FaBox /> };
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h1>Disaster AI Dashboard</h1>
        <form onSubmit={handleSubmit} className="input-form">
          <div className="form-grid">
            <label>Area Name</label>
            <input
              type="text"
              name="area_name"
              value={formData.area_name}
              onChange={handleChange}
              required
            />

            <label>Area Size (sq.km)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="area_size"
              value={formData.area_size}
              onChange={handleChange}
              required
            />

            <label>Days</label>
            <input
              type="number"
              min="1"
              name="days"
              value={formData.days}
              onChange={handleChange}
              required
            />

            <label>Children</label>
            <input
              type="number"
              min="0"
              name="children"
              value={formData.children}
              onChange={handleChange}
              required
            />

            <label>Adult Males</label>
            <input
              type="number"
              min="0"
              name="adult_males"
              value={formData.adult_males}
              onChange={handleChange}
              required
            />

            <label>Adult Females</label>
            <input
              type="number"
              min="0"
              name="adult_females"
              value={formData.adult_females}
              onChange={handleChange}
              required
            />

            <label>Elderly</label>
            <input
              type="number"
              min="0"
              name="elderly"
              value={formData.elderly}
              onChange={handleChange}
              required
            />

            <label>Disaster Type</label>
            <select
              name="disaster_type"
              value={formData.disaster_type}
              onChange={handleChange}
              required
            >
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Landslide">Landslide</option>
              <option value="Drought">Drought</option>
              <option value="Fire">Fire</option>
            </select>

            <label>Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>

            <label>Region</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              required
            >
              <option value="Urban">Urban</option>
              <option value="Semi-Urban">Semi-Urban</option>
              <option value="Rural">Rural</option>
              <option value="Tribal">Tribal</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Calculating...
              </>
            ) : (
              'Predict Resources'
            )}
          </button>
        </form>

        <div className="small-piecard">
          <h3>Gender Ratio: {genderRatio()}</h3>
          <Doughnut
            data={pieData}
            width={100}
            height={100}
            options={{ plugins: { legend: { display: false } } }}
          />
        </div>

        {error && <div className="error">{error}</div>}
      </div>

      <div className="content-area">
        {result && submittedData ? (
          <>
            <div className="resource-grid">
              <div className="resource-section">
                <h3>Food & Water</h3>
                {Object.entries(result.food).map(([key, value]) => {
                  const { name, icon } = getReadableName(key);
                  return (
                    <div className="resource-card" key={`food-${key}`}>
                      {icon} <b>{name}:</b> {value}
                    </div>
                  );
                })}
              </div>

              <div className="resource-section">
                <h3>Medicine & Sanitary</h3>
                {Object.entries(result.non_food).map(([key, value]) => {
                  const { name, icon } = getReadableName(key);
                  return (
                    <div className="resource-card" key={`nonfood-${key}`}>
                      {icon} <b>{name}:</b> {value}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="footer-box">
              <h3>Area Info</h3>
              <p>
                <b>Area:</b> {submittedData.area_name} | Size: {submittedData.area_size} sq.km | Days:{' '}
                {submittedData.days}
              </p>
              <p>
                <b>Population:</b> {totalPopulation()}
              </p>
              <p>
                <b>Severity:</b>{' '}
                {submittedData.severity.charAt(0).toUpperCase() + submittedData.severity.slice(1)}
              </p>
              <p>
                <b>Region:</b> {submittedData.region}
              </p>
              <p>
                <b>AI Buffer Applied:</b> {result.buffer_percentage}%
              </p>
              <p>{result.reasoning || 'Generated using predictive estimation'}</p>
            </div>
          </>
        ) : (
          <div className="footer-box">
            <h3>Area Info</h3>
            <p>Fill the form and press "Predict Resources" to see detailed area info here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
