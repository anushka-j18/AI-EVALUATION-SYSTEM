import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Tesseract from "tesseract.js";

export const extractTextFromFile = async (filePath) => {
  try {
    const ext = filePath.split(".").pop().toLowerCase();

    // PDF
    if (ext === "pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text;
    }

    // IMAGE OCR
    if (["png", "jpg", "jpeg"].includes(ext)) {
      const result = await Tesseract.recognize(filePath, "eng");
      return result.data.text;
    }

    return "";
  } catch (error) {
    console.log("OCR ERROR:", error);
    return "";
  }
};