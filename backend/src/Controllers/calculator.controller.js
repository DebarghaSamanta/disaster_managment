import { InputSchema } from "../models/inputprediction.model.js";
import { PredictedAid } from "../models/prediction.model.js";
import { AidRecord } from "../models/calculator.models.js";

const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

const getAdjustmentFactors = (severity, region) => {
  let bufferRange = [0, 5];
  if (severity === 'moderate') bufferRange = [5, 10];
  else if (severity === 'severe') bufferRange = [10, 20];

  if (['rural', 'tribal'].includes(region.toLowerCase())) {
    bufferRange[0] += 2;
    bufferRange[1] += 5;
  }

  const buffer_percentage = Math.round(getRandomInRange(bufferRange[0], bufferRange[1]));
  const protein_adjustment_factor = parseFloat(getRandomInRange(0.9, 1.3).toFixed(2));
  const water_adjustment_factor = parseFloat(getRandomInRange(0.9, 1.2).toFixed(2));

  

  return { buffer_percentage, protein_adjustment_factor, water_adjustment_factor };
};

const createAidPrediction = async (req, res) => {
  try {
    const {
      area_name, area_size, region, disaster_type, severity, days,
      children, adult_males, adult_females, elderly
    } = req.body;

    const total = children + adult_males + adult_females + elderly;
    if (total === 0 || area_size <= 0 || days <= 0) {
      return res.status(400).json({ error: "Invalid input values" });
    }

    // Step 1: Save input separately
    const inputDoc = await InputSchema.create({
      area_name, area_size, region, disaster_type, severity, days,
      children, adult_males, adult_females, elderly, total
    });

    // Step 2: Calculate aid
    const adj = getAdjustmentFactors(severity, region);
    const buffer = 1 + adj.buffer_percentage / 100;

    const dailyNeeds = {
      Rice_kg: 0.4,
      Lentils_kg: 0.1,
      Oil_l: 0.035,
      Salt_kg: 0.005,
      Sugar_kg: 0.01,
      DryFood_kg: 0.05,
      Protein_kg: 0.15 * adj.protein_adjustment_factor,
      Vegetables_kg: 0.2,
      Water_l: 5 * adj.water_adjustment_factor
    };

    const food = {};
    for (const [key, base] of Object.entries(dailyNeeds)) {
      food[key] = Math.round(total * base * days * buffer);
    }

    const non_food = {
      Medicines_Units: Math.round((total / 10) * days * buffer),
      Sanitary_Napkin_Packets: Math.round((adult_females / 7) * days * buffer)
    };

    const min_water = total * 2 * days;
    const min_protein = total * 0.1 * days;
    if (food.Water_l < min_water) food.Water_l = min_water;
    if (food.Protein_kg < min_protein) food.Protein_kg = min_protein;
    let total_weight = Object.values(food).reduce((sum, val) => sum + val, 0);

    // Convert non-food item units to kg equivalents
    total_weight += non_food.Medicines_Units * 0.01;
    total_weight += non_food.Sanitary_Napkin_Packets * 0.1;
    // Step 3: Save predicted aid
    const aidPrediction = await PredictedAid.create({
      food,
      non_food,
      total_weight
    });

    // Step 4: Create AidRecord linking input and predicted aid
    const aidRecord = await AidRecord.create({
      input: inputDoc._id,
      predicted_aid: aidPrediction._id
    });

    res.status(201).json({
      message: "Aid predicted and stored successfully",
      aid_record_id: aidRecord._id,
      input_id: inputDoc._id,
      predicted_aid_id: aidPrediction._id
    });

  } catch (err) {
    console.error("Prediction Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch AidRecord with populated input and aid
const getAidRecord = async (req, res) => {
  try {
    const record = await AidRecord.findById(req.params.id)
      .populate("input")
      .populate("predicted_aid");
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  } catch (err) {
    console.error("GetAidRecord Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Get predicted aid by ID
const getPredictedAidById = async (req, res) => {
  try {
    const prediction = await PredictedAid.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: "Prediction not found" });
    res.json(prediction);
  } catch (err) {
    console.error("GetPredictedAidById Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

 const getInputById = async (req, res) => {
  try {
    const input = await InputSchema.findById(req.params.id);
    if (!input) return res.status(404).json({ error: "Input not found" });
    res.json(input);
  } catch (err) {
    console.error("GetInputById Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export {createAidPrediction,getAidRecord,getPredictedAidById,getInputById}
