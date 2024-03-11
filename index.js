import { createWorker } from "tesseract.js";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";

import { sendFileCopy } from "./requests.js";

// GUNLUK FOLDER ADI YARADIR
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedDate = `${year}-${month}-${day}`;

// LOG PATTERN
const pattern = /\b\d{2}-\d{5}-\d{7}\b/;
const patternType = /^[A-Za-z]/;

const folderName = formattedDate;
const __dirname = process.cwd();
const folderPath = path.join(__dirname, "files");
const uploadFolder = path.join(folderPath, folderName);

const logFilePath = "./log.txt";

// FOLDER YARADIR
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
  appendToLogFile(
    logFilePath,
    `----NEW FOLDER CREATED----${new Date().toLocaleString("az")}
    `
  );
} else {
  appendToLogFile(
    logFilePath,
    `----FOLDER EXIST----${new Date().toLocaleString("az")}
    `
  );
}

let processedFiles = new Set();

// LOG FAYLI OXUYUR VE FAYL ADLARINI YIGIR
if (fs.existsSync(logFilePath)) {
  const logFileContent = fs.readFileSync(logFilePath, "utf8");
  const logLines = logFileContent.split("\n");
  let currentFile = null;
  logLines.forEach((line) => {
    if (line.trim().startsWith("File")) {
      currentFile = line
        .trim()
        .replace(/^File: /, "")
        .replace(/ has been added\.$/, "");
    } else if (line.startsWith("----NEW")) {
      currentFile = null;
    } else if (currentFile) {
      processedFiles.add(currentFile.trim());
    }
  });
}

const watcher = chokidar.watch(uploadFolder, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

try {
  watcher
    .on("add", async (url) => {
      if (!processedFiles.has(url)) {
        console.log(`File ${url} has been added`);
        const worker = await createWorker("eng");
        const ext = path.extname(url);
        if (ext === ".jpg" || ext === ".png") {
          const ret = await worker.recognize(url);
          if (ret.data.text) {
            const { extractedInvoice, extractedType, filename } =
              generateFileParams(ret.data.text, ext);
            if (extractedInvoice && extractedType) {
              // FAYLI SERVERE GONDERIR
              await sendFileCopy(
                url,
                filename,
                extractedInvoice,
                extractedType,
                1
              );
              appendToLogFile(
                logFilePath,
                `----NEW ADDED FILE----${new Date().toLocaleString("az")}
                File: ${url} has been added.
                Extracted string: ${extractedInvoice}
                Type:${extractedType}\n`
              );
              console.log(extractedInvoice);
              console.log(extractedType);
            } else {
              // XETA YARANAN FAYL DATASIN SERVERE GONDERIR
              const tempCode = generateRandomParam();
              const tempFileName = "unread_" + tempCode + ext;
              await sendFileCopy(url, tempFileName, tempCode, 0, 0);
              // LOGLAYIR
              appendToLogFile(
                logFilePath,
                `----NEW ADDED FILE----${new Date().toLocaleString("az")}
                File: ${url} has been added.
                Extracted string: ${extractedInvoice}
                Type:${extractedType}\n`
              );
            }
          }
          await worker.terminate();
        }
      }
    })
    .on("change", async (url) => {})
    .on("unlink", async (url) => {})
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });
} catch (error) {
  console.log("File format not valid!");
}

console.log(`Now watching ${uploadFolder} for changes...`);

function appendToLogFile(logFilePath, logMessage) {
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error(`Error appending to log file: ${err}`);
    }
  });
}

function generateFileParams(data, ext) {
  const matcheInvoice = data.match(pattern);
  const matcheType = data.match(patternType);
  const extractedInvoice = matcheInvoice ? matcheInvoice[0] : null;
  const extractedType = matcheType ? (matcheType[0] === "S" ? 8 : 3) : null;
  const filename = `${extractedInvoice}_${extractedType}_${Math.random()
    .toString(36)
    .substring(2, 6)}${ext}`;

  return {
    extractedInvoice,
    extractedType,
    filename,
  };
}

function generateRandomParam(params) {
  let name = "";
  for (let i = 0; i < 16; i++) {
    name += Math.floor(Math.random() * 10); // 0 ile 9 arasında rastgele rakam üretir.
  }
  return name;
}
