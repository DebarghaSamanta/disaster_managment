import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ThermometerSun,
  CloudRain,
  Info,
  ChevronRight,
  PhoneCall,
  ClipboardCopy,
} from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import "./NewsPage.css";

const socket = io("http://localhost:3000"); // your backend host

export default function DisasterWatchDashboard() {
  const [news, setNews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [sortType, setSortType] = useState("latest");
  const [weather, setWeather] = useState({
    temp: "--",
    rain: "--",
    warning: "--",
    status: "--",
  });

  const regionalContacts = [
    { label: "NDMA (Disaster Mgmt)", number: "1078" },
    { label: "Ambulance", number: "108" },
    { label: "Fire", number: "101" },
    { label: "Police", number: "100" },
    { label: "Flood Helpline", number: "011-1070" },
    { label: "Earthquake Response", number: "011-24363260" },
    { label: "State Helpline (West Bengal)", number: "033-22143526" },
  ];

  useEffect(() => {
    fetchNews();
    fetchWeather();

    socket.on("alert", (data) => {
      setAlerts((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("alert");
      socket.disconnect();
    };
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/news/latest");
      setNews(res.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        "https://api.open-meteo.com/v1/forecast?latitude=22.5744&longitude=88.3629&current=temperature_2m,precipitation,weathercode&timezone=auto"
      );
      const current = res.data.current;
      const warning = current.weathercode > 60 ? "Severe" : "Normal";
      const status = current.weathercode > 60 ? "Active" : "Stable";
      setWeather({
        temp: `${current.temperature_2m}°C`,
        rain: `${current.precipitation} mm`,
        warning,
        status,
      });
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text} to clipboard`);
  };

  const sortedNews = [...news].sort((a, b) =>
    sortType === "latest"
      ? new Date(b.publishedAt) - new Date(a.publishedAt)
      : new Date(a.publishedAt) - new Date(b.publishedAt)
  );

  return (
    <>
      <div className="dashboard-container">
        {/* 🔴 Alert Banner */}
        {alerts.length > 0 && (
          <motion.div
            className="alert-banner"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <AlertCircle className="alert-icon" />
            {alerts[0]}
          </motion.div>
        )}

        {/* Header Title */}
        <div className="dashboard-header">
          <h1>🛑 DisasterWatch Dashboard</h1>
          <p>
            Real-time <strong>disaster-related</strong> updates, news, and
            emergency weather alerts.
          </p>
        </div>

        {/* Sort Buttons */}
        <div className="sort-buttons">
          <button
            className={`sort-btn ${sortType === "latest" ? "active" : ""}`}
            onClick={() => setSortType("latest")}
          >
            Latest
          </button>
          <button
            className={`sort-btn ${sortType === "oldest" ? "active" : ""}`}
            onClick={() => setSortType("oldest")}
          >
            Oldest
          </button>
        </div>

        {/* News Grid or Article Detail */}
        {!selectedArticle ? (
          <div className="news-grid">
            {sortedNews.length === 0 ? (
              <p className="no-news-msg">
                🚨 No disaster-related news available at the moment.
              </p>
            ) : (
              sortedNews.map((item) => (
                <motion.div
                  key={item._id}
                  className="news-card"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedArticle(item)}
                >
                  <img
                    src={item.imageUrl || "/placeholder.jpg"}
                    alt="News"
                    className="news-img"
                  />
                  <div className="news-content">
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-summary">
                      {item.summary || "No summary available."}
                    </p>
                  </div>
                  <div className="news-meta">
                    Source: {item.source} |{" "}
                    {new Date(item.publishedAt).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="article-detail">
            <button
              onClick={() => setSelectedArticle(null)}
              className="back-btn"
            >
              <ChevronRight className="back-icon" /> Back to News
            </button>
            <img
              src={selectedArticle.imageUrl || "/placeholder.jpg"}
              className="article-img"
              alt="Selected"
            />
            <h2>{selectedArticle.title}</h2>
            <p>{selectedArticle.summary || "No summary available."}</p>
            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more"
            >
              Read full article ↗
            </a>
          </div>
        )}

        {/* Weather Cards */}
        <div className="footer-cards">
          <div className="footer-card">
            <ThermometerSun className="footer-icon icon-blue" />
            <div className="value">{weather.temp}</div>
            <p>Temperature</p>
          </div>
          <div className="footer-card">
            <CloudRain className="footer-icon icon-blue" />
            <div className="value">{weather.rain}</div>
            <p>Rainfall</p>
          </div>
          <div className="footer-card">
            <Info className="footer-icon icon-yellow" />
            <div className="value">{weather.warning}</div>
            <p>Warning</p>
          </div>
          <div className="footer-card">
            <AlertCircle className="footer-icon icon-red" />
            <div className="value">{weather.status}</div>
            <p>Status</p>
          </div>
        </div>

        {/* Emergency Contact Cards */}
        <div className="emergency-contact-box">
          <h3>📞 Emergency Contacts</h3>
          <div className="emergency-contact-grid">
            {regionalContacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <PhoneCall size={20} className="contact-icon" />
                <div>
                  <div className="contact-label">{contact.label}</div>
                  <div className="contact-number">{contact.number}</div>
                </div>
                <ClipboardCopy
                  className="copy-icon"
                  size={18}
                  onClick={() => copyToClipboard(contact.number)}
                  style={{ marginLeft: "auto", cursor: "pointer" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Width Footer */}
      {/* Full-Width Footer */}
      <footer className="footer full-footer">
        <div className="footer-content">
          <div className="footer-column">
            
          </div>
        </div>

        <div className="footer-bottom">
          © 2025 DisasterWatch · Built with ❤️ for Safety and Awareness.
        </div>
      </footer>
    </>
  );
}
