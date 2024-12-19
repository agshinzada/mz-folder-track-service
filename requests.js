import fs from "fs-extra";
import path from "path";
import "dotenv/config";

export async function sendFileCopy(
  filePath,
  fileName,
  invoice,
  type,
  read_status
) {
  try {
    // Read the file content
    const fileContent = await fs.readFile(filePath);

    // Send the file content to the API
    const response = await fetch(`${process.env.API_URL}/files/upload`, {
      method: "POST",
      body: fileContent,
      headers: {
        "Content-Type": "application/octet-stream",
        invoicecode: invoice,
        filename: fileName,
        invoicetype: type,
        readstatus: read_status,
        token: process.env.TOKEN,
      },
    });

    // Check if the request was successful
    if (response.ok) {
      console.log(`File copy for ${filePath} sent successfully to the API`);
      return true;
    } else {
      console.error(
        `Failed to send file copy for ${filePath} to the API. Status code: ${response.status}`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error occurred while sending file copy for ${filePath} to the API:`,
      error
    );
    return false;
  }
}

export async function sendTrackingLogToServer(data) {
  try {
    // Send the file content to the API
    const response = await fetch(
      `${process.env.API_URL}/logs?token=${process.env.TOKEN}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Check if the request was successful
    if (response.ok) {
      console.log(`File log for ${data.filePath} sent successfully to the API`);
    } else {
      console.error(
        `Failed to send log for ${data.filePath} to the API. Status code: ${response.status}`
      );
    }
  } catch (error) {
    console.error(
      `Error occurred while sending file log for ${filePath} to the API:`,
      error
    );
  }
}

// export async function sendErrorProcess(filePath, fileName) {
//   try {
//     const response = await fetch(`${process.env.API_URL}/upload/error`, {
//       method: "POST",
//       body: JSON.stringify({
//         filePath,
//         fileName,
//         token: process.env.TOKEN,
//       }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error) {}
// }

// export async function checkFileExist(invoice, type) {
//   try {
//     const response = await fetch(
//       `${process.env.API_URL}/upload?i=${invoice}&t=${type}&token=${process.env.TOKEN}`
//     );

//     return response.json();
//   } catch (error) {
//     console.error(
//       `Error occurred while sending file copy for ${filePath} to the API:`,
//       error
//     );
//   }
// }
