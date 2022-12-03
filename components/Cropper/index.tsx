import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

export interface ImageCropperProps {
  image?: string | undefined;
  onCropComplete?:
    | ((croppedArea: Area, croppedAreaPixels: Area) => void)
    | undefined;
}

export default function ImageCropper({
  image,
  onCropComplete,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const cropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      console.log(croppedArea, croppedAreaPixels);
      if (onCropComplete) {
        onCropComplete(croppedArea, croppedAreaPixels);
      }
    },
    [onCropComplete]
  );

  return (
    <Cropper
      image={image}
      crop={crop}
      zoom={zoom}
      aspect={1}
      maxZoom={2}
      onCropChange={setCrop}
      onCropComplete={cropComplete}
      onZoomChange={setZoom}
    />
  );
}
