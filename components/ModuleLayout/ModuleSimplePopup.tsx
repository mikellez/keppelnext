import styles from "./ModuleSimplePopup.module.css";

import React, { useState } from "react";
import Modal from "react-modal";

import { IconType } from "react-icons/lib";
import {
  BsX,
  BsCheck2,
  BsExclamationCircle,
  BsInfoCircle,
  BsQuestionCircle,
} from "react-icons/bs";
import LoadingHourglass from "../LoadingHourglass";

export enum SimpleIcon {
  Info,
  Check,
  Exclaim,
  Cross,
  Question,
  Loading,
}

interface InputProps {
  setInput: React.Dispatch<React.SetStateAction<string>>;
  value: string;
  title: string;
}
interface ModuleSimplePopupProps {
  modalOpenState: boolean;
  setModalOpenState: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  text?: string;
  icon?: SimpleIcon | IconType | null;
  buttons?: React.ReactNode | React.ReactNode[];
  onRequestClose?: Function;
  shouldCloseOnOverlayClick?: boolean;
  inputField?: boolean;
  inputVar?: InputProps;
}

export default function ModuleSimplePopup(props: ModuleSimplePopupProps) {
  const toggleModal = () => {
    // console.log(props.modalOpenState);
    props.setModalOpenState(!props.modalOpenState);
  };

  const getIcon = () => {
    if (props.icon === undefined || props.icon === null) return null;

    // TODO icons 💀
    if (props.icon === SimpleIcon.Check)
      return <BsCheck2 size={122} color="#1F8A70" />;
    if (props.icon === SimpleIcon.Exclaim)
      return <BsExclamationCircle size={108} color="#C70F2B" />;
    if (props.icon === SimpleIcon.Cross)
      return <BsX size={122} color="#CD0404" />;
    if (props.icon === SimpleIcon.Question)
      return <BsQuestionCircle size={122} color="#CD0404" />;

    if (props.icon === SimpleIcon.Info)
      return <BsInfoCircle size={108} color="#009EFF" />;
    if (props.icon === SimpleIcon.Loading) return <LoadingHourglass />;
  };

  return (
    <Modal
      isOpen={props.modalOpenState}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={props.shouldCloseOnOverlayClick}
      onRequestClose={() => {
        if (props.onRequestClose !== undefined) props.onRequestClose();
        else toggleModal();
      }}
      //onRequestClose={() => {return}}
      className={{
        base: styles.modalContent,
        beforeClose: styles.modalContentBeforeClose,
        afterOpen: styles.modalContentAfterOpen,
      }}
      overlayClassName={{
        base: styles.modalOverlay,
        beforeClose: styles.modalOverlayBeforeClose,
        afterOpen: styles.modalOverlayAfterOpen,
      }}
      closeTimeoutMS={100}
    >
      {/* <div style={{textAlign: "right"}}><BsX size={28}/></div> */}
      <div className={styles.centerContent}>
        <div style={{ height: "7.5em" }}>{getIcon()} </div>
        <h2>{props.title}</h2>
        <p className={styles.modalText}>{props.text}</p>
        {props.inputField && (
          <>
            <label>{props.inputVar?.title}</label>
            <textarea
              className="form-control"
              value={props.inputVar?.value}
              onChange={(e) => props.inputVar!.setInput(e.target.value)}
              rows={2}
              maxLength={100}
              style={{ resize: "none" }}
            />
          </>
        )}
        <div className={styles.footerButtons}>{props.buttons}</div>
      </div>
    </Modal>
  );
}
