import React, { useState } from 'react';
import axios from 'axios';

const Calculator = () => {
  const [formData, setFormData] = useState({
    area_name: '',
    area_size: '',
    region: '',
    disaster_type: '',
    severity: '',
    days: '',
    children: '',
    adult_males: '',
    adult_females: '',
    elderly: ''
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driversError, setDriversError] = useState(null);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ source: '', destination: '' });
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setPrediction(null);
    setAvailableDrivers([]);
    setSuccessMessage('');

    try {
      const res = await axios.post('http://localhost:3000/api/v1/aid/predict', {
        ...formData,
        area_size: Number(formData.area_size),
        days: Number(formData.days),
        children: Number(formData.children),
        adult_males: Number(formData.adult_males),
        adult_females: Number(formData.adult_females),
        elderly: Number(formData.elderly)
      });

      setResponse(res.data);
      const aidDetails = await axios.get(`http://localhost:3000/api/v1/aid/prediction/${res.data.predicted_aid_id}`);
      setPrediction(aidDetails.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const fetchAvailableDrivers = async () => {
    setLoadingDrivers(true);
    setDriversError(null);
    try {
      const res = await axios.get('http://localhost:3000/api/v1/aid/available-drivers');
      console.log("Fetched drivers:", res.data);
      setAvailableDrivers(res.data);
    } catch (err) {
      setDriversError("Failed to fetch drivers");
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAssignClick = (driver) => {
    setSelectedDriver(driver);
    setAssignmentForm({ source: '', destination: '' });
    setSuccessMessage('');
  };

  const submitAssignment = async () => {
    if (!assignmentForm.source || !assignmentForm.destination || !response?.predicted_aid_id) {
      alert("Please enter source, destination, and ensure prediction is done.");
      return;
    }

    try {
      console.log({
      driverId: selectedDriver?.DriverId,
      source: assignmentForm.source,
      destination: assignmentForm.destination,
      predictedAidId: response?.predicted_aid_id
    });
      await axios.post('http://localhost:3000/api/v1/aid/assign-aid-driver', {
        driverId: selectedDriver.DriverId,
        source: assignmentForm.source,
        destination: assignmentForm.destination,
        predictedAidId: response.predicted_aid_id
      });
      setSuccessMessage(`Aid assigned to ${selectedDriver.fullName} successfully!`);
      setSelectedDriver(null);
    } catch (err) {
      alert("Failed to assign aid.");
    }
  };

  return (
    <div>
      <h2>Aid Prediction Calculator</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key.replace(/_/g, ' ')}:</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>

      {prediction && (
        <div style={{ marginTop: '1rem', color: 'black' }}>
          <h3>Predicted Aid Breakdown</h3>
          <h4>Food Items</h4>
          <ul>
            {Object.entries(prediction.food).map(([key, value]) => (
              <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</li>
            ))}
          </ul>
          <h4>Non-Food Items</h4>
          <ul>
            {Object.entries(prediction.non_food).map(([key, value]) => (
              <li key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</li>
            ))}
          </ul>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />
      <button type="button" onClick={fetchAvailableDrivers}>Show Available Drivers</button>

      {loadingDrivers && <p>Loading drivers...</p>}
      {driversError && <p style={{ color: 'red' }}>{driversError}</p>}

      {availableDrivers.length > 0 && (
        <div>
          <h3>Available Drivers</h3>
          <ul>
            {availableDrivers.map((driver, idx) => (
              <li key={idx} style={{ marginBottom: '1rem' }}>
                <strong>Name:</strong> {driver.fullName} |
                <strong> Vehicle Type:</strong> {driver.vehicleType} |
                <strong> Vehicle Number:</strong> {driver.vehicleNumber} {' '}
                <button onClick={() => handleAssignClick(driver)}>Assign</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedDriver && (
        <div style={{ border: '1px solid gray', padding: '1rem', marginTop: '1rem' }}>
          <h4>Assign Aid to: {selectedDriver.fullName}</h4>
          <label>Source: </label>
          <input
            type="text"
            value={assignmentForm.source}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, source: e.target.value })}
          /><br />
          <label>Destination: </label>
          <input
            type="text"
            value={assignmentForm.destination}
            onChange={(e) => setAssignmentForm({ ...assignmentForm, destination: e.target.value })}
          /><br /><br />
          <button onClick={submitAssignment}>Confirm Assignment</button>{' '}
          <button onClick={() => setSelectedDriver(null)}>Cancel</button>
        </div>
      )}

      {successMessage && (
        <div style={{ color: 'green', marginTop: '1rem' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Calculator;
