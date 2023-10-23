import Image from "next/image";
import React, { RefObject, useContext, useEffect, useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { default as ReactSignatureCanvas, default as SignatureCanvas } from "react-signature-canvas";
import { ModuleDivider } from "../../";
import { SectionsContext } from "../../../pages/Checklist/Complete/[id]";
import styles from "../../../styles/Checklist.module.scss";
import CheckControl from "../../../types/common/CheckControl";
import RequiredIcon from "../../RequiredIcon";
import ToggleSwitch from "../../ToggleSwitch/ToggleSwitch";
import { updateSpecificCheck } from "../ChecklistEditableForm";
import checklistStyles from "../ChecklistTemplateCreator.module.css";

export class SignatureControl extends CheckControl {
  constructor(question?: string, value?: string, required?: boolean, id?: string) {
    super(question, value, id, required);
  }

  clone() {
    return new SignatureControl(this.question, this.value, this.required, this.id);
  }

  duplicate() {
    return new SignatureControl(this.question, this.value, this.required);
  }

  toString() {
    return `SignatureControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "Signature",
      question: this.question,
      value: this.value,
      required: this.required,
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

  renderEditableForm(rowId: string, sectionId: string, index: number) {
    return (
      <SignatureEditable
        signatureControlObj={this}
        rowId={rowId}
        sectionId={sectionId}
        index={index}
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
  const [isRequired, setIsRequired] = useState<boolean>(false);

  const deleteSelf = () => {
    onDelete(signatureControlObj);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = signatureControlObj.clone();
    o.question = e.target.value;
    onChange(o);
  };

  const handleRequired = () => {
    setIsRequired(!isRequired);
  }

  useEffect(() => {
    const retrievedIsRequired = signatureControlObj.required;
    setIsRequired(retrievedIsRequired);
  }, []);
  
  useEffect (() => {
    // console.log(isRequired);
    const o = signatureControlObj.clone();
    o.required = isRequired;
    onChange(o);

  },[isRequired])

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
        {/* <SignatureCanvas canvasProps={{ width: "450%", height: "140%" }} /> */}
        <div style={{}}></div>
      </div>
      <div style={{display: "flex", alignItems:"center", gap:"10px", justifyContent:"flex-end"}}>
        <div>Required</div>
        <ToggleSwitch 
          isSelected = {isRequired}
          onChange = {handleRequired}
        />
      </div>
    </div>
  );
}

function SignatureEditable({
  signatureControlObj,
  rowId,
  sectionId,
  index
}: {
  signatureControlObj: SignatureControl;
  rowId: string;
  sectionId: string;
  index?: number
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

  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  };

  return (
    <div className={styles.checkViewContainer}>
      <h6>
        {signatureControlObj.required === true ? <RequiredIcon />: null}&nbsp;
        { signatureControlObj.question}
      </h6>
      <div
        className="form-group"
        // style={{ border: "black dashed 1px" }}
      >
        <SignatureCanvas
          canvasProps={{ width: "300", height: "100" }}
          backgroundColor="#F8E8EE"
          penColor="black"
          ref={sigRef}
          onEnd={handleSignatureEnd}
        />
        <button 
          className="btn btn-secondary" 
          onClick={clearSignature} 
          style={{ margin: '0', display: 'block' }}
          > 
          Clear Signature
        </button>
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
      <h6>
        {signatureControlObj.required === true ? <RequiredIcon />: null}&nbsp;
        { signatureControlObj.question}
      </h6>
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

