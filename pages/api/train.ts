import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";
import * as Replicate from "../../lib/replicate";
import { putFileAndGetSignedUrl } from "../../lib/s3";
import { downloadAndZipImages } from "../../lib/zipImages";

interface TrainApiRequest extends NextApiRequest {
  body: {
    urls: string[];
    config: Replicate.ModelConfig;
  };
}

export default async function handler(
  req: TrainApiRequest,
  res: NextApiResponse
) {
  const { body } = req;
  console.table(body.urls);
  const zipBuffer = await downloadAndZipImages(body.urls);
  const trainFileUrl = await putFileAndGetSignedUrl(zipBuffer, `${v4()}.zip`);
  console.log(trainFileUrl);
  const result = await Replicate.trainModel(body.config, trainFileUrl);
  if (result) {
    res.json(result);
    return;
  }
  res.end();
}
