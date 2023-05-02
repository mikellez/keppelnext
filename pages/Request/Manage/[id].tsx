import React, { useState } from "react";
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
import instance from '../../axios.config.js';
import { CMMSRequest } from "../../../types/common/interfaces";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";
import styles from "../../../styles/Manage.module.css";
import { downloadPDF } from "../View/[id]";

const manageRequest = async (id: number, status: number, comments?: string) => {
  return await instance({
    url: `/api/request/${id}/${status}`,
    method: "patch",
    data: { comments: comments },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
};

export default function CompleteRequest(props: RequestPreviewProps) {
  const [modal, setModal] = useState<boolean>(false);
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [comments, setComments] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;

  const handleClick = (status: number) => {
    setDisabled(true);
    const requestId = parseInt(id as string);
    if (status == 5 && comments == "") {
      setFailureModal(true);
      setTimeout(() => {
        setDisabled(false);
      }, 1000);
    } else if (status == 5) {
      manageRequest(requestId, status, comments).then((result) => {
        setModal(true);
        setTimeout(() => {
          router.push("/Request");
        }, 1000);
      });
    } else {
      manageRequest(requestId, status).then((result) => {
        setModal(true);
        setTimeout(() => {
          router.push("/Request");
        }, 1000);
      });
    }
  };

  return (
    <>
      <ModuleMain>
        <ModuleHeader title="New Request" header="Manage Request">
          <TooltipBtn text="Download PDF" onClick={() => downloadPDF(parseInt(id as string))}>
            <HiOutlineDownload size={20} />
          </TooltipBtn>
          <Link href="/Request" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>
        <ModuleContent>
          <RequestPreview
            request={props.request}
            action={RequestAction.manage}
          />
          <div className={styles.comment}>
            <div style={{ fontWeight: "bold" }}>Comments</div>
            <textarea
              className="form-control"
              onChange={(e) => {
                setComments(e.target.value);
              }}
              value={comments}
              rows={3}
              maxLength={250}
              style={{ width: 500, marginLeft: "15rem", resize: "none" }}
            ></textarea>
          </div>

          <div className={styles.buttons}>
            <TooltipBtn
              onClick={() => handleClick(4)}
              toolTip={false}
              className={styles.approveBtn}
            >
              Approve
            </TooltipBtn>
            <TooltipBtn onClick={() => handleClick(5)} toolTip={false}>
              Reject
            </TooltipBtn>
          </div>
        </ModuleContent>
      </ModuleMain>
      <ModuleSimplePopup
        modalOpenState={modal}
        setModalOpenState={setModal}
        text="Your action has been successfully recorded"
        title="Success"
        icon={SimpleIcon.Check}
      />
      <ModuleSimplePopup
        modalOpenState={failureModal}
        setModalOpenState={setFailureModal}
        text="Please provide your reasons for rejecting the completed request"
        title="Missing comments"
        icon={SimpleIcon.Exclaim}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const getSpecificRequest = await instance.get<CMMSRequest>(
    `/api/request/` + context.params?.id
  );

  if (
    !getSpecificRequest.data
  ) {
    return {
      redirect: {
        destination: "/404",
      },
      props: {},
    };
  }

  return {
    props: { request: getSpecificRequest.data, action: RequestAction.manage },
  };
};
