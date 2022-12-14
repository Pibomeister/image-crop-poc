import {
  GetObjectCommand,
  PutObjectCommand,
  S3,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const putFileAndGetSignedUrl = async (body, name) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: name,
    Body: body,
  };

  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
  });

  // write to the bucket
  await s3Client.send(new PutObjectCommand(params));

  // get the signed url
  const getCommand = new GetObjectCommand(params);
  return await getSignedUrl(s3Client, getCommand, {
    expiresIn: 3600,
  });
};
