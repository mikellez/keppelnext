import React, { useRef, useContext, RefObject, useState } from "react";
import { SectionsContext } from "../../../pages/Checklist/Complete/[id]";
import { updateSpecificCheck } from "../ChecklistEditableForm";
import CheckControl from "../../../types/common/CheckControl";
import { ImCross } from "react-icons/im";
import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider } from "../../";
import SignatureCanvas from "react-signature-canvas";
import ReactSignatureCanvas from "react-signature-canvas";
import Image from "next/image";
import styles from "../../../styles/Checklist.module.scss";

export class SignatureControl extends CheckControl {
  constructor(question?: string, value?: string, id?: string) {
    super(question, value, id);
  }

  clone() {
    return new SignatureControl(this.question, this.value, this.id);
  }

  duplicate() {
    return new SignatureControl(this.question, this.value);
  }

  toString() {
    return `SignatureControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "Signature",
      question: this.question,
      value: this.value,
    };
  }

  render(onChange: Function, onDelete: Function) {
    return (
      <Signature
        signatureControlObj={this}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  renderEditableForm(rowId: string, sectionId: string) {
    return (
      <SignatureEditable
        signatureControlObj={this}
        rowId={rowId}
        sectionId={sectionId}
      />
    );
  }
  // renderReassignedEditableForm(rowId: string, sectionId: string) {
  //   return (
  //     <SignatureEditable
  //       signatureControlObj={this}
  //       rowId={rowId}
  //       sectionId={sectionId}
  //     />
  //   );
  // }

  renderViewOnlyForm() {
    return <SignatureView signatureControlObj={this} />;
  }
}

export function Signature({
  signatureControlObj,
  onChange,
  onDelete,
}: {
  signatureControlObj: SignatureControl;
  onChange: Function;
  onDelete: Function;
}) {
  const deleteSelf = () => {
    onDelete(signatureControlObj);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = signatureControlObj.clone();
    o.question = e.target.value;
    onChange(o);
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
      <div>Signature</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={signatureControlObj.question}
          placeholder="Enter Question"
        />
      </div>

      <div className="form-group" style={{ border: "black dashed 1px" }}>
        <SignatureCanvas canvasProps={{ width: "450%", height: "140%" }} />
      </div>
    </div>
  );
}

function SignatureEditable({
  signatureControlObj,
  rowId,
  sectionId,
}: {
  signatureControlObj: SignatureControl;
  rowId: string;
  sectionId: string;
}) {
  const { setSections } = useContext(SectionsContext);
  const sigRef = useRef<SignatureCanvas>() as RefObject<ReactSignatureCanvas>;

  const handleSignatureEnd = () => {
    const signatureURL = sigRef
      .current!.getTrimmedCanvas()
      .toDataURL("image/jpeg");
    updateSpecificCheck(
      sectionId,
      rowId,
      signatureControlObj.id,
      signatureURL,
      setSections
    );
  };

  return (
    <div className={styles.checkViewContainer}>
      <h6>{signatureControlObj.question}</h6>
      <div
        className="form-group"
        style={{ border: "black dashed 1px", height: "300", width: "200" }}
      >
        <SignatureCanvas
          canvasProps={{ width: "300", height: "200" }}
          backgroundColor="#E4DCCF"
          penColor="black"
          ref={sigRef}
          onEnd={handleSignatureEnd}
        />
      </div>
    </div>
  );
}

function SignatureView({
  signatureControlObj,
}: {
  signatureControlObj: SignatureControl;
}) {
  return (
    <div className={styles.checkViewContainer}>
      <h6>{signatureControlObj.question}</h6>
      {signatureControlObj.value.trim() !== "" && (
        <Image
          src={signatureControlObj.value}
          alt="signature"
          height={100}
          width={100}
        />
      )}
    </div>
  );
}

