import express from "express";
import {
  handleChat,
  getDisasterAlerts,
  getEmergencyContacts
} from "../Controllers/chat.controller.js";

const router = express.Router();

// POST - chat with Groq model
router.post("/talk", handleChat);

// GET - static emergency contact info
router.get("/contacts", getEmergencyContacts);

// GET - dynamic disaster alerts from ReliefWeb
router.get("/alerts", getDisasterAlerts);

export default router;
