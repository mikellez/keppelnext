import React, { CSSProperties, useState, useEffect } from "react";
import { BsCameraFill } from "react-icons/bs";

const greyFill = "rgba(0,0,0,0.05)";

const previewContainer: CSSProperties = {
  /*marginTop: "1em",*/
  marginBottom: "1em",
  padding: "1em",
  border: "6px solid " + greyFill,
  borderRadius: "8px",
  display: "flex",
  height: "100%",
  flex: "1 1 auto",
  justifyContent: "center",
};

const centerTransform: CSSProperties = {
  position: "relative",
  /*left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",*/
};

const previewContent: CSSProperties = {
  ...centerTransform,
  textAlign: "center",

  height: "100%",
  width: "100%",

  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

interface ImagePreviewProps {
  previewObjURL: string;
}

export default function ImagePreview(props: ImagePreviewProps) {
  const previewContentFinal = props.previewObjURL
    ? {
        ...previewContent,
        backgroundImage: `url(data:image/png;base64, ${props.previewObjURL})`,
      }
    : previewContent;

    const [isPortrait, setIsPortrait] = useState(false);
    console.log(isPortrait)

  useEffect(() => {
    const img = new Image();
    img.src = props.previewObjURL;
    img.onload = () => {
      const { width, height } = img;
      setIsPortrait(height > width);
    };
  }, [props.previewObjURL]);

  return (
    <div style={previewContainer}>
      {/* <div style={previewContentFinal}> */}
        {props.previewObjURL ? <img width={isPortrait ? "50%" : "100%"} height={isPortrait ? "50%" : "100%"} src={props.previewObjURL} alt="" /> :(
          <div style={previewContent}>
            <BsCameraFill size={104} fill={greyFill} />
            <div style={{ color: "rgba(0,0,0,0.1)" }}>No Image</div>
          </div>
        )}
        
      {/* </div> */}
    </div>
  );
}
