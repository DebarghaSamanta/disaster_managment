import express from 'express';
import { predictAid } from "../Controllers/calculator.controller.js";
import isavailable from '../Controllers/isavailable.contoller.js';
import { createAssignment } from '../Controllers/createAssignment.controller.js';
const router = express.Router();

router.post('/predict', predictAid);
router.route('/assign').get(isavailable)
router.route('/create').post(createAssignment)
export default router;
