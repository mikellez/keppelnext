import { GetServerSideProps } from "next";
import React, { Component, useEffect, useState } from "react";
import { createFeedbackServerSideProps } from "../../../types/common/props";
import { CMMSFeedback } from "../../../types/common/interfaces";
import { FeedbackPageProps } from "..";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import instance from "../../../axios.config";
import Link from "next/link";
import {
  ModuleMain,
  ModuleHeader,
  ModuleContent,
  ModuleFooter,
  SimpleIcon,
} from "../../../components";
import LoadingHourglass from "../../../components/LoadingHourglass";
import ModuleSimplePopup from "../../../components/ModuleLayout/ModuleSimplePopup";
import TooltipBtn from "../../../components/TooltipBtn";
import FeedbackCompletedForm from "../../../components/Feedback/FeedbackCompletedForm";

export const editFeedback = async (formData: CMMSFeedback) => {
  return await instance
    .patch(`/api/feedback/complete/${formData.id}`, { formData })
    .then((res: any) => {
      return res.data;
    })
    .catch((err: any) => console.log(err));
};

export default function CompleteFeedbackPage(props: FeedbackPageProps) {
  const [formData, setFormData] = useState<CMMSFeedback>(props.feedback);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const router = useRouter();
  const user = useCurrentUser();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => {
      return {
        ...prev,
        changedDate: new Date(e.target.value),
      };
    });
  };

  const handleCompleteClick = () => {
    setConfirmModal(true);
  };

  const handleConfirmClick = () => {
    editFeedback(formData).then((result) => {
      setSuccessModal(true);
    });
  };

  useEffect(() => {
    // setIsReady(false);
    // if (user.data?.id != formData.assigned_user_id) {
    //   router.push("/403");
    //   return;
    // } else {
    //   setTimeout(() => {
    //     setIsReady(true);
    //   }, 1500);
    // }
    setTimeout(() => {
      setIsReady(true);
    }, 1500);
  }, [user.data]);
  //   console.log("is ready : " + isReady);
  return (
    <>
      {isReady ? (
        <ModuleMain>
          <ModuleHeader header="Complete Feedback">
            <Link href="/Feedback" className="btn btn-secondary">
              Back
            </Link>
          </ModuleHeader>
          <ModuleContent>
            <FeedbackCompletedForm
              feedbackData={props.feedback}
              setFeedbackData={setFormData}
            />
          </ModuleContent>
          <ModuleContent>
            <div className="form-group" style={{ width: "150px" }}>
              <label className="form-label">Date of Completion</label>
              <input
                type="date"
                className="form-control"
                onChange={handleOnChange}
                max={new Date().toISOString().slice(0, 10)}
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
          </ModuleContent>
          <ModuleFooter>
            <TooltipBtn
              toolTip={false}
              disabled={!formData.created_date}
              onClick={handleCompleteClick}
            >
              Complete
            </TooltipBtn>
          </ModuleFooter>
        </ModuleMain>
      ) : (
        <LoadingHourglass />
      )}

      <ModuleSimplePopup
        modalOpenState={confirmModal}
        setModalOpenState={setConfirmModal}
        buttons={
          <TooltipBtn toolTip={false} onClick={handleConfirmClick}>
            Confirm
          </TooltipBtn>
        }
        title="Confirm"
        text="Please confirm that you have completed the feedback"
        icon={SimpleIcon.Info}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={successModal}
        setModalOpenState={setSuccessModal}
        title="Success"
        text="You have successfully completed feedback."
        shouldCloseOnOverlayClick={true}
        icon={SimpleIcon.Check}
        buttons={[
          <TooltipBtn
            key={1}
            toolTip={false}
            onClick={() => router.push("/Feedback")}
          >
            Ok
          </TooltipBtn>,
        ]}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  createFeedbackServerSideProps([4]);
