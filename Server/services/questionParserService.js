import axios from "axios";

export const parseQuestions = async (
  extractedText
) => {

  try {

    const response =
      await axios.post(

        "https://api.groq.com/openai/v1/chat/completions",

        {
          model:
            "llama-3.3-70b-versatile",

          temperature: 0.2,

          messages: [

            {
              role: "system",

              content: `
You are an expert exam paper parser.

Extract structured questions from the given text.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No extra text
`,
            },

            {
              role: "user",

              content: `
Convert this exam paper into structured JSON.

RULES:
- Detect SECTION A / B / C
- Extract sub-questions
- If same question number repeats,
  convert into:
  1.a
  1.b
  1.c

OUTPUT FORMAT:

{
  "questions": [
    {
      "qNo": "1",
      "question": "string",
      "maxMarks": 2
    }
  ]
}

TEXT:
${extractedText}
`,
            },
          ],
        },

        {
          headers: {

            Authorization:
              `Bearer ${process.env.GROK_API_KEY}`,

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

    // CLEAN MARKDOWN

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log(
      "RAW AI RESPONSE = ",
      content
    );

    const parsed =
      JSON.parse(content);

    // IMPORTANT FIX

    const questions =
      parsed.questions || [];

    // NORMALIZE DUPLICATES

    return normalizeQuestionNumbers(
      questions
    );

  } catch (error) {

    console.log(
      "GROQ PARSER ERROR:",
      error.response?.data ||
      error.message
    );

    return [];
  }
};


// ============================
// NORMALIZE DUPLICATE QNOS
// ============================

const normalizeQuestionNumbers =
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