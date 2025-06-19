import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  predictedAid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PredictedAid",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "delivered"],
    default: "pending"
  }
}, { _id: true }); // So each assignment has its own ID

const driverAssignmentSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  assignments: {
    type: [assignmentSchema],
    default: []
  }
});

export const DriverAssignment = mongoose.model("DriverAssignment", driverAssignmentSchema);
