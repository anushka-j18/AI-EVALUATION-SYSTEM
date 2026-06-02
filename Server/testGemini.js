import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  fs.writeFileSync("test.txt", "Hello World. Summarize this.");
  const uploadResult = await ai.files.upload({ file: "test.txt" });
  console.log("Upload result:", uploadResult.name);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
        { text: "What does this file say?" }
      ]
    });
    console.log("Response 2.5-flash:", response.text);
  } catch(e) {
    console.log("Error 2.5-flash:", e.message);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [
        { fileData: { fileUri: uploadResult.uri, mimeType: uploadResult.mimeType } },
        { text: "What does this file say?" }
      ]
    });
    console.log("Response 1.5-pro:", response.text);
  } catch(e) {
    console.log("Error 1.5-pro:", e.message);
  }
}
test();
