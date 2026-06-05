import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export const parseQuestionPaperWithGemini = async (filePath, mimeType) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    // Determine mimeType if not provided
    if (!mimeType) {
      const ext = filePath.split(".").pop().toLowerCase();
      if (ext === "pdf") mimeType = "application/pdf";
      else if (ext === "png") mimeType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      else mimeType = "application/octet-stream";
    }

    console.log(`Uploading ${filePath} to Gemini File API...`);
    const uploadResult = await ai.files.upload({ file: filePath, mimeType });
    
    const prompt = `
You are an expert exam paper parser.
Extract structured questions from this document with incredibly high accuracy.
Pay special attention to extracting complex tables, diagrams, and multi-part questions perfectly.

STRICT RULES:
- Return ONLY valid JSON.
- No markdown formatting (like \`\`\`json). No explanations.
- Extract the Section Name if present (e.g., "Section A"). If not present, use an empty string "".
- Extract Question Number / Sub-Question Number perfectly (e.g., "1.a", "2(i)").
- Extract the Full Question Text accurately.
- Extract Maximum Marks assigned to each question. If missing, use 0.
- IDENTIFY OPTIONAL RULES: If a section has an instruction like "Attempt any 3 out of 5", set "requiredAttempts" to 3 for EVERY question in that section. If there are no optional rules, set "requiredAttempts" to null.

OUTPUT FORMAT MUST BE EXACTLY:
{
  "questions": [
    {
      "section": "Section A",
      "qNo": "1.a",
      "question": "What is the capital of France?",
      "maxMarks": 2,
      "requiredAttempts": 3
    }
  ]
}
`;

    console.log("Processing with Gemini 2.5 Flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
        { text: prompt }
      ]
    });
    
    // Cleanup the uploaded file to save space in Google AI Studio
    try {
      await ai.files.delete({ name: uploadResult.name });
    } catch(err) {
      console.log("Cleanup warning:", err.message);
    }

    let content = response.text;
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("RAW GEMINI RESPONSE:", content);
    
    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (error) {
    console.log("GEMINI PARSE ERROR:", error);
    throw error;
  }
};
