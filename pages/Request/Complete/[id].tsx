import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../../components";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import Link from "next/link";
import RequestPreview, {
  RequestPreviewProps,
  RequestAction,
} from "../../../components/Request/RequestPreview";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import { CMMSRequest } from "../../../types/common/interfaces";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import { ThreeDots } from "react-loading-icons";

interface CompletionRequestInfo {
  completion_file?: File;
  complete_comments: string;
}

const completeRequest = async (data: CompletionRequestInfo, id: string) => {
  const sentData = new FormData();
  sentData.append("complete_comments", data.complete_comments);
  sentData.append("completion_file", data.completion_file!);

  return await axios({
    url: "/api/request/complete/" + id,
    method: "patch",
    data: sentData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
};

export default function CompleteRequest(props: RequestPreviewProps) {
  const [completionData, setCompletionData] = useState<CompletionRequestInfo>(
    {} as CompletionRequestInfo
  );
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;
  const { data } = useCurrentUser();

  useEffect(() => {
    if (data?.id != props.request.assigned_user_id) {
      router.push("/404");
    } else {
      setIsReady(true);
    }
  }, []);

  const updateData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.name === "completion_file") {
      const input = e.target as HTMLInputElement;
      if (!input.files || input.files.length == 0) {
        setCompletionData((prev) => {
          return {
            ...prev,
            completion_file: undefined,
          };
        });
      } else if (input.files && input.files.length > 0) {
        setCompletionData((prev) => {
          return {
            ...prev,
            completion_file: input.files![0],
          };
        });
      }
    } else {
      setCompletionData((prev) => {
        return {
          ...prev,
          complete_comments: e.target.value,
        };
      });
    }
  };

  const submitRequest = () => {
    if (
      !completionData.complete_comments ||
      completionData.complete_comments === "" ||
      !completionData.completion_file
    ) {
      setFailureModal(true);
    } else {
      completeRequest(completionData, id as string).then((result) => {
        setSuccessModal(true);
        router.push("/Request");
      });
    }
  };

  return (
    <>
      {isReady ? (
        <ModuleMain>
          <ModuleHeader title="New Request" header="Complete Request">
            <TooltipBtn text="Download PDF">
              <HiOutlineDownload size={20} />
            </TooltipBtn>
            <Link href="/Request" className="btn btn-secondary">
              Back
            </Link>
          </ModuleHeader>
          <ModuleContent>
            <RequestPreview request={props.request} />
            <div>
              <input
                type="file"
                className="form-control"
                onChange={updateData}
                accept="image/jpeg,image/png"
                name="completion_file"
                style={{ width: "20rem" }}
              />
              <textarea
                className="form-control"
                onChange={updateData}
                name="complete_comments"
                value={completionData.complete_comments}
                style={{ resize: "none", width: "30rem" }}
              ></textarea>
              <TooltipBtn toolTip={false} onClick={submitRequest}>
                Submit
              </TooltipBtn>
            </div>
          </ModuleContent>
        </ModuleMain>
      ) : (
        <div style={{ width: "100%", textAlign: "center" }}>
          <ThreeDots fill="black" />
        </div>
      )}
      <ModuleSimplePopup
        modalOpenState={failureModal}
        setModalOpenState={setFailureModal}
        text="Please ensure that you have an uploaded image and comments"
        title="Incomplete Maintenance"
        icon={SimpleIcon.Exclaim}
      />
      <ModuleSimplePopup
        modalOpenState={successModal}
        setModalOpenState={setSuccessModal}
        text="Request has been completed"
        title="Success"
        icon={SimpleIcon.Check}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const getSpecificRequest = await axios.get<CMMSRequest>(
    "http://localhost:3001/api/request/" + context.params?.id + "?restrict=true"
  );

  if (
    !getSpecificRequest.data ||
    ![2, 5].includes(getSpecificRequest.data.status_id as number)
  ) {
    return {
      redirect: {
        destination: "/404",
      },
      props: {},
    };
  }

  return {
    props: { request: getSpecificRequest.data, action: RequestAction.complete },
  };
};
