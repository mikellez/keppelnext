import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
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
import instance from "../../../axios.config.js";
import { CMMSRequest } from "../../../types/common/interfaces";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import { ThreeDots } from "react-loading-icons";
import styles from "../../../styles/Request.module.scss";
import formStyles from "../../../styles/formStyles.module.css";
import { downloadPDF } from "../View/[id]";
import Image from "next/image";
import RequiredIcon from "../../../components/RequiredIcon";

interface CompletionRequestInfo {
  completion_file?: File;
  complete_comments: string;
}

const completeRequest = async (data: CompletionRequestInfo, id: string) => {
  const sentData = new FormData();
  sentData.append("complete_comments", data.complete_comments);
  sentData.append("completion_file", data.completion_file!);

  return await instance({
    url: "/api/request/complete/" + id,
    method: "patch",
    data: sentData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    .then((res: any) => {
      return res.data;
    })
    .catch((err: any) => console.log(err));
};

export default function CompleteRequest(props: RequestPreviewProps) {
  const [completionData, setCompletionData] = useState<CompletionRequestInfo>(
    {} as CompletionRequestInfo
  );
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [completeImage, setCompleteImage] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;
  const { data } = useCurrentUser();

  useEffect(() => {
    if (data?.role_id == 4 && data?.id != props.request.assigned_user_id) {
      router.push("/403");
    } else {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (completionData.completion_file) {
      const reader = new FileReader();
      reader.readAsDataURL(completionData.completion_file!);
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
    }
  }, [completionData.completion_file]);

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
            <TooltipBtn
              text="Download PDF"
              onClick={() => downloadPDF(parseInt(id as string))}
            >
              <HiOutlineDownload size={20} />
            </TooltipBtn>
            <button
              className={"btn btn-secondary"}
              type="button"
              onClick={() => router.back()}
            >
              Back
            </button>
          </ModuleHeader>
          <ModuleContent>
            <RequestPreview request={props.request} />
            <table className={styles.table}>
              <tbody>
                <tr>
                  <th>Completion File <RequiredIcon /></th>
                  <td valign="baseline">
                    <input
                      type="file"
                      className="form-control mb-1"
                      onChange={updateData}
                      accept="image/jpeg,image/png"
                      name="completion_file"
                      style={{ width: "20rem" }}
                    />
                    {completionData.completion_file && (
                      <div>
                        <Image
                          src={imageSrc}
                          width={150}
                          height={150}
                          style={{ objectFit: "contain", cursor: "pointer" }}
                          alt="Fault Image"
                          onClick={() => setCompleteImage(true)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>
                    Completion Comments <RequiredIcon /> 
                  </th>
                  <td>
                    <textarea
                      className="form-control"
                      onChange={updateData}
                      name="complete_comments"
                      value={completionData.complete_comments}
                      style={{ resize: "none", width: "30rem" }}
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
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
      <ModuleModal
        isOpen={completeImage}
        closeModal={() => setCompleteImage(false)}
        closeOnOverlayClick={true}
        className={styles.modal}
        hideHeader
      >
        {/* <Image src={f.image} width={100} height={100} alt="" /> */}
        {/* <div style={{ textAlign: "center" }}> */}
        <Image
          src={imageSrc}
          width={550}
          height={550}
          style={{ objectFit: "contain" }}
          alt="Completion Image"
        />
        {/* <img width={"75%"} height={"75%"} src={imageSrc} alt="" /> */}
        {/* </div> */}
      </ModuleModal>
      <ModuleSimplePopup
        modalOpenState={failureModal}
        setModalOpenState={setFailureModal}
        text="Please ensure that you have an uploaded image and comments"
        title="Incomplete Maintenance"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />
      <ModuleSimplePopup
        modalOpenState={successModal}
        setModalOpenState={setSuccessModal}
        text="Request has been completed"
        title="Success"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const getSpecificRequest = await instance.get<CMMSRequest>(
    `/api/request/` + context.params?.id + "?restrict=true"
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
