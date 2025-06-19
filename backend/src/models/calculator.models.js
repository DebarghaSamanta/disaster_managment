import mongoose, { Schema } from "mongoose";

const populationSchema = new Schema({
  children: { 
    type: Number, 
    required: true 
  },
  adult_males:{
     type: Number,
     required: true 
  },
  adult_females: {
     type: Number,
     required: true 
  },
  elderly: {
     type: Number, 
     required: true 
  },
  total: { 
    type: Number,
     required: true
 }
}, { _id: false });

const foodSchema = new Schema({
  Rice_kg: Number,
  Lentils_kg: Number,
  Oil_l: Number,
  Salt_kg: Number,
  Sugar_kg: Number,
  DryFood_kg: Number,
  Protein_kg: Number,
  Vegetables_kg: Number,
  Water_l: Number
}, { _id: false });

const nonFoodSchema = new Schema({
  Medicines_Units: Number,
  Sanitary_Napkin_Packets: Number
}, { _id: false });

const aiOutputSchema = new Schema({
  buffer_percentage: { type: Number, required: true },
  protein_adjustment_factor: { type: Number, required: true },
  water_adjustment_factor: { type: Number, required: true },
  reasoning: { type: String }
}, { _id: false });

const predictedAidSchema = new Schema({
  food: foodSchema,
  non_food: nonFoodSchema,
  buffer_percentage: Number,
  reasoning: String
}, { _id: false });

const aidRecordSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  area_name: { type: String, required: true },
  area_size: { type: Number, required: true },
  region: { type: String, required: true },
  disaster_type: { type: String, required: true },
  severity: { type: String, enum: ["mild", "moderate", "severe"], required: true },
  days: { type: Number, required: true },
  population: populationSchema,
  ai_output: aiOutputSchema,
  predicted_aid: predictedAidSchema
}, { timestamps: true });

export const AidRecord = mongoose.model("AidRecord", aidRecordSchema);
