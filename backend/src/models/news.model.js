import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  source: String,
  publishedAt: Date,
  imageUrl: String,
  link: String,
});

export const News = mongoose.model('News', newsSchema);
