import { Warehouse } from "../models/warehouse.models.js";
import { PredictedAid } from "../models/prediction.model.js";
const createWarehouse = async (req, res) => {
  const warehouse = new Warehouse(req.body);
  await warehouse.save();
  global._io.emit('warehouseUpdated', warehouse);
  res.status(201).json(warehouse);
};

const getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }
    res.json(warehouse);
    } catch (err) {
    res.status(500).json({ message: "Invalid ID or Server Error", error: err.message });
  }
};

const addStock = async (req, res) => {
  const { name, category, quantity, unit, expiryDate } = req.body;

  try {
    // findOne with raw ID of warehouse
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    // Find item by name and category of item
    const existing = warehouse.items.find(
      item => item.name === name && item.category === category
    );

    if (existing) {
      existing.quantity += quantity;
      existing.expiryDate = expiryDate || existing.expiryDate;
    } else {
      warehouse.items.push({ name, category, quantity, unit, expiryDate });
      req.io.emit("newStockItem", { warehouseId: req.params.id, name });
    }

    warehouse.lastUpdated = new Date();
    await warehouse.save();

    req.io.emit("stockUpdated", { warehouseId: req.params.id, name });

    res.status(200).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const decrementStock = async (req, res) => {
  const { name, quantity, threshold = 50 } = req.body;

  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    const item = warehouse.items.find(item => item.name === name);

    if (!item) {
      return res.status(404).json({ message: "Item not found in warehouse" });
    }

    item.quantity -= quantity;
    item.expiryDate = item.expiryDate || null;
    warehouse.lastUpdated = new Date();

    await warehouse.save();

    req.io.emit("stockUpdated", { warehouseId: req.params.id, itemName: name });

    if (item.quantity < threshold) {
      req.io.emit("lowStockAlert", {
        warehouseId: req.params.id,
        itemName: name,
        quantity: item.quantity
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getStock = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    // Return just the items (stock)
    res.status(200).json(warehouse.items);
  } catch (err) {
    res.status(500).json({
      message: "Invalid ID or Server Error",
      error: err.message
    });
  }
};

const getLowStock = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 10;

  try {
    const warehouses = await Warehouse.find();
    const lowStock = [];

    warehouses.forEach(warehouse => {
      warehouse.items.forEach(item => {
        // If quantity is below threshold, include it
        if (item.quantity < threshold) {
          lowStock.push({
            warehouseId: warehouse._id,
            itemName: item.name,
            quantity: item.quantity
          });
        }
      });
    });

    res.status(200).json(lowStock);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const searchStock = async (req, res) => {
  const item = req.query.item;

  try {
    if (!item) {
      return res.status(400).json({ message: "Query parameter 'item' is required" });
    }

    const warehouses = await Warehouse.find({ 'items.name': item });

    const results = [];

    warehouses.forEach(warehouse => {
      const matchedItem = warehouse.items.find(i => i.name === item);
      if (matchedItem) {
        results.push({
          warehouseId: warehouse._id,
          itemName: matchedItem.name,
          quantity: matchedItem.quantity
        });
      }
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const getEligibleWarehouses = async (req, res) => {
  try {
    const { predictedAidId } = req.params;
    const predictedAid = await PredictedAid.findById(predictedAidId);
    if (!predictedAid) return res.status(404).json({ error: "Predicted aid not found" });

    const eligibleWarehouses = await Warehouse.find().lean();
    const eligible = [];

    for (const warehouse of eligibleWarehouses) {
      let hasEnough = true;

      // Create an item map from warehouse items
      const itemMap = new Map();
      warehouse.items.forEach(item => {
        itemMap.set(item.name, item.quantity);
      });

      // Check food
      for (const [key, requiredQty] of Object.entries(predictedAid.food)) {
        if ((itemMap.get(key) || 0) < requiredQty) {
          hasEnough = false;
          break;
        }
      }

      // Check non-food
      if (hasEnough) {
        for (const [key, requiredQty] of Object.entries(predictedAid.non_food)) {
          if ((itemMap.get(key) || 0) < requiredQty) {
            hasEnough = false;
            break;
          }
        }
      }

      if (hasEnough) {
        eligible.push({
          _id: warehouse._id,
          warehouseName: warehouse.warehouseName,
          location: warehouse.location
        });
      }
    }

    res.json(eligible);
  } catch (error) {
    console.error("GetEligibleWarehouses Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export {createWarehouse,getWarehouse,addStock,decrementStock,getStock,getLowStock,searchStock,getEligibleWarehouses}