import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const parseQuestions = async (extractedText) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `You are an expert exam paper parser.\n\nExtract structured questions from the given text.\n\nSTRICT RULES:\n- Return ONLY valid JSON\n- No markdown\n- No explanation\n- No extra text`,
          },
          {
            role: "user",
            content: `Convert this exam paper into structured JSON.\n\nRULES:\n- Detect SECTION A / B / C\n- Extract sub-questions\n- If same question number repeats,\n  convert into:\n  1.a\n  1.b\n  1.c\n\nOUTPUT FORMAT:\n\n{\n  "questions": [\n    {\n      "qNo": "1",\n      "question": "string",\n      "maxMarks": 2\n    }\n  ]\n}\n\nTEXT:\n${extractedText}`,
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

    // CLEAN MARKDOWN
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("RAW AI RESPONSE = ", content);

    const parsed = JSON.parse(content);
    const questions = parsed.questions || [];

    return normalizeQuestionNumbers(questions);
  } catch (error) {
    console.log("GROQ PARSER ERROR:", error.response?.data || error.message);
    return [];
  }
};
  (questions) => {

    const countMap = {};

    return questions.map((q) => {

      const key =
        String(q.qNo);

      if (!countMap[key]) {

        countMap[key] = 0;
      }

      countMap[key]++;

      // FIRST OCCURRENCE

      if (
        countMap[key] === 1
      ) {

        return {

          ...q,

          qNo: key,
        };
      }

      // SECOND => a
      // THIRD => b

      const suffix =
        String.fromCharCode(
          96 +
          countMap[key] -
          1
        );

      return {

        ...q,

        qNo:
          `${key}.${suffix}`,
      };
    });
  };