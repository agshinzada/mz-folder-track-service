import { createWorker } from "tesseract.js";
import fs from "fs-extra";
import path from "path";
import chokidar from "chokidar";
import { checkFileExist, sendFileCopy } from "./requests.js";
const pattern = /\b\d{2}-\d{5}-\d{7}\b/;
const patternType = /^[A-Za-z]/;
const directoryToTrack = "./files";
const logFilePath = "./log.txt";

const watcher = chokidar.watch(directoryToTrack, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

try {
  watcher
    .on("add", async (url) => {
      console.log(`File ${url} has been added`);
      const worker = await createWorker("eng");
      const ext = path.extname(url);
      if (ext === ".jpg" || ext === ".png") {
        const ret = await worker.recognize(url);
        if (ret.data.text) {
          const { extractedInvoice, extractedType, fileName } =
            generateFileParams(ret.data.text, ext);
          if (extractedInvoice && extractedType) {
            await sendFileCopy(url, fileName, extractedInvoice, extractedType);
            appendToLogFile(
              logFilePath,
              `----NEW ADDED FILE----${new Date().toLocaleString("az")}
              File ${url} has been added.
              Extracted string: ${extractedInvoice}
              Type:${extractedType}\n`
            );

            console.log(extractedInvoice);
            console.log(extractedType);
          } else {
            console.log("Fayl duzgun deyil!");
          }
        }
        await worker.terminate();
      }
    })
    .on("change", async (url) => {})
    .on("unlink", async (url) => {})
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });
} catch (error) {
  console.log(error);
}

console.log(`Now watching ${directoryToTrack} for changes...`);

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
  const fileName = `${extractedInvoice}_${extractedType}_${Math.random()
    .toString(36)
    .substring(2, 6)}${ext}`;

  return {
    extractedInvoice,
    extractedType,
    fileName,
  };
}
