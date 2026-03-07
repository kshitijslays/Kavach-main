import express from "express";
import { triggerEmergencyAlert } from "../controllers/emergencyController.js";

const router = express.Router();

// 🚨 Trigger automated zero-click emergency alerts
router.post("/alert", triggerEmergencyAlert);

export default router;
