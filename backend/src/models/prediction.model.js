import mongoose,{Schema} from "mongoose";
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
});

const nonFoodSchema = new Schema({
  Medicines_Units: Number,
  Sanitary_Napkin_Packets: Number
});

const predictedAidSchema = new Schema({
  food: foodSchema,
  non_food: nonFoodSchema,
  total_weight:{
    type:Number
}}, { timestamps: true });

export const PredictedAid = mongoose.model("PredictedAid", predictedAidSchema);