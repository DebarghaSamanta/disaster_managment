import axios from 'axios';
import RSSParser from 'rss-parser';
import { News } from '../models/news.model.js';

const parser = new RSSParser();

const RSS_FEEDS = [
  'https://www.thehindu.com/news/national/feeder/default.rss',
  'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
  'https://feeds.feedburner.com/ndtvnews-top-stories'
];

const disasterKeywords = [
  "natural disaster", "disaster", "flood", "earthquake", "cyclone",
  "landslide", "tsunami", "relief", "rescue", "evacuation",
  "emergency", "aftershock", "mudslide", "storm",
  "weather alert", "disaster management", "monsoon havoc"
];

const bannedWords = [
  "modi", "bjp", "congress", "rahul", "pm", "minister", "cabinet",
  "election", "finance", "stock", "business", "politics", "economy",
  "sports", "startup", "assembly", "parliament", "shinde", "thackeray",
  "education", "religion", "language row", "bollywood", "actor", "cricket",
  "ipl", "budget", "trade", "gdp", "tax", "court", "justice", "film", "movie"
];

const bannedSources = [
  "India Today", "Business Today", "Moneycontrol", "ET Now"
];

// ✅ Checks if article is disaster-related and NOT political/irrelevant
const isRelevant = ({ title = "", description = "", content = "", creator = "", source = "" }) => {
  const text = `${title} ${description} ${content} ${creator} ${source}`.toLowerCase();
  const hasKeyword = disasterKeywords.some(word => text.includes(word));
  const hasBanned = bannedWords.some(word => text.includes(word));
  return hasKeyword && !hasBanned;
};

const isSourceAllowed = (source = "") =>
  !bannedSources.some(s => source.toLowerCase().includes(s.toLowerCase()));

// ✅ Get latest news from DB
export const getLatestNews = async (_req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 }).limit(10);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

// ✅ Fetch and store strictly disaster-related news
export const fetchAndStoreNews = async () => {
  try {
    // 1. 📡 From NewsAPI
    const { data } = await axios.get(
      `https://newsapi.org/v2/everything?q=("natural disaster" OR flood OR earthquake OR cyclone OR landslide OR tsunami OR "disaster relief" OR "emergency response") AND India&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API}`
    );

    for (const article of data.articles) {
      const textFields = {
        title: article.title,
        description: article.description || "",
        content: article.content || "",
        source: article.source.name || ""
      };

      if (!isRelevant(textFields) || !isSourceAllowed(article.source.name)) continue;

      const exists = await News.findOne({ link: article.url });
      if (!exists) {
        await News.create({
          title: article.title,
          summary: article.description,
          source: article.source.name,
          publishedAt: article.publishedAt,
          imageUrl: article.urlToImage,
          link: article.url
        });
      }
    }

    // 2. 🌐 From RSS feeds
    for (const feedUrl of RSS_FEEDS) {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items) {
        const textFields = {
          title: item.title || "",
          description: item.contentSnippet || "",
          content: item.content || "",
          creator: item.creator || "",
          source: feed.title || ""
        };

        if (!isRelevant(textFields) || !isSourceAllowed(feed.title)) continue;

        const exists = await News.findOne({ link: item.link });
        if (!exists) {
          await News.create({
            title: item.title,
            summary: item.contentSnippet || "No summary available",
            source: feed.title || item.creator || "Unknown",
            publishedAt: item.isoDate || new Date(),
            imageUrl: item.enclosure?.url || "",
            link: item.link
          });
        }
      }
    }

    console.log("✅ Strictly filtered news (API + RSS) updated.");
  } catch (error) {
    console.error("❌ News fetch error:", error.message);
  }
};
