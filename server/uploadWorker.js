import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { writeFileSync } from "fs";
import { join } from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UploadFile = (workerData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

if (!isMainThread) {
  const filePath = join(__dirname, "files", workerData.filename);
  const fileContent = workerData.content;
  writeFileSync(filePath, fileContent);

  parentPort.postMessage(filePath);
}

export { UploadFile };
