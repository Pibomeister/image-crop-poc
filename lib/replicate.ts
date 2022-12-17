import { processStatus } from "./http";
import FormData from "form-data";
import { downloadAndZipImages, downloadImages } from "./zipImages";

const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;
const BASE_URL = "https://dreambooth-api-experimental.replicate.com/v1";
const PROMPT_BASE_URL = "https://api.replicate.com/v1";
const TRAIN_WEBHOOK_URL = "https://eoz6l6vkrb2zjrw.m.pipedream.net";
const REPLICATE_USER = "pibomeister";

export interface ModelConfig {
  individualName: string;
  maxTrainSteps: number;
}

export interface TrainingResponse {
  created_at: Date;
  error: any;
  id: string;
  input: {
    class_prompt: string;
    instance_data: string;
    instance_prompt: string;
    max_train_steps: number;
  };
  logs?: string;
  model: string;
  status: string;
  webhook_completed: string;
  version: string | null;
}

/**
 *
 * @returns - serving and upload urls to upload files to Replicate GCP's bucket
 */
export const getUploadUrls = async () => {
  const response = await fetch(`${BASE_URL}/upload/data.zip`, {
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
    },
    method: "POST",
  }).then(processStatus);
  const body = (await response.json()) as Map<string, any>;
  const uploadUrl = body["upload_url"];
  const servingUrl = body["serving_url"];
  return { uploadUrl, servingUrl };
};

/**
 *
 * @param buffer - the zip file bugger
 * @returns - the response from the upload operation on replicate
 */
export const uploadZip = async (buffer: Buffer) => {
  try {
    const urls = await getUploadUrls();
    if (!urls) {
      return;
    }
    const { uploadUrl, servingUrl } = urls;
    const fileSize = buffer.byteLength;
    const form = new FormData();
    form.append("file", buffer, {
      knownLength: fileSize,
      filename: "data.zip",
    });
    const res = await fetch(uploadUrl, {
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        "Content-Length": fileSize.toString(),
        "Content-Type": " application/zip",
      },
      method: "POST",
      body: buffer,
    })
      .then(async (r) => {
        console.log(await r.text());
        return r;
      })
      .then(processStatus);

    const response = res.json();
    return {
      response,
      servingUrl,
    };
  } catch (error) {
    return undefined;
  }
};

/**
 *
 * @param config - the model training config
 * @param trainDataUrl - the url pointing to the training images zip file
 * @returns - the training model response
 */
export const trainModel = async (config: ModelConfig, trainDataUrl: string) => {
  try {
    const { individualName, maxTrainSteps } = config;
    const res = await fetch(`${BASE_URL}/trainings`, {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          instance_prompt: `${individualName} person`,
          class_prompt: `person`,
          instance_data: trainDataUrl,
          max_train_steps: maxTrainSteps,
          train_text_encoder: true,
          with_prior_preservation: true,
        },
        model: `${REPLICATE_USER}/${individualName}`,
        webhook_completed: TRAIN_WEBHOOK_URL,
      }),
    }).then(processStatus);
    return res.json();
  } catch (err) {
    return;
  }
};

export const checkModelStatus = async (modelId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/trainings/${modelId}`, {
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
      },
    }).then(processStatus);
    return res.json();
  } catch (err) {
    return;
  }
};

export const prompt = async (
  prompt: string,
  negativePrompt: string,
  modelVersion: string
) => {
  try {
    const res = await fetch(`${PROMPT_BASE_URL}/predictions`, {
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
      },
      method: "POST",
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 4,
          num_inference_steps: 60,
          guidance_scale: 8,
          negative_prompt: negativePrompt,
        },
        version: modelVersion,
        webhook_completed: TRAIN_WEBHOOK_URL,
      }),
    }).then(processStatus);
    return res.json();
  } catch (err) {
    return;
  }
};

export const downloadPromptImages = async (urls: string[]) => {
  try {
    const imageBuffers = await downloadImages(urls, {
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
      },
    });
    return imageBuffers;
  } catch (err) {
    return;
  }
};
