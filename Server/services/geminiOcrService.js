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
- IDENTIFY OPTIONAL GROUPS & "OR" CONDITIONS:
  - If a section says "Attempt any N out of M", set "isOptional": true and assign the SAME unique "groupId" (e.g., "group_section_A") to all those M questions. Set "requiredAttempts": N for all of them.
  - If questions are separated by "OR" (e.g., Q1 OR Q2), set "isOptional": true and assign the SAME unique "groupId" (e.g., "group_Q1_OR_Q2") to BOTH questions. Set "requiredAttempts": 1 for both of them.
  - If a question is mandatory and has no optional rules, set "isOptional": false, "groupId": "", and "requiredAttempts": null.

OUTPUT FORMAT MUST BE EXACTLY:
{
  "questions": [
    {
      "section": "Section A",
      "qNo": "1.a",
      "question": "What is the capital of France?",
      "maxMarks": 2,
      "isOptional": true,
      "groupId": "group_section_A",
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
