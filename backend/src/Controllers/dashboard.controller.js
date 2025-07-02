import { Warehouse } from "../models/warehouse.models.js";
// GET /dashboard/total-stock
const getTotalStock = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    let totalQuantity = 0;

    warehouses.forEach(wh => {
      wh.items.forEach(item => {
        totalQuantity += item.quantity;
      });
    });

    res.status(200).json(totalQuantity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getGlobalStockSummary = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();

    const itemTotals = {};

    warehouses.forEach(warehouse => {
      warehouse.items.forEach(item => {
        const key = item.name;
        if (!itemTotals[key]) {
          itemTotals[key] = {
            name: key,
            quantity: item.quantity,
            unit: item.unit || '',
            category: item.category || ''
          };
        } else {
          itemTotals[key].quantity += item.quantity;
        }
      });
    });

    const result = Object.values(itemTotals); // convert from object to array

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 export {getTotalStock,getGlobalStockSummary}
