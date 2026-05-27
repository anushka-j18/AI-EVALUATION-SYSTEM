import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const API_KEY=process.env.GROK_API_KEY;
export const evaluateAnswer =
  async (
    question,
    answer,
    maxMarks,
    checkingMode
  ) => {
     
    let evaluationStyle =
      "";

    if (
      checkingMode ===
      "easy"
    ) {

      evaluationStyle = `
      Be lenient.
      Give marks for effort.
      Allow partial correctness.
      `;

    } else if (
      checkingMode ===
      "medium"
    ) {

      evaluationStyle = `
      Evaluate fairly using standard
      university evaluation.
      `;

    } else if (
      checkingMode ===
      "strict"
    ) {

      evaluationStyle = `
      Be strict.
      Require precise technical concepts.
      Deduct marks for incomplete answers.
      `;
    }

    try {

      const response =
        await axios.post(

          "https://api.groq.com/openai/v1/chat/completions",

          {

            model:
              "llama-3.3-70b-versatile",

            temperature: 0.2,

            response_format: {
              type:
                "json_object",
            },

            messages: [

              {
                role: "system",

                content: `
You are an expert university evaluator.

Always return ONLY valid JSON.

Do not return markdown.
Do not return explanation text.
`,
              },

              {
                role: "user",

                content: `
${evaluationStyle}

Question:
${question}

Student Answer:
${answer}

Maximum Marks:
${maxMarks}

Return JSON exactly:

{
  "marksAwarded": number,
  "feedback": "text"
}
`,
              },
            ],
          },

          {
            headers: {

              Authorization:
                `Bearer ${API_KEY}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      let content =
        response.data
        .choices[0]
        .message
        .content;

      // CLEAN RESPONSE

      content = content
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

      const parsedResponse =
        JSON.parse(content);

      return parsedResponse;

    } catch (error) {

      console.log(
        "Groq API Error:",
        error.response?.data ||
        error.message
      );

      return {

        marksAwarded: 0,

        feedback:
          "AI evaluation failed",
      };
    }
  };