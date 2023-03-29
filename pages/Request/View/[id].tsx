import React from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import RequestPreview, {
    RequestPreviewProps,
    RequestAction,
  } from "../../../components/Request/RequestPreview";
import TooltipBtn from "../../../components/TooltipBtn";
import { HiOutlineDownload } from 'react-icons/hi';
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import { CMMSRequest } from "../../../types/common/interfaces";
import { useRouter } from "next/router";

const downloadPDF = async (id: number) => {
  try {
    const response = await axios({
      url: `/api/request/pdf/${id}`,
      method: "get",
      responseType: "arraybuffer",
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const temp_link = document.createElement("a");
    temp_link.download = `request_id_${id}.pdf`;
    temp_link.href = url;
    temp_link.click();
    temp_link.remove();
  } catch (e) {
    console.log(e);
  }
};

export default function ViewRequest(props: RequestPreviewProps) {
  const router = useRouter();
  const { id } = router.query;
    return (
        <ModuleMain>
          <ModuleHeader title="New Request" header="Complete Request">
            <TooltipBtn text="Download PDF" onClick={() => downloadPDF(parseInt(id as string))}>
              <HiOutlineDownload size={20} />
            </TooltipBtn>
            <Link href="/Request" className="btn btn-secondary">
              Back
            </Link>
          </ModuleHeader>
          <ModuleContent>
            <RequestPreview request={props.request} action={props.action} />
          </ModuleContent>
        </ModuleMain>
    );
};

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
  ) => {
    const getSpecificRequest = await axios.get<CMMSRequest>(
      "http://localhost:3001/api/request/" + context.params?.id
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

