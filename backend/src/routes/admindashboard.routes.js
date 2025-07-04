import express from 'express';
import {getTotalWarehouses, getPendingAssignments,getCurrentUser } from '../Controllers/admin.warehouse.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.get('/warehouses-count', getTotalWarehouses);
router.get('/assignments-pending',getPendingAssignments)
router.get("/me", verifyJWT, getCurrentUser);
export default router