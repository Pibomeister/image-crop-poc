// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as fs from "fs";
import ImageKit from "imagekit";
import { v4 } from "uuid";

export type UploadFileResponse = {
  folderId: string;
  fileUrl: string;
  fileType: string;
};

export type UploadImagesResponse = {
  uploads: UploadFileResponse[];
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const IMAGE_KIT_ENDPOINT = "https://ik.imagekit.io/mifotodeperfil/";
const IMAGE_KIT_TRANSFORMATION = "tr:h-512,w-512,fo-face,f-png";

const imagekit = new ImageKit({
  publicKey: "public_14WDrQ2tD3whpxapU42w9ejjXxA=",
  privateKey: process.env.IMAGE_KIT_SECRET!,
  urlEndpoint: IMAGE_KIT_ENDPOINT,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadImagesResponse>
) {
  const form = new formidable.IncomingForm({
    uploadDir: "./",
    keepExtensions: true,
  });
  const files: formidable.File[] = [];
  form.on("file", function (field, file) {
    console.log(field, file);
    files.push(file);
  });
  form.parse(
    req,
    async (err: any, _: formidable.Fields, __: formidable.Files) => {
      const promises: Promise<UploadFileResponse>[] = [];
      const uniqueId = v4();
      for (const file of files) {
        console.log(file.filepath);
        promises.push(
          new Promise((resolve, reject) => {
            fs.readFile(file.filepath, (err, data) => {
              if (err) reject(err);
              imagekit.upload(
                {
                  folder: "/images/" + uniqueId,
                  file: data, //required
                  fileName: file.newFilename, //required
                },
                function (error, result) {
                  if (error) reject(err);
                  else {
                    console.log(result);
                    if (!result)
                      reject(new Error("Empty response from Imgkit"));
                    resolve({
                      fileType: result?.fileType!,
                      fileUrl: `${IMAGE_KIT_ENDPOINT}${IMAGE_KIT_TRANSFORMATION}${result?.filePath}`,
                      folderId: uniqueId,
                    });
                  }
                }
              );
            });
          })
        );
      }
      const uploads = await Promise.allSettled(promises);
      const result = uploads
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as any).value);
      files.forEach((f) => fs.unlink(f.filepath, () => {}));
      res.status(200).send({ uploads: result });
    }
  );
}
