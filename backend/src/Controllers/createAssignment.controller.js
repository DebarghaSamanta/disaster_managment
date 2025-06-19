import { DriverAssignment } from "../models/assignment.model.js";
import { AidRecord } from "../models/calculator.models.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const createAssignment = asyncHandler(async (req, res) => {
  const { driverId, source, destination, predictionId } = req.body;

  if (!driverId || !source || !destination || !predictionId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  //  Fetch AidRecord to get predicted_aid
  const aidRecord = await AidRecord.findById(predictionId);
  if (!aidRecord) {
    return res.status(404).json({ message: "Prediction not found" });
  }

  //  Prepare the assignment
  const assignment = {
    source,
    destination,
    status: "pending",
    assignedAt: new Date(),
    predictedAid: aidRecord.predicted_aid // ✅ Attach predicted aid
  };

  //  Update or create DriverAssignment document
  let driver = await DriverAssignment.findOne({ driverId });

  if (driver) {
    driver.assignments.push(assignment);
    await driver.save();
  } else {
    driver = await DriverAssignment.create({
      driverId,
      assignments: [assignment]
    });
  }

  res.status(200).json({ message: "Assignment created", data: driver });
});
