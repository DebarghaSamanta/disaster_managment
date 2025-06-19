import mongoose, { Schema } from "mongoose";



const aidRecordSchema = new Schema({
  input: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"InputSchema",
    required: true
},
  predicted_aid: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"PredictedAid",
    required: true}
}, { timestamps: true });

export const AidRecord = mongoose.model("AidRecord", aidRecordSchema);
