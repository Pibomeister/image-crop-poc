import Head from "next/head";
import ImageUploading, {
  ImageListType,
  ImageType,
} from "react-images-uploading";
import styles from "../styles/Home.module.css";
import { useCallback, useState } from "react";
import ImageCropper from "../components/Cropper";
import Results from "../components/Results";
import LoadingSpinner from "../components/LoadingSpinner";
import { Area } from "react-easy-crop";
import getCroppedImg from "../lib/cropImage";
import { UploadFileResponse } from "./api/upload";

function dataURItoBlob(dataURI: string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURI.split(",")[1]);
  else byteString = unescape(dataURI.split(",")[1]);

  // separate out the mime component
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
export default function Home() {
  const [images, setImages] = useState<ImageListType>([]);
  const maxNumber = 69;

  const [selectedImage, setSelectedImage] = useState<ImageType>();
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [results, setResults] = useState<UploadFileResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const onChange = (
    imageList: ImageListType,
    addUpdateIndex?: number[] | undefined
  ) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [setCroppedAreaPixels]
  );

  const resetCropper = useCallback(() => {
    setCroppedAreaPixels(undefined);
    setSelectedImage(undefined);
  }, [setCroppedAreaPixels]);

  const showCroppedImage = useCallback(async () => {
    try {
      if (!selectedImage) {
        return;
      }
      const croppedImage = await getCroppedImg(
        selectedImage["data_url"],
        croppedAreaPixels
      );
      console.log("pitoooo", croppedImage);
      const updated = [
        ...images.map((element) => {
          if (element["data_url"] == selectedImage["data_url"]) {
            return {
              ["data_url"]: croppedImage,
            } as ImageType;
          }
          return element;
        }),
      ];
      setImages(updated);
      resetCropper();
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels]);

  const onUploadImages = useCallback(async () => {
    const formData = new FormData();
    for (let image of images) {
      const file = image.file ?? dataURItoBlob(image["data_url"]);
      formData.append("files", file);
    }
    setLoading(true);
    fetch("http://localhost:3000/api/upload", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      method: "POST",
      body: formData,
    })
      .then((res) =>
        res.json().then((result) => {
          setResults(result.uploads);
          setLoading(false);
        })
      )
      .then((data) => {
        console.log("data", data);
      })
      .catch((err) => {
        setLoading(false);
        alert(err);
        console.log("err", err);
      });
  }, [images]);

  const onRestart = () => {
    setResults([]);
    setImages([]);
    resetCropper();
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Fotits</title>
        <meta name="description" content="fotits" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>A ver perro suba sus fotitos</h1>
        {results.length == 0 && (
          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            maxNumber={maxNumber}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemoveAll,
              onImageUpdate,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              // write your building UI
              <div className={styles.images}>
                <button
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  Click or Drop here
                </button>
                &nbsp;
                <button onClick={onImageRemoveAll}>Remove all images</button>
                {imageList.map((image, index) => (
                  <div key={index} className="image-item">
                    <div className="image-item__btn-wrapper">
                      <img src={image["data_url"]} alt="" width="100" />
                      <button onClick={() => setSelectedImage(image)}>
                        Crop
                      </button>
                      <button onClick={() => onImageUpdate(index)}>
                        Update
                      </button>
                      <button onClick={() => onImageRemove(index)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {!!imageList.length && (
                  <div>
                    <button onClick={() => onUploadImages()}>Upload</button>
                  </div>
                )}
                {selectedImage && (
                  <div className={styles.cropper}>
                    <ImageCropper
                      image={selectedImage["data_url"]}
                      onCropComplete={onCropComplete}
                    />
                    <button
                      className={styles.cropBtn}
                      onClick={() => showCroppedImage()}
                    >
                      Crop!
                    </button>
                    <button
                      className={styles.closeBtn}
                      onClick={() => resetCropper()}
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        )}
        {results.length > 0 && (
          <>
            <Results results={results} />
            <br />
            <button className={styles.niceBtn} onClick={() => onRestart()}>
              Start Again
            </button>
          </>
        )}
      </main>
      {loading && <LoadingSpinner />}
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by SUPUTAMADRE
        </a>
      </footer>
    </div>
  );
}
