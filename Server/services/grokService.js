import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const evaluateAnswer = async (question, answer, maxMarks, checkingMode) => {
  let evaluationStyle = "";

  if (checkingMode === "easy") {
    evaluationStyle = `Be lenient. Give marks for effort. Allow partial correctness.`;
  } else if (checkingMode === "medium") {
    evaluationStyle = `Evaluate fairly using standard university evaluation.`;
  } else if (checkingMode === "strict") {
    evaluationStyle = `Be strict. Require precise technical concepts. Deduct marks for incomplete answers.`;
  }

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert university evaluator.\n\nAlways return ONLY valid JSON.\n\nDo not return markdown.\nDo not return explanation text.`,
          },
          {
            role: "user",
            content: `${evaluationStyle}\n\nQuestion:\n${question}\n\nStudent Answer:\n${answer}\n\nMaximum Marks:\n${maxMarks}\n\nReturn JSON exactly:\n\n{\n  "marksAwarded": number,\n  "feedback": "text"\n}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY?.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content;

    // CLEAN RESPONSE
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedResponse = JSON.parse(content);
    return parsedResponse;
  } catch (error) {
    console.log("Groq API Error:", error.response?.data || error.message);
    return {
      marksAwarded: 0,
      feedback: "AI evaluation failed",
    };
  }
};