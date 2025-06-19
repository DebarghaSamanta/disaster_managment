import mongoose,{Schema} from "mongoose";
const inputSchema = new Schema({
  area_name: {
     type: String, 
     required: true },
  area_size: { 
    type: Number, 
    required: true },
  region: { type: String,
     required: true },
  disaster_type: { 
    type: String, 
    required: true },
  severity: { type: String, 
    enum: ["mild", "moderate", "severe"],
     required: true },
  days: { 
    type: Number,
     required: true },
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
});
export const InputSchema = mongoose.model("InputSchema", inputSchema)