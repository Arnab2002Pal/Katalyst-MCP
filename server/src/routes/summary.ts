import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Gemini API Key from Google AI Studio
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post("/", async (req, res) => {
    try {
        const { title, time, duration, attendees, description } = req.body;

        if (!title || !time) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Prepare meeting details for Gemini prompt
        const meetingText = `
      Title: ${title}
      Time: ${time}
      Duration: ${duration || "Not specified"}
      Attendees: ${attendees ? attendees.join(", ") : "Not specified"}
      Description: ${description || "No description provided"}
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
      Summarize the following meeting in 2-3 sentences, highlighting the main points and decisions made:
      ${meetingText}
    `;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

export default router;
