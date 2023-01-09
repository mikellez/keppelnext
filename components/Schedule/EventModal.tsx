import React, { useState } from "react";
import Modal from 'react-modal';
import { EventInfo } from "./ScheduleTemplate";

interface ModalProps {
    isOpen: boolean;
};

export default function EventModal(props: ModalProps) {

    return (
        <Modal
            isOpen={props.isOpen}
            ariaHideApp={false}
            // onRequestClose={closeModal}
        >
        <h1>Event</h1>
        </Modal>
    );
};