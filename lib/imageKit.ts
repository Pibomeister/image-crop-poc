import ImageKit from "imagekit";
import { v4 } from "uuid";

const IMAGE_KIT_ENDPOINT = "https://ik.imagekit.io/mifotodeperfil";
const imagekit = new ImageKit({
  publicKey: "public_14WDrQ2tD3whpxapU42w9ejjXxA=",
  privateKey: process.env.IMAGE_KIT_SECRET!,
  urlEndpoint: IMAGE_KIT_ENDPOINT,
});

interface ImageKitUploadResponse {
  fileType: string;
  fileUrl: string;
  folderId: string;
}

export const uploadImage = (
  image: [Buffer, string],
  uniqueId: string
): Promise<ImageKitUploadResponse> => {
  const [buffer, filename] = image;
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        folder: "/images/" + uniqueId,
        file: buffer, //required
        fileName: filename, //required
      },
      function (error, result) {
        if (error) reject(error);
        else {
          console.log(result);
          if (!result) reject(new Error("Empty response from Imgkit"));
          resolve({
            fileType: result?.fileType!,
            fileUrl: `${IMAGE_KIT_ENDPOINT}${result?.filePath}`,
            folderId: uniqueId,
          });
        }
      }
    );
  });
};

export const uploadImages = async (
  images: [Buffer, string][],
  uniqueId?: string
): Promise<ImageKitUploadResponse[]> => {
  const id = uniqueId ?? v4();
  const promises = images.map((image) => uploadImage(image, id));
  const results = await Promise.allSettled(promises);
  const settled = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as any).value);
  return settled;
};
