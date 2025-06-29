import axios from "axios";

const initialPrompt = `
You are Sahaayak – a calm, helpful Disaster Assistance Bot for India.
Provide short and clear guidance on:
- Natural disaster safety in India (flood, earthquake, fire, cyclone)
- Indian emergency contact numbers (e.g., 112 for all emergencies, 101 for fire, 100 for police, 108 for ambulance)
- Shelters, relief centers, or medical help as per Indian disaster management guidelines
- Mention organizations like NDMA, NDRF, and State Disaster Management Authorities
Do not mention any foreign emergency numbers or organizations.
Never give legal or medical advice. Always guide users to real-life help available in India.
`;

export const handleChat = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192", // or "mixtral-8x7b" or any available model
        messages: [
          { role: "system", content: initialPrompt },
          ...messages
        ],
        temperature: 0.3
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    const reply = response.data.choices[0]?.message?.content || "⚠️ No response from model.";
    res.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error.message);
    res.status(500).json({ error: "Model unavailable. Please try again later." });
  }
};

export const getEmergencyContacts = (_req, res) => {
  res.json({
    "National Emergency Number": "112",
    "Fire Department": "101",
    "Ambulance": "102",
    "Disaster Response": "108",
    "Police": "100"
  });
};

export const getDisasterAlerts = async (_req, res) => {
  try {
    const { data } = await axios.get("https://api.reliefweb.int/v1/disasters?appname=sahaayak&limit=3");
    const alerts = data.data.map((d) => d.fields.name);
    res.json(alerts);
  } catch (err) {
    console.error("Alert API error:", err.message);
    res.status(500).json(["⚠️ Cannot fetch alerts right now."]);
  }
};
