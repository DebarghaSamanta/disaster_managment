import { useState } from "react";
import axios from "axios";
import { Bot, X, PhoneCall, AlertTriangle } from "lucide-react";
import styles from "./ChatbotWidget.module.css";
import ReactMarkdown from "react-markdown";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi! I'm Sahaayak. Ask me anything about disaster safety in India.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const displayedMessages = [...messages, { role: "user", content: input }];
    setMessages(displayedMessages);
    setInput("");
    setLoading(true);

    const groqCompatibleMessages = displayedMessages.map(({ role, content }) => ({
      role: role === "bot" ? "assistant" : role,
      content,
    }));

    try {
      const res = await axios.post("http://localhost:3000/api/v1/chat/talk", {
        messages: groqCompatibleMessages,
      });
      const botReply = res.data?.reply || "⚠️ No response from model.";
      setMessages((prev) => [...prev, { role: "bot", content: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/chat/contacts");
      const formatted = Object.entries(res.data)
        .map(([k, v]) => `- **${k}**: ${v}`)
        .join("\n");
      setMessages((prev) => [...prev, { role: "bot", content: formatted }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "⚠️ Couldn't fetch contacts." }]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v1/chat/alerts");
      setMessages((prev) => [...prev, { role: "bot", content: res.data.join("\n") }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "⚠️ Couldn't fetch alerts." }]);
    }
  };

  return (
    <div>
      <button className={styles.floatingBtn} onClick={toggleChat}>
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {isOpen && (
        <div className={styles.chatBox}>
          <div className={styles.header}>Sahaayak Assistant</div>

          <div className={styles.quickActions}>
            <button onClick={fetchContacts}>
              <PhoneCall size={14} />
              Emergency
            </button>
            <button onClick={fetchAlerts}>
              <AlertTriangle size={14} />
              Alerts
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${
                  msg.role === "user" ? styles.user : styles.bot
                }`}
              >
                {msg.role === "bot" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
          </div>

          <form
            className={styles.inputArea}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query..."
            />
            <button type="submit" disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
