import { NextApiRequest, NextApiResponse } from "next";

const UPLOAD_URL =
  "https://us-central1-mifotodeperfil-staging.cloudfunctions.net/uploadTrainingImages";

import { downloadAndZipImages } from "../../lib/zipImages";

interface DownloadRequest extends NextApiRequest {
  body: {
    urls: string[];
  };
}

export default async function handler(
  req: DownloadRequest,
  res: NextApiResponse
) {
  const { body } = req;
  console.table(body.urls);
  const zipBuffer = await downloadAndZipImages(body.urls);
  const result = await fetch(UPLOAD_URL, {
    method: "POST",
    body: zipBuffer,
    headers: {
      "Content-Type": "application/zip",
    },
  });
  console.log(result);
  //   res.end(zipBuffer);
  res.json(result);
}
