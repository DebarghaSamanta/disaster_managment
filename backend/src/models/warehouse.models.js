import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  category: {
     type: String,
     enum: ['food', 'non-food'], 
     required: true 
    },
  quantity: { 
    type: Number,
     required: true 
    },
  unit: { 
    type: String 
}, 
  expiryDate: { 
    type: Date 
}
});

const warehouseSchema = new mongoose.Schema({
  warehouseName: { type: String, required: true },
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  capacity: { type: Number }, 
  items: [itemSchema],
  lastUpdated: { type: Date, default: Date.now },
},{timestamps:true});

export const Warehouse = mongoose.model('Warehouse', warehouseSchema);
