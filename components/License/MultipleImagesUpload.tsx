import React, {useEffect, useState, CSSProperties, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import RequiredIcon from '../RequiredIcon';
import { CMMSLicense } from '../../pages/License/Form';
import ModuleSimplePopup, { SimpleIcon } from '../ModuleLayout/ModuleSimplePopup';

const thumbsContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumbsStyle: CSSProperties = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner: CSSProperties = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
  justifyContent: 'center'
};

const img: CSSProperties = {
  display: 'block',
  width: 'auto',
  height: '100%',
  
};

interface MultipleImagesUploader  {
    setLicenseForm: React.Dispatch<React.SetStateAction<CMMSLicense>>;
    isSubmitting: boolean;
    files: File[]
}



const MultipleImagesUpload = (props: MultipleImagesUploader) => {
    
  const [images, setImages] = useState<string[]>([]);
  const [exceedLimit, setExceedLimit] = useState<boolean>(false);

  useEffect(() => {
    if (props.isSubmitting) {
      for (const image of images) {
        URL.revokeObjectURL(image);
      }
    }
  }, [props.isSubmitting]);    

  

  const handleImages = (files: File[]) => {
    props.setLicenseForm(prev => {
      console.log(prev.images.length);
      return {
        ...prev,
        "images": [...prev.images, ...files]
      }
    })
  }
  
  const deleteImage = (images: string, num: number) => {
    console.log(images)
    setImages(prev => {
      const arr = prev;
      return arr.filter((img, index) => {
        // console.log(index)
        return img !== images
      })
    })
    props.setLicenseForm(prev => {
      return {
        ...prev,
        "images": [...prev.images].filter((img, index) => index !== num)
      };
    })
    // props.handleDelete(num);
  }

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    // console.log(acceptedFiles.length);
    // console.log(props);
    // console.log(props.files.length);
    if (acceptedFiles.length < 1) {
        return;
    }
    if (acceptedFiles.length + props.files.length > 5) {
      setExceedLimit(true);
      return;
    }
    handleImages(acceptedFiles);
    setImages(prev => {
      return [...prev, ...acceptedFiles.map(file => URL.createObjectURL(file))]
    })
    console.log("Handling drop")
  }, [])

  const {getRootProps, getInputProps} = useDropzone({
    accept: {
    'image/*': []
    },
    onDrop: dropHandler
  });

  const thumbs = images.map((image, index) => (
    <div style={thumbsStyle} key={index} onDoubleClick={() => deleteImage(image, index)}>
      <div style={thumbInner}>
        <img
          src={image}
          style={img}
          alt=""
        />
      </div>
    </div>
  ));


    return (
      <section className="mb-3">
          <label className="mb-3"> Attach images</label>
          <div style={{
              flex: 1,
              display: 'flex',
              // flexDirection: 'column',
              alignItems: 'center',
              padding: '20px',
              height: "10rem",
              borderWidth: 5,
              borderRadius: 10,
              borderColor: '#eeeeee',
              borderStyle: 'dashed',
              backgroundColor: 'white',
              color: '#bdbdbd',
              outline: 'none',
              transition: 'border .24s ease-in-out',
              textAlign: 'center'
              }} {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} accept="image/*"/>
          <p>Drag and drop some images here, or click to select images. Delete images by double clicking on the images</p>
        </div>
        <aside style={thumbsContainer}>
          {thumbs}
        </aside>
        <ModuleSimplePopup 
            setModalOpenState={setExceedLimit}
            modalOpenState={exceedLimit}
            title="Too many images"
            text="You are allowed to attach up to 5 images"
            icon={SimpleIcon.Cross}
            shouldCloseOnOverlayClick={true}/>
      </section>
    );
}

export default MultipleImagesUpload;