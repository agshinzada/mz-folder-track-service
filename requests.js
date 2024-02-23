import fs from "fs-extra";
import path from "path";

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
        token:
          "jFfV49WAVJq80FseLmD2QLk1hVHxUWBP3KMOVjm7ZiJPT3DQXXgFiIecDxOXlXmS",
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

export async function checkFileExist(invoice, type) {
  try {
    const response = await fetch(
      `http://localhost:5180/api/upload?i=${invoice}&t=${type}&token=jFfV49WAVJq80FseLmD2QLk1hVHxUWBP3KMOVjm7ZiJPT3DQXXgFiIecDxOXlXmS`
    );

    return response.json();
  } catch (error) {
    console.error(
      `Error occurred while sending file copy for ${filePath} to the API:`,
      error
    );
  }
}
