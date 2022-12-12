import { v4 } from "uuid";
import AdmZip from "adm-zip";

import { processStatus } from "./http";

const parseArrayBuffer = (response: Response): Promise<ArrayBuffer> => {
  return response.arrayBuffer();
};

const downloadFile = (
  url: string,
  config?: RequestInit
): Promise<ArrayBuffer> => {
  return fetch(url).then(processStatus).then(parseArrayBuffer);
};

const padNumber = (num: number): string =>
  num.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

async function downloadImage(
  url: string,
  config?: RequestInit
): Promise<[Buffer, string]> {
  const arrayBuffer = await downloadFile(url, config);
  let extension: string;
  if (url.includes(".")) {
    extension = url.split(".").slice(1).pop() || "";
  } else {
    extension = "jpg";
  }
  return [Buffer.from(arrayBuffer), extension ?? "jpg"];
}

export async function downloadImages(
  urls: string[],
  config?: RequestInit
): Promise<Array<[Buffer, string]>> {
  const promises = urls.map((url) => downloadImage(url, config));
  const buffers = await Promise.allSettled(promises);
  const result = buffers
    .filter((buffer) => buffer.status === "fulfilled")
    .map((buffer) => (buffer as any).value);
  return result;
}

export async function zipBuffers(
  buffers: Array<[Buffer, string]>,
  id?: string
): Promise<Buffer> {
  const identifier = id ?? v4();
  const zip = new AdmZip();
  for (let i = 0; i < buffers.length; i++) {
    const [buffer, extension] = buffers[i];
    const filename = `${identifier}_${padNumber(i + 1)}.${extension}`;
    zip.addFile(filename, buffer);
  }
  return zip.toBuffer();
}

export async function downloadAndZipImages(
  urls: string[],
  config?: RequestInit
) {
  console.log(urls);
  const imageBuffers = await downloadImages(urls, config);
  console.log(imageBuffers);
  const zipBuffer = await zipBuffers(imageBuffers);
  return zipBuffer;
}
