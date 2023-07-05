import React, { useContext, useState } from "react";
import { updateSpecificCheck } from "../ChecklistEditableForm";
import CheckControl from "../../../types/common/CheckControl";
import { SectionsContext } from "../../../pages/Checklist/Complete/[id]";
import { ImCross } from "react-icons/im";
import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider, ModuleModal } from "../../";
import Image from "next/image";
import styles from "../../../styles/Checklist.module.scss";
import requestStyles from "../../../styles/Request.module.scss";
import ImagePreview from "../../Request/ImagePreview";

export class FileUploadControl extends CheckControl {
  constructor(question?: string, value?: string, id?: string) {
    super(question, value, id);
  }

  clone() {
    return new FileUploadControl(this.question, this.value, this.id);
  }

  duplicate() {
    return new FileUploadControl(this.question, this.value);
  }

  toString() {
    return `FileUploadControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "FileUpload",
      question: this.question,
      value: this.value,
    };
  }

  render(onChange: Function, onDelete: Function) {
    return (
      <FileUpload
        fileControlObj={this}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  renderEditableForm(rowId: string, sectionId: string, index: number) {
    return (
      <FileUploadEditable
        fileControlObj={this}
        rowId={rowId}
        sectionId={sectionId}
        index={index}
      />
    );
  }
  // renderReassignedEditableForm(rowId: string, sectionId: string) {
  // 	return <FileUploadReassignedEditable fileControlObj={this} rowId={rowId} sectionId={sectionId} />
  // }

  renderViewOnlyForm() {
    return <FileUploadView fileControlObj={this} />;
  }
}

export function FileUpload({
  fileControlObj,
  onChange,
  onDelete,
}: {
  fileControlObj: FileUploadControl;
  onChange: Function;
  onDelete: Function;
}) {
  const deleteSelf = () => {
    onDelete(fileControlObj);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = fileControlObj.clone();
    o.question = e.target.value;
    onChange(o);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    //TODO
    console.log("yeah");
  };

  return (
    <div className={checklistStyles.controlContainer}>
      <button
        type="button"
        className="btn"
        onClick={deleteSelf}
        style={{ float: "right" }}
      >
        <ImCross size={16} />
      </button>
      <div>File Upload</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={fileControlObj.question}
          placeholder="Enter Question"
        />
      </div>

      <div className="form-group">
        <input
          type="file"
          onChange={handleFile}
          className="form-control"
          disabled
        />
      </div>
    </div>
  );
}

function FileUploadEditable({
  fileControlObj,
  rowId,
  sectionId,
  index,
}: {
  fileControlObj: FileUploadControl;
  rowId: string;
  sectionId: string;
  index: number;
}) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { setSections } = useContext(SectionsContext);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFileToValue(e.target.files[0]);
    } else {
      removeFileFromValue();
    }
  };

  const addFileToValue = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      updateSpecificCheck(
        sectionId,
        rowId,
        fileControlObj.id,
        reader.result as string,
        setSections
      );
    };
  };

  const removeFileFromValue = () => {
    updateSpecificCheck(sectionId, rowId, fileControlObj.id, "", setSections);
  };

  return (
    <div className={styles.checkViewContainer}>
      <h6>{fileControlObj.question}</h6>
      <input
        type="file"
        name={fileControlObj.id}
        className="form-control mb-3"
        onChange={handleChange}
        accept="jpeg/png"
      />
      {fileControlObj.value && fileControlObj.value != "" && (
        <>
          <p
            onClick={() => setModalOpen(true)}
            className={requestStyles.editIcon}
          >
            View File
          </p>
          
          <ModuleModal
            closeModal={() => setModalOpen(false)}
            isOpen={modalOpen}
            closeOnOverlayClick
            className={requestStyles.imageModal}
          >
            <Image
              src={fileControlObj.value}
              alt="img"
              width={500}
              height={500}
            />
          </ModuleModal>
        </>
      )}
    </div>
  );
}

function FileUploadView({
  fileControlObj,
}: {
  fileControlObj: FileUploadControl;
}) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <div className={styles.checkViewContainer}>
      <h6>{fileControlObj.question}</h6>
      <div>
            <ImagePreview previewObjURL={fileControlObj.value}/>
          </div>
      {/* <p onClick={() => setModalOpen(true)} className={requestStyles.editIcon}>
        View File
      </p>
      <ModuleModal
        closeModal={() => setModalOpen(false)}
        isOpen={modalOpen}
        closeOnOverlayClick
        className={requestStyles.imageModal}
      >
        <Image src={fileControlObj.value} alt="img" width={500} height={500} />
      </ModuleModal> */}
    </div>
  );
}

// function FileUploadReassignedEditable({ fileControlObj, rowId, sectionId }: {
// 	fileControlObj: FileUploadControl,
// 	rowId: string,
// 	sectionId: string

// }) {
//   const [modalOpen, setModalOpen] = useState<boolean>(false);
// 	const { setSections } = useContext(SectionsContext);
// 	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files && e.target.files.length > 0) {
// 			addFileToValue(e.target.files[0]);
// 		} else {
// 			removeFileFromValue();
// 		}
// 	};

// 	const addFileToValue = (file: File) => {
// 		const reader = new FileReader();
// 		reader.readAsDataURL(file);
// 		reader.onload = () => {
// 			updateSpecificCheck(sectionId, rowId, fileControlObj.id, reader.result as string, setSections);
// 			// updateSection(reader.result as string)
// 		};
// 	};

// 	const removeFileFromValue = () => {
// 		updateSpecificCheck(sectionId, rowId, fileControlObj.id, "", setSections);
// 		// updateSection("")
// 	};

// 	const updateSection = (value: string) => {
// 		setSections((prevSections) => {
// 			const newSections = [...prevSections];
// 			newSections.forEach(section => {
// 				if (section.id === sectionId) {
// 					section.updateSection(rowId, fileControlObj.id, value)
// 				}
// 			})
// 			return newSections;
// 		});
// 	};

// 	return (
// 		<>
//       <div className={styles.checkViewContainer}>
//         <h6>{fileControlObj.question}</h6>
//         <p
//           onClick={() => setModalOpen(true)}
//           className={requestStyles.editIcon}
//         >View File</p>
//       </div>
//       <ModuleModal
//         closeModal={() => setModalOpen(false)}
//         isOpen={modalOpen}
//         closeOnOverlayClick
//         className={requestStyles.imageModal}
//       >
//       <Image
//         src={fileControlObj.value}
//         alt="img"
//         width={500}
//         height={500}
//       />
//   </ModuleModal>
//   </>
// 	);
// };
