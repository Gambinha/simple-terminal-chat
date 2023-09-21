import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { readFileSync } from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);

const DownloadFile = (workerData) => {
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
  const filePath = workerData.filePath;
  const buffer = readFileSync(filePath);

  parentPort.postMessage(buffer.toString("utf-8"));
}

export { DownloadFile };
