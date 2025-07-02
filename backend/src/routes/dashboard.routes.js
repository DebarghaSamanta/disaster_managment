import express from 'express';
import { getGlobalStockSummary, getTotalStock } from "../Controllers/dashboard.controller.js";
const router = express.Router()

router.get('/dashboard/total-stock',getTotalStock)
router.get('/dashboard/stock-summary',getGlobalStockSummary)
export default router