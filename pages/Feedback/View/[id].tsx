import React, { useState } from "react";
import { FeedbackFormProps } from "..";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import { CMMSFeedback } from "../../../types/common/interfaces";
import { GetServerSideProps } from "next";
import Link from "next/link";
import {
  ModuleMain,
  ModuleHeader,
  ModuleContent,
  ModuleFooter,
  SimpleIcon,
} from "../../../components";
import FeedbackCompletedForm from "../../../components/Feedback/FeedbackCompletedForm";
import LoadingHourglass from "../../../components/LoadingHourglass";
import ModuleSimplePopup from "../../../components/ModuleLayout/ModuleSimplePopup";
import TooltipBtn from "../../../components/TooltipBtn";
import { createFeedbackServerSideProps } from "../../../types/common/props";

export default function ViewFeedback(props: FeedbackFormProps) {
  const [formData, setFormData] = useState<CMMSFeedback>(props.feedbackData);
  const router = useRouter();
  const user = useCurrentUser();

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="Complete Feedback">
          <Link href="/Feedback" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>
        <ModuleContent>
          <FeedbackCompletedForm
            feedbackData={formData}
            setFeedbackData={setFormData}
            disableForm={true}
          />
        </ModuleContent>
      </ModuleMain>
    </>
  );
}

export const getServerSideProps: GetServerSideProps =
  createFeedbackServerSideProps([4]);
