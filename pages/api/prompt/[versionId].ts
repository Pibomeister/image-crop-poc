import { NextApiRequest, NextApiResponse } from "next";
import * as Replicate from "../../../lib/replicate";

interface PromptRequest extends NextApiRequest {
  body: {
    prompt: string;
  };
}

export default async function handler(
  req: PromptRequest,
  res: NextApiResponse
) {
  const { versionId } = req.query;
  const { prompt } = req.body;
  if (!versionId || Array.isArray(versionId)) {
    res.status(404).end();
    return;
  }
  const result = await Replicate.prompt(prompt, versionId);
  res.json(result);
}
