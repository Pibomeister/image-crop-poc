import { NextApiRequest, NextApiResponse } from "next";
import * as Replicate from "../../lib/replicate";

interface TrainApiRequest extends NextApiRequest {
  body: {
    trainFileUrl: string;
    config: Replicate.ModelConfig;
  };
}

export default async function handler(
  req: TrainApiRequest,
  res: NextApiResponse
) {
  const { body } = req;
  const result = await Replicate.trainModel(body.config, body.trainFileUrl);
  if (result) {
    res.json(result);
    return;
  }
  res.end();
}
