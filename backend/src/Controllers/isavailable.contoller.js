import { User } from "../models/user.models.js";
import { DriverAssignment } from "../models/assignment.model.js";

export const getEligibleDriversForAssignment = async (req, res) => {
  try {
    // Step 1: Get all drivers with availabilityStatus = true and department = "driver"
    const drivers = await User.find({ 
      department: "Driver", 
      availabilityStatus: true 
    });

    const eligibleDrivers = [];

    for (const driver of drivers) {
      // Step 2: Check if driver has assignments
      const assignmentDoc = await DriverAssignment.findOne({ driverId: driver._id });

      // No assignment yet — still eligible
      if (!assignmentDoc || assignmentDoc.assignments.length === 0) {
        eligibleDrivers.push({
          DriverId:driver._id,
          fullName: driver.fullname,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber
        });
        continue;
      }

      // Check if all assignments are delivered
      const allDelivered = assignmentDoc.assignments.every(a => a.status === "delivered");
      if (allDelivered) {
        eligibleDrivers.push({
          fullName: driver.fullName,
          vehicleType: driver.vehicleType,
          vehicleNumber: driver.vehicleNumber
        });
      }
    }

    res.status(200).json(eligibleDrivers);

  } catch (error) {
    console.error("Error fetching eligible drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
