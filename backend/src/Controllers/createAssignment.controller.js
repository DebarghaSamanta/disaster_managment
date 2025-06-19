import { DriverAssignment } from "../models/assignment.model.js";
import { User } from "../models/user.models.js";
export const assignAidToDriver = async (req, res) => {
  try {
    const { driverId, source, destination, predictedAidId } = req.body;

    if (!driverId || !source || !destination || !predictedAidId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the new assignment
    const newAssignment = {
      source,
      destination,
      predictedAid: predictedAidId,
      status: "pending"
    };

    // Check if DriverAssignment already exists
    let driverAssignment = await DriverAssignment.findOne({ driverId });

    if (!driverAssignment) {
      // If not, create a new document
      driverAssignment = new DriverAssignment({
        driverId,
        assignments: [newAssignment]
      });
    } else {
      // Else push new assignment to existing one
      driverAssignment.assignments.push(newAssignment);
    }

    // Save to DB
    await driverAssignment.save();

    const updatedDriver = await User.findByIdAndUpdate(driverId, { availabilityStatus: false },{new:true});
    if (!updatedDriver) {
      console.warn("Driver not found or update failed");
    } else {
      console.log("Driver updated successfully:", updatedDriver.fullname);
    }
    res.status(201).json({
      message: "Aid assigned to driver successfully",
      assignment: newAssignment
    });

  } catch (error) {
    console.error("Error assigning aid:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
