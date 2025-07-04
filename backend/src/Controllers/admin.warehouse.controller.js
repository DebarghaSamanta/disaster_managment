// controllers/admin.controller.js
import { Warehouse } from '../models/warehouse.models.js';
import { asyncHandler } from "../utils/asynchandler.js";
import { DriverAssignment } from '../models/assignment.model.js';
 const getTotalWarehouses = async (req, res) => {
  try {
    const count = await Warehouse.countDocuments();
    res.status(200).json({ totalWarehouses: count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching warehouse count", error: error.message });
  }
};
// controllers/admin.controller.js


const getPendingAssignments = async (req, res) => {
  try {
    const allAssignments = await DriverAssignment.find();

    let pendingCount = 0;
    for (const driver of allAssignments) {
      pendingCount += driver.assignments.filter(a => a.status === "pending").length;
    }

    res.status(200).json({ pendingAssignments: pendingCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending assignments", error: error.message });
  }
};


const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  res.status(200).json(req.user); // `req.user` already excludes password and refreshToken
});

export {getTotalWarehouses,getPendingAssignments,getCurrentUser}
