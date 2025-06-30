import { DriverAssignment } from "../models/assignment.model.js";
import { User } from "../models/user.models.js";
import { Warehouse } from "../models/warehouse.models.js";
import { PredictedAid } from "../models/prediction.model.js";

// ✅ Helper: Deduct aid items from the warehouse stock
const deductAidFromWarehouse = async (warehouseId, predictedAid) => {
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) throw new Error("Warehouse not found");

  const itemMap = new Map();
  warehouse.items.forEach(item => {
    itemMap.set(item.name, item);
  });

  // ✅ Check & deduct food items
  for (const [key, value] of Object.entries(predictedAid.food)) {
    if (key === "_id") continue; // skip internal _id
    const item = itemMap.get(key);
    if (!item || item.quantity < value) {
      throw new Error(`Insufficient stock of ${key} in warehouse`);
    }
    item.quantity -= value;
  }

  // ✅ Check & deduct non-food items
  for (const [key, value] of Object.entries(predictedAid.non_food)) {
    if (key === "_id") continue; // skip internal _id
    const item = itemMap.get(key);
    if (!item || item.quantity < value) {
      throw new Error(`Insufficient stock of ${key} in warehouse`);
    }
    item.quantity -= value;
  }

  warehouse.lastUpdated = new Date();
  await warehouse.save();
};

// ✅ Controller: Assign aid to a driver
export const assignAidToDriver = async (req, res) => {
  try {
    const { driverId, source, destination, predictedAidId } = req.body;

    // Validate input
    if (!driverId || !source || !destination || !predictedAidId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get predicted aid
    const predictedAid = await PredictedAid.findById(predictedAidId);
    if (!predictedAid) {
      return res.status(404).json({ error: "Predicted Aid not found" });
    }

    // ✅ Convert subdocuments to plain objects to avoid internal fields like _id
    const predictedAidObj = {
      food: predictedAid.food.toObject(),
      non_food: predictedAid.non_food.toObject()
    };

    // ✅ Deduct aid items from warehouse
    await deductAidFromWarehouse(source, predictedAidObj);

    // Create new assignment entry
    const newAssignment = {
      source,
      destination,
      predictedAid: predictedAidId,
      status: "pending"
    };

    // Check if driver already has assignments
    let driverAssignment = await DriverAssignment.findOne({ driverId });

    if (!driverAssignment) {
      driverAssignment = new DriverAssignment({
        driverId,
        assignments: [newAssignment]
      });
    } else {
      driverAssignment.assignments.push(newAssignment);
    }

    await driverAssignment.save();

    // ✅ Mark driver as unavailable
    const updatedDriver = await User.findByIdAndUpdate(
      driverId,
      { availabilityStatus: false },
      { new: true }
    );

    if (!updatedDriver) {
      console.warn("Driver not found or update failed");
    } else {
      console.log("Driver updated successfully:", updatedDriver.fullname);
    }

    // ✅ Respond with success
    res.status(201).json({
      message: "Aid assigned to driver successfully",
      assignment: newAssignment
    });

  } catch (error) {
    console.error("Error assigning aid:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
