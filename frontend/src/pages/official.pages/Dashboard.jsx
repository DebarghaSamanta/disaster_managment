import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Grid, Typography, Paper, Drawer, List, ListItem,
  ListItemText, Divider, Avatar, IconButton, Tooltip
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { NavLink } from 'react-router-dom';
import { ClipboardCopy, ThermometerSun, CloudRain, Info, AlertTriangle } from 'lucide-react';

const LEFT_SIDEBAR_WIDTH = 240;
const RIGHT_SIDEBAR_WIDTH = 280;

const Dashboard = () => {
  const [warehouses, setWarehouses] = useState(0);
  const [assignments, setAssignments] = useState(0);
  const [totalInventory, setTotalInventory] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [user, setUser] = useState({ fullname: 'Admin', emailId: 'admin@example.com' });
  const [weather, setWeather] = useState({ temp: '--', rain: '--', warning: '--', status: '--' });

  const regionalContacts = [
    { label: 'NDMA (Disaster Mgmt)', number: '1078' },
    { label: 'Ambulance', number: '108' },
    { label: 'Fire', number: '101' },
    { label: 'Police', number: '100' },
    { label: 'Flood Helpline', number: '011-1070' },
    { label: 'Earthquake Response', number: '011-24363260' },
    { label: 'State Helpline (West Bengal)', number: '033-22143526' },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text} to clipboard`);
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        'https://api.open-meteo.com/v1/forecast?latitude=22.5744&longitude=88.3629&current=temperature_2m,precipitation,weathercode&timezone=auto'
      );
      const current = res.data.current;
      setWeather({
        temp: `${current.temperature_2m}°C`,
        rain: `${current.precipitation} mm`,
        warning: current.weathercode > 60 ? 'Severe' : 'Normal',
        status: current.weathercode > 60 ? 'Active' : 'Stable'
      });
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    }
  };

  useEffect(() => {
    fetchWeather();
    axios.get('http://localhost:3000/api/v1/admin-dashboard/warehouses-count')
      .then(res => setWarehouses(res.data.totalWarehouses));
    axios.get('http://localhost:3000/api/v1/admin-dashboard/assignments-pending')
      .then(res => setAssignments(res.data.pendingAssignments));
    axios.get('http://localhost:3000/api/v1/warehouse/low-stock?threshold=10')
      .then(res => setLowStockItems(res.data));
    axios.get('http://localhost:3000/api/v1/warehouse-d/dashboard/total-stock')
      .then(res => setTotalInventory(Number(res.data)));
    axios.get('http://localhost:3000/api/v1/admin-dashboard/me', { withCredentials: true })
      .then(res => setUser(res.data));
  }, []);

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: '15%',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '20%',
            boxShadow: 3,
        }
      }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Avatar sx={{ bgcolor: '#1976d2', mx: 'auto', mb: 1 }}>{user?.fullname?.[0]}</Avatar>
          <Typography variant="h6">{user?.fullname}</Typography>
          <Typography variant="caption">{user?.emailId}</Typography>
        </Box>
        <Divider />
        <List>
          {[
            { label: 'Overview', path: '/admin-dashboard' },
            { label: 'Warehouse', path: '/warehouse-dashboard' },
            { label: 'Transport', path: '/transport' },
            { label: 'Routes', path: '/routes' },
            { label: 'Analytics', path: '/analytics' },
            { label: 'News', path: '/news' },
            { label: 'Alert', path: '/alert' }
          ].map(({ label, path }) => (
            <NavLink key={label} to={path} style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#000',
              fontWeight: isActive ? 'bold' : 'normal',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent',
              display: 'block'
            })}>
              <ListItem button>
                <ListItemText primary={label} />
              </ListItem>
            </NavLink>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          width: '50%',
          mx: 'auto',
          py: 4,
          px: 3,
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">Admin Dashboard</Typography>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          {[{ label: 'Active Warehouses', value: warehouses },
            { label: 'Active Shipments', value: assignments },
            { label: 'Available Resources', value: totalInventory }].map((stat, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Paper elevation={4} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="h6" color="textSecondary">{stat.label}</Typography>
                  <Typography variant="h4" color="primary">{stat.value}</Typography>
                </Paper>
              </Grid>
          ))}
        </Grid>

        {/* Bar Chart */}
        <Box sx={{ mt: 5, height: 400 }}>
          <Typography variant="h6" gutterBottom>📊 Graph Overview</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Jan', value: 400 },
              { name: 'Feb', value: 300 },
              { name: 'Mar', value: 500 },
              {name:'Apr',value:200}
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Weather */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>🌦️ Weather Overview</Typography>
          <Grid container spacing={3} justifyContent="center">
            {[{
              icon: <ThermometerSun />, label: 'Temperature', value: weather.temp, bg: '#e3f2fd'
            }, {
              icon: <CloudRain />, label: 'Rainfall', value: weather.rain, bg: '#e3f2fd'
            }, {
              icon: <Info />, label: 'Warning', value: weather.warning, bg: '#fff8e1'
            }, {
              icon: <AlertTriangle />, label: 'Status', value: weather.status, bg: '#ffebee'
            }].map((item, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper sx={{
                  p: 2, textAlign: 'center', backgroundColor: item.bg, borderRadius: 2
                }}>
                  <Box sx={{ fontSize: 26 }}>{item.icon}</Box>
                  <Typography variant="h6">{item.value}</Typography>
                  <Typography variant="body2">{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Emergency Contacts */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>📞 Emergency Contacts</Typography>
          <Grid container spacing={3} justifyContent={'center'}>
            {regionalContacts.map((contact, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Paper sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 2,
                  boxShadow: 2
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{contact.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{contact.number}</Typography>
                  </Box>
                  <Tooltip title="Copy">
                    <IconButton onClick={() => copyToClipboard(contact.number)}>
                      <ClipboardCopy size={20} />
                    </IconButton>
                  </Tooltip>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Right Sidebar */}
      <Drawer variant="permanent"
        anchor="right"
        sx={{
          width: '20%',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '20%',
            boxShadow: 3,
        }
      }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Low Stock Alerts</Typography>
          <Divider sx={{ mb: 1 }} />
          {lowStockItems.map((item, idx) => (
            <Paper key={idx} sx={{ mb: 1, p: 1, backgroundColor: '#ffe6e6', borderRadius: 2 }}>
              <Typography variant="body2"><strong>{item.itemName.replace(/_/g, ' ')}</strong></Typography>
              <Typography variant="caption">Qty: {item.quantity}</Typography>
            </Paper>
          ))}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;
