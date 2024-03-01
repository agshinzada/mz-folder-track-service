import fs from "fs-extra";
import path from "path";
import "dotenv/config";

export async function sendFileCopy(filePath, fileName, invoice, type) {
  try {
    // Read the file content
    const fileContent = await fs.readFile(filePath);

    // Send the file content to the API
    const response = await fetch("http://localhost:5180/api/upload", {
      method: "POST",
      body: fileContent,
      headers: {
        "Content-Type": "application/octet-stream",
        invoicecode: invoice,
        filename: fileName,
        invoicetype: type,
        token: process.env.TOKEN,
      },
    });

    // Check if the request was successful
    if (response.ok) {
      console.log(`File copy for ${filePath} sent successfully to the API`);
    } else {
      console.error(
        `Failed to send file copy for ${filePath} to the API. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error(
      `Error occurred while sending file copy for ${filePath} to the API:`,
      error
    );
  }
}

export async function sendErrorProcess(filePath, fileName) {
  try {
    const response = await fetch("http://localhost:5180/api/upload/error", {
      method: "POST",
      body: JSON.stringify({
        filePath,
        fileName,
        token: process.env.TOKEN,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {}
}

export async function checkFileExist(invoice, type) {
  try {
    const response = await fetch(
      `http://localhost:5180/api/upload?i=${invoice}&t=${type}&token=${process.env.TOKEN}`
    );

    return response.json();
  } catch (error) {
    console.error(
      `Error occurred while sending file copy for ${filePath} to the API:`,
      error
    );
  }
}
