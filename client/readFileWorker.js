import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);

const ReadFile = (workerData) => {
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
  const fileContent = readFileSync(filePath, "utf-8");

  parentPort.postMessage(fileContent);
}

export { ReadFile };
