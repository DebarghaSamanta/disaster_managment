import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

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
  const [prediction, setPrediction] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ source: '', destination: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponse(null);
    setPrediction(null);
    setAvailableDrivers([]);
    setSuccessMessage('');
    setLoading(true);

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
      alert("Error: " + (err.response?.data?.error || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/v1/aid/available-drivers');
      setAvailableDrivers(res.data);
    } catch {
      alert("Failed to fetch drivers");
    }
  };

  const handleAssignClick = (driver) => {
    setSelectedDriver(driver);
    setAssignmentForm({ source: '', destination: '' });
    setSuccessMessage('');
  };

  const submitAssignment = async () => {
    try {
      await axios.post('http://localhost:3000/api/v1/aid/assign-aid-driver', {
        driverId: selectedDriver.DriverId,
        source: assignmentForm.source,
        destination: assignmentForm.destination,
        predictedAidId: response.predicted_aid_id
      });
      setSuccessMessage(`Aid assigned to ${selectedDriver.fullName} successfully!`);
      setSelectedDriver(null);
    } catch {
      alert("Failed to assign aid.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Aid Prediction Calculator
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {Object.keys(formData).map((key) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key.replace(/_/g, ' ')}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </Grid>
            ))}
          </Grid>
          <Button variant="contained" color="primary" type="submit" sx={{ mt: 3 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </Box>

        {prediction && (
          <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Predicted Aid Breakdown</Typography>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Food Items:</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(prediction.food).filter(([key]) => key !== '_id').map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 4 }}>Non-Food Items:</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {Object.entries(prediction.non_food).filter(([key]) => key !== '_id').map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        )}

        <Divider sx={{ my: 4 }} />
        <Button variant="outlined" onClick={fetchAvailableDrivers}>
          Show Available Drivers
        </Button>

        {availableDrivers.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Available Drivers</Typography>
            <List>
              {availableDrivers.map((driver, idx) => (
                <ListItem key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <ListItemText
                    primary={`${driver.fullName} - ${driver.vehicleType} (${driver.vehicleNumber})`}
                  />
                  <Button variant="contained" onClick={() => handleAssignClick(driver)}>
                    Assign
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {selectedDriver && (
          <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Assign Aid to: {selectedDriver.fullName}
            </Typography>
            <TextField
              fullWidth
              label="Source"
              value={assignmentForm.source}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, source: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Destination"
              value={assignmentForm.destination}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, destination: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={submitAssignment}>Confirm</Button>
              <Button variant="outlined" color="error" onClick={() => setSelectedDriver(null)}>Cancel</Button>
            </Box>
          </Box>
        )}

        {successMessage && (
          <Typography sx={{ mt: 3, color: 'green' }}>
            {successMessage}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Calculator;
