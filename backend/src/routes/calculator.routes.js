import express from 'express';
import { predictAid } from "../Controllers/calculator.controller.js";
const router = express.Router();

router.post('/predict', predictAid);

export default router;
