import express from 'express';
import { createAidPrediction, getAidRecord,getInputById,getPredictedAidById } from "../Controllers/calculator.controller.js";
import { getEligibleDriversForAssignment } from '../Controllers/isavailable.contoller.js';
import { assignAidToDriver } from '../Controllers/createAssignment.controller.js';
import { makeDriverAvailable } from '../Controllers/demo.controller.js';
const router = express.Router();

router.post('/predict', createAidPrediction);
router.get('/input_record/:id',getAidRecord);
router.get("/input/:id", getInputById);
router.get("/prediction/:id", getPredictedAidById);
router.get("/available-drivers", getEligibleDriversForAssignment);
router.route('/assign-aid-driver').post(assignAidToDriver)
router.route('/make-driver-available/:id').patch(makeDriverAvailable)
export default router;
