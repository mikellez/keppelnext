import formStyles from "../../../styles/formStyles.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ModuleContent,
  ModuleDivider,
  ModuleHeader,
  ModuleMain,
  ModuleFooter,
} from "../../../components";
import { CMMSFeedback } from "../../../types/common/interfaces";
import instance from "../../../types/common/axios.config";
import { useCurrentUser } from "../../../components/SWR";
import { CheckSection } from "../../../types/common/classes";
import LoadingHourglass from "../../../components/LoadingHourglass";
import TooltipBtn from "../../../components/TooltipBtn";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import FeedbackCreationForm from "../../../components/Feedback/FeedbackAssignmentForm";
import { createChecklistGetServerSideProps } from "../../../types/common/props";

interface FeedbackPageProps {
  feedback: CMMSFeedback | null;
  id: number;
}

const assignFeedback = async (
  feedback: CMMSFeedback,
  type: string,
  feedback_id: number
) => {
  return await instance
    .patch(`/api/feedback/${type}/${feedback_id}`, { feedback })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
};

export default function FeedbackNew(props: FeedbackPageProps) {
  const [feedbackData, setFeedbackData] = useState<CMMSFeedback>(
    {} as CMMSFeedback
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sections, setSections] = useState<CheckSection[]>([]);
  const [incompleteModal, setIncompleteModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);

  const resetFeedback = () => {
    setSections([]);
  };

  const user = useCurrentUser();

  const router = useRouter();
  useEffect(() => {
    if (props.feedback && props.feedback.datajson.length > 0) {
      const sectionsFromJSON = props.feedback.datajson.map((section: any) => {
        return CheckSection.fromJSON(JSON.stringify(section));
      });
      setSections(sectionsFromJSON);
    }
  }, [props.feedback]);

  const submitFeedback = (feedbackType: string, feedback_id: string) => {
    if (!checkInputFields()) {
      //   console.log("fail");
      setIncompleteModal(true);
    } else {
      setSuccessModal(true);
      assignFeedback(feedbackData, feedbackType, parseInt(feedback_id));
      setTimeout(() => {
        router.push("/Feedback");
      }, 1000);
    }
  };

  //   const updateFeedback = async () => {
  //     if (!checkInputFields()) {
  //       setIncompleteModal(true);
  //     } else {
  //       setSuccessModal(true);
  //       await editFeedbackAPI(feedbackData, +router.query.id!);
  //       setTimeout(() => {
  //         router.push("/Checklist");
  //       }, 1000);
  //     }
  //   };
  const checkInputFields = () => {
    console.log(feedbackData.assigned_user_name);
    return feedbackData.assigned_user_name && feedbackData.description;
  };

  useEffect(() => {
    setFeedbackData((prev) => {
      return {
        ...prev,
        createdbyuser: user.data?.name as string,
        plant_id: user.data?.allocated_plants[0] as number,
      };
    });

    if (props.feedback) {
      setFeedbackData((prev) => {
        return {
          ...prev,
          ...props.feedback,
        };
      });

      if (props.feedback.datajson.length > 0) {
        const sectionsFromJSON = props.feedback.datajson.map((section: any) => {
          return CheckSection.fromJSON(JSON.stringify(section));
        });
        setSections(sectionsFromJSON);
      }
    }

    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, [user.data, props.feedback]);

  useEffect(() => {
    const json =
      sections.length > 0 ? sections.map((section) => section.toJSON()) : [];
    setFeedbackData((prev) => {
      return {
        ...prev,
        datajson: json,
      };
    });
  }, [sections]);

  // console.log(checklistData.datajson)
  // console.log(checklistData.status_id);
  return (
    <>
      <ModuleMain>
        <ModuleHeader title="Feedback Assignment" header={"Assign feedback"}>
          <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
          >
            Back
          </button>
        </ModuleHeader>
        {isReady ? (
          <>
            <FeedbackCreationForm
              feedbackData={feedbackData}
              setFeedbackData={setFeedbackData}
            />
            <ModuleFooter>
              <>
                <TooltipBtn
                  toolTip={false}
                  onClick={() =>
                    submitFeedback("assign", router.query.id as string)
                  }
                  disabled={successModal}
                >
                  Submit
                </TooltipBtn>
              </>
            </ModuleFooter>
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "calc((100% - 8rem) / 2)",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <LoadingHourglass />
          </div>
        )}
      </ModuleMain>

      <ModuleSimplePopup
        setModalOpenState={setSuccessModal}
        modalOpenState={successModal}
        title="Success"
        text="Feedback has been assigned"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        setModalOpenState={setIncompleteModal}
        modalOpenState={incompleteModal}
        title="Missing details"
        text="Please ensure that all input fields have been filled"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
}

export { type FeedbackPageProps };
