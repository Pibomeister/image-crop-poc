import { NextApiRequest, NextApiResponse } from "next";

import { downloadImages } from "../../lib/zipImages";
import { uploadImages } from "../../lib/imageKit";

interface DownloadRequest extends NextApiRequest {
  body: {
    urls: string[];
    identifier?: string;
  };
}

const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

export default async function handler(
  req: DownloadRequest,
  res: NextApiResponse
) {
  const { body } = req;
  console.table(body.urls);
  const images = await downloadImages(body.urls, {
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
    },
  });
  const results = await uploadImages(images, body.identifier);
  res.json(results);
}
