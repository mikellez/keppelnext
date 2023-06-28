import React, { useState } from "react";
import { FeedbackFormProps } from "..";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import { CMMSFeedback } from "../../../types/common/interfaces";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { createFeedbackServerSideProps } from "../../../types/common/props";
import FeedbackViewForm from "../../../components/Feedback/FeedbackViewForm";

export default function ViewFeedback(props: FeedbackFormProps) {
  const [formData, setFormData] = useState<CMMSFeedback>(props.feedbackData);
  const router = useRouter();
  const user = useCurrentUser();

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="View Feedback">
          <Link href="/Feedback" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>
        <ModuleContent>
          <FeedbackViewForm
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
