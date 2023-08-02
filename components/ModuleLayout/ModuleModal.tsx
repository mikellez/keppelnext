import React, { useEffect, useState, PropsWithChildren } from "react";
import Modal from "react-modal";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/ModuleModal.module.scss";

interface CustomMouseEventHandler extends React.MouseEventHandler {
  (event: React.MouseEvent | void): void;
}

export interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  closeModal: CustomMouseEventHandler;
  title?: string;
  closeOnOverlayClick?: boolean;
  className?: string;
  hideHeader?: boolean;
  large?: boolean;
  medium?: boolean;
}

export function ModuleModal(props: ModalProps) {
  return (
    <Modal
      isOpen={props.isOpen}
      ariaHideApp={false}
      onRequestClose={props.closeModal}
      shouldCloseOnOverlayClick={
        props.closeOnOverlayClick ? props.closeOnOverlayClick : false
      }
      style={{
        overlay: {
          zIndex: 10000,
          margin: "auto",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
        },
        content: {
          backgroundColor: "white",
          height: props.large ? "70%" : props.medium ? "60%" : "50%",
          width: props.large ? "70%" : props.medium ? "60%" : "50%",
          margin: "auto",
          border: "2px solid #393E46",
        },
      }}
      className={props.className}
    >
      <div>
        {!props.hideHeader && (
          <div className={styles.eventModalHeader}>
            <h4 className={styles.eventModalTitle}>{props.title}</h4>
            <GrClose
              onClick={props.closeModal}
              size={20}
              className={styles.eventModalClose}
            />
          </div>
        )}
        {props.children}
      </div>
    </Modal>
  );
}
