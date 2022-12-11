import { NextApiRequest, NextApiResponse } from "next";
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
  res.end(zipBuffer);
}
