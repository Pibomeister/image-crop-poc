import { NextApiRequest, NextApiResponse } from "next";
import * as Replicate from "../../../lib/replicate";

interface PromptRequest extends NextApiRequest {
  body: {
    prompt: string;
    negativePrompt: string;
  };
}

const BASE_NEGATIVE_PROMPT =
  "Ugly, duplicate, Blurry, Poorly drawn face, Deformed, Cloned face, Gross proportions, Bad anatomy, unrealistic, weird eyes, uncanny eyes, weird eyes";

export default async function handler(
  req: PromptRequest,
  res: NextApiResponse
) {
  const { versionId } = req.query;
  const { prompt, negativePrompt } = req.body;
  if (!versionId || Array.isArray(versionId)) {
    res.status(404).end();
    return;
  }
  const result = await Replicate.prompt(
    prompt,
    negativePrompt ?? BASE_NEGATIVE_PROMPT,
    versionId
  );
  res.json(result);
}
