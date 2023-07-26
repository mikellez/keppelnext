import React, { useEffect, useState, CSSProperties, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import RequiredIcon from "../RequiredIcon";

import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { CMMSLicenseForm } from "../../types/common/interfaces";
import { ImageStatus } from "./LicenseContainer";
import LoadingHourglass from "../LoadingHourglass";
import LoadingIcon from "../LoadingIcon";

const thumbsContainer: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumbsStyle: CSSProperties = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner: CSSProperties = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
  justifyContent: "center",
  cursor: "pointer",
};

const img: CSSProperties = {
  display: "block",
  width: "auto",
  height: "100%",
};

interface MultipleImagesUploader {
  setLicenseForm: React.Dispatch<React.SetStateAction<CMMSLicenseForm>>;
  files: File[];
  imageStatus: ImageStatus;
  setImageStatus: React.Dispatch<React.SetStateAction<ImageStatus>>;
  disabled?: boolean;
}

const MultipleImagesUpload = (props: MultipleImagesUploader) => {
  const [images, setImages] = useState<string[]>([]);
  const [exceedLimit, setExceedLimit] = useState<boolean>(false);
  const [justInitialize, setJustInitialize] = useState<boolean>(true);

  // useEffect(() => {
  //   if (props.isSubmitting) {
  //     for (const image of images) {
  //       URL.revokeObjectURL(image);
  //     }
  //   }
  // }, [props.isSubmitting]);

  useEffect(() => {
    if (props.imageStatus.received && !props.imageStatus.processed) {
      // console.log("processing view image")
      // console.log(props.files.length)
      setImages(
        props.files.map((file) => {
          return URL.createObjectURL(file);
        })
      );
      props.setImageStatus((prev) => {
        return {
          ...prev,
          processed: true,
        };
      });
      return () => {
        for (const image of images) {
          URL.revokeObjectURL(image);
        }
      };
    }
  }, [props, props.imageStatus.received]);

  const handleImages = (files: File[]) => {
    props.setLicenseForm((prev) => {
      if (prev.images.length + files.length > 5) {
        setExceedLimit(true);
        return {
          ...prev,
        };
      } else {
        // for the image previews
        setImages((prev) => {
          return [...prev, ...files.map((file) => URL.createObjectURL(file))];
        });

        // for the submission form data
        return {
          ...prev,
          images: [...prev.images, ...files],
        };
      }
    });
  };

  const deleteImage = (images: string, num: number) => {
    // console.log(images)
    setImages((prev) => {
      const arr = prev;
      return arr.filter((img, index) => {
        // console.log(index)
        return img !== images;
      });
    });
    props.setLicenseForm((prev) => {
      return {
        ...prev,
        images: [...prev.images].filter((img, index) => index !== num),
      };
    });
    // props.handleDelete(num);
  };

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    // console.log(acceptedFiles.length);
    // console.log(props.files);
    // console.log(props.files.length);
    setJustInitialize(false);
    if (acceptedFiles.length < 1) {
      return;
    }
    // if (acceptedFiles.length + props.files.length > 5) {
    //   setExceedLimit(true);
    //   return;
    // }

    handleImages(acceptedFiles);

    // console.log("Handling drop")
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop: dropHandler,
  });

  const thumbs = images.map((image, index) => (
    <div
      style={thumbsStyle}
      key={index}
      onDoubleClick={() => deleteImage(image, index)}
    >
      <div style={thumbInner}>
        <img src={image} style={img} alt="" />
      </div>
    </div>
  ));

  return (
    <section className="mb-3">
      <label className="mb-3">
        {" "}
        {props.disabled ? "Attached Images" : "Attach Images"}
      </label>
      {props.imageStatus.processed ? (
        <div>
          {!props.disabled && (
            <div
              style={{
                flex: 1,
                display: "flex",
                // flexDirection: 'column',
                alignItems: "center",
                padding: "20px",
                height: "10rem",
                borderWidth: 5,
                borderRadius: 10,
                borderColor: "#eeeeee",
                borderStyle: "dashed",
                backgroundColor: "white",
                color: "#bdbdbd",
                outline: "none",
                transition: "border .24s ease-in-out",
                textAlign: "center",
              }}
              {...getRootProps({ className: "dropzone" })}
            >
              <input {...getInputProps()} accept="image/*" />
              <p>
                Drag and drop some images here, or click to select images.
                Delete images by double clicking on the images
              </p>
            </div>
          )}
          <aside style={thumbsContainer}>{thumbs}</aside>
        </div>
      ) : (
        <LoadingHourglass />
      )}
      <ModuleSimplePopup
        setModalOpenState={setExceedLimit}
        modalOpenState={exceedLimit}
        title="Too many images"
        text="You are allowed to attach up to 5 images"
        icon={SimpleIcon.Cross}
        shouldCloseOnOverlayClick={true}
      />
    </section>
  );
};

export default MultipleImagesUpload;
