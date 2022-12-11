import { NextApiRequest, NextApiResponse } from "next";
import * as Replicate from "../../../lib/replicate";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { modelId } = req.query;
  if (!modelId || Array.isArray(modelId)) {
    res.status(404).end();
    return;
  }
  const result = await Replicate.checkModelStatus(modelId);
  res.json(result);
}
