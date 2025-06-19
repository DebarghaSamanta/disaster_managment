import { User } from "../models/user.models.js";

export const makeDriverAvailable = async (req, res) => {
  try {
    const driverId = req.params.id;

    const updatedDriver = await User.findByIdAndUpdate(
      driverId,
      { availabilityStatus: true },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json({
      message: "Driver availability set to true",
      driver: updatedDriver
    });
  } catch (error) {
    console.error("Error making driver available:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
