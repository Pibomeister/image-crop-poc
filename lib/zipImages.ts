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
  const extension = url.split(".").slice(1).pop() || "";
  return [Buffer.from(arrayBuffer), extension];
}

export async function downloadImages(
  urls: string[],
  config?: RequestInit
): Promise<Array<[Buffer, string]>> {
  const promises = urls.map((url) => downloadImage(url, config));
  const buffers = await Promise.all(promises);
  return buffers;
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
  const imageBuffers = await downloadImages(urls, config);
  const zipBuffer = await zipBuffers(imageBuffers);
  return zipBuffer;
}
