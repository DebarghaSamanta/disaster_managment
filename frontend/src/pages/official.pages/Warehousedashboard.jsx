import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Inventory2Outlined,
  LocalShippingOutlined,
  ReportProblemOutlined,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const WarehouseDashboard = () => {
  const [totalInventory, setTotalInventory] = useState(0);
  const [stockSummary, setStockSummary] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openWarehouseDialog, setOpenWarehouseDialog] = useState(false);

  const [addStockData, setAddStockData] = useState({
    warehouseId: '',
    name: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: ''
  });

  const [newWarehouse, setNewWarehouse] = useState({
    warehouseName: '',
    location: { address: '', city: '', state: '', pincode: '' },
    capacity: ''
  });

  useEffect(() => {
    axios.get("http://localhost:3000/api/v1/warehouse/all-warehouses")
      .then(res => setWarehouses(res.data))
      .catch(err => console.error("Error fetching warehouses", err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/warehouse-d/dashboard/total-stock')
      .then(res => setTotalInventory(Number(res.data)))
      .catch(err => console.error("Failed to fetch total inventory", err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/warehouse-d/dashboard/stock-summary')
      .then(res => setStockSummary(res.data))
      .catch(err => console.error("Failed to fetch stock summary", err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/warehouse/low-stock?threshold=10')
      .then(res => setLowStockItems(res.data))
      .catch(err => console.error("Failed to fetch low stock items", err));
  }, []);

  const handleAddStock = async () => {
    try {
      await axios.post(`http://localhost:3000/api/v1/warehouse/${addStockData.warehouseId}/stock`, addStockData);
      alert("Stock added successfully!");
      setOpenAddDialog(false);
    } catch (err) {
      alert("Error adding stock");
    }
  };

  const handleCreateWarehouse = async () => {
    try {
      await axios.post('http://localhost:3000/api/v1/warehouse', newWarehouse);
      alert("Warehouse created successfully!");
      setOpenWarehouseDialog(false);
    } catch (err) {
      alert("Error creating warehouse");
    }
  };

  const formatItemName = (name) =>
    name.replace(/_/g, ' ').split(' ')[0].toLowerCase().replace(/^\w/, c => c.toUpperCase());

  return (
    <Box sx={{ p: 4, backgroundColor: '#f9fbfd', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>Dashboard</Typography>

      {/* Top Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #3f51b5' }}>
            <Inventory2Outlined fontSize="large" color="primary" />
            <Typography variant="body2">Total Stock</Typography>
            <Typography variant="h5">{totalInventory}</Typography>
            <Typography variant="caption" color="green">+5.2%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #43a047' }}>
            <LocalShippingOutlined fontSize="large" sx={{ color: "#43a047" }} />
            <Typography variant="body2">Distributed Today</Typography>
            <Typography variant="h5">1,234</Typography>
            <Typography variant="caption" color="green">+12.3%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #ef5350' }}>
            <ReportProblemOutlined fontSize="large" sx={{ color: "#ef5350" }} />
            <Typography variant="body2">Low Stock Items</Typography>
            <Typography variant="h5">{lowStockItems.length}</Typography>
            <Typography variant="caption" color="error">-2.1%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #ffa726' }}>
            <HourglassEmptyIcon fontSize="large" sx={{ color: "#ffa726" }} />
            <Typography variant="body2">Pending</Typography>
            <Typography variant="h5">45</Typography>
            <Typography variant="caption" color="green">+8.4%</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box sx={{ my: 5, height: 400 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Stock Overview</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stockSummary} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantity" fill="#3f51b5" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Stock Summary Cards */}
      <Typography variant="h6" sx={{ mt: 4 }}>Stock Summary</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {stockSummary.map((item, idx) => {
          const isLow = item.quantity < 100;
          return (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                sx={{
                  height: '150px',
                  width: '229px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: '#fff',
                  border: isLow ? '2px solid #ff6b6b' : '1px solid #e0e0e0',
                  boxShadow: isLow ? '0 0 10px rgba(255,0,0,0.2)' : 'none'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {formatItemName(item.name)}
                </Typography>
                <Typography variant="h6">{item.quantity} {item.unit}</Typography>
                {isLow && <Typography color="error" fontSize={12}>Low Stock Alert</Typography>}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Low Stock Items */}
      <Typography variant="h6" sx={{ mt: 4 }}>Low Stock Items</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {lowStockItems.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper sx={{ p: 2, backgroundColor: '#ffe6e6' }}>
              <Typography><strong>Item:</strong> {formatItemName(item.itemName)}</Typography>
              <Typography><strong>Warehouse:</strong> {item.warehouseName}</Typography>
              <Typography><strong>Quantity:</strong> {item.quantity}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => setOpenAddDialog(true)}>Add Stock</Button>
        <Button variant="outlined" onClick={() => setOpenWarehouseDialog(true)}>Create Warehouse</Button>
      </Box>

      {/* Add Stock Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Stock</DialogTitle>
        <DialogContent>
          {/* Warehouse Dropdown */}
          <TextField
          select
          label="Select Warehouse"
          fullWidth
          variant="standard"
          sx={{ mt: 2 }}
          InputLabelProps={{ shrink: true }}
          value={addStockData.warehouseId}
          onChange={(e) => setAddStockData({ ...addStockData, warehouseId: e.target.value })}
          SelectProps={{ native: true }}
        >
          <option value="">-- Select Warehouse --</option>
          {warehouses.map((wh) => (
            <option key={wh._id} value={wh._id}>{wh.warehouseName}</option>
          ))}
        </TextField>

          {/* Item Dropdown */}
          <TextField
            select
            label="Select Item"
            fullWidth
            variant="standard"
            sx={{mt:2}}
            InputLabelProps={{ shrink: true }}
            value={addStockData.name}
            onChange={(e) => setAddStockData({ ...addStockData, name: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="">Select Item</option>
            {[
              "Rice_kg", "Lentils_kg", "Oil_l", "Salt_kg", "Sugar_kg",
              "DryFood_kg", "Protein_kg", "Vegetables_kg", "Water_l",
              "Medicines_Units", "Sanitary_Napkin_Packets"
            ].map((item) => (
              <option key={item} value={item}>{formatItemName(item)}</option>
            ))}
          </TextField>

          {/* Category Dropdown */}
          <TextField
            select
            label="Category"
            fullWidth
            variant="standard"
            sx={{mt:2}}
            InputLabelProps={{ shrink: true }}
            value={addStockData.category}
            onChange={(e) => setAddStockData({ ...addStockData, category: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="">Select Category</option>
            <option value="food">Food</option>
            <option value="non-food">Non-Food</option>
          </TextField>

          {/* Unit Dropdown */}
          <TextField
            select
            label="Unit"
            fullWidth
            variant="standard"
            sx={{mt:2}}
            InputLabelProps={{ shrink: true }}
            value={addStockData.unit}
            onChange={(e) => setAddStockData({ ...addStockData, unit: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="">Select Unit</option>
            <option value="kg">kg</option>
            <option value="l">l</option>
            <option value="Packets">Packets</option>
            <option value="Units">Units</option>
          </TextField>

          {/* Quantity and Date */}
          <TextField
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            variant="standard"
            value={addStockData.quantity}
            onChange={(e) => setAddStockData({ ...addStockData, quantity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Expiry Date"
            type="date"
            fullWidth
            variant="standard"
            InputLabelProps={{ shrink: true }}
            value={addStockData.expiryDate}
            onChange={(e) => setAddStockData({ ...addStockData, expiryDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStock}>Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Create Warehouse Dialog */}
      <Dialog open={openWarehouseDialog} onClose={() => setOpenWarehouseDialog(false)}>
        <DialogTitle>Create Warehouse</DialogTitle>
        <DialogContent>
          <TextField label="Warehouse Name" fullWidth variant="standard" sx={{ mt: 2 }}
            value={newWarehouse.warehouseName}
            onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })}
          />
          {['address', 'city', 'state', 'pincode'].map((field) => (
            <TextField key={field} label={field} fullWidth variant="standard" sx={{ mt: 2 }}
              value={newWarehouse.location[field]}
              onChange={(e) =>
                setNewWarehouse({
                  ...newWarehouse,
                  location: { ...newWarehouse.location, [field]: e.target.value }
                })
              }
            />
          ))}
          <TextField label="Capacity" fullWidth variant="standard" sx={{ mt: 2 }}
            value={newWarehouse.capacity}
            onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWarehouseDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateWarehouse}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseDashboard;
