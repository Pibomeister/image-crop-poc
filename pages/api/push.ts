import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";
import { putFileAndGetSignedUrl } from "../../lib/s3";
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

  const result = await putFileAndGetSignedUrl(zipBuffer, `${v4()}.zip`);

  res.json(result);
}
