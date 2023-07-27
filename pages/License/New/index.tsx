/*
  Explanation of License New Page

  This is the landing page responsible for the creation of a new license to be tracked

  This page is made up a single major container

  - LicenseContainer (More information can be found within LicenseContainer)
*/


import React, { useState, useEffect } from "react";
import instance from "../../../types/common/axios.config";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import RequiredIcon from "../../../components/RequiredIcon";
import LicenseTypeSelect from "../../../components/License/LicenseTypeSelect";
import PlantLocSelect from "../../../components/License/PlantLocSelect";
import AssignToSelect, {
  AssignedUserOption,
} from "../../../components/Schedule/AssignToSelect";
import AssetSelect, {
  AssetOption,
} from "../../../components/Checklist/AssetSelect";
import MultipleImagesUpload from "../../../components/License/MultipleImagesUpload";
import { SingleValue, MultiValue } from "react-select";
import LicenseContainer from "../../../components/License/LicenseContainer";
import {
  CMMSLicenseType,
  CMMSPlantLocation,
  CMMSLicenseForm,
} from "../../../types/common/interfaces";

export interface LicenseProps {
  plantLocs: CMMSPlantLocation[];
  licenseTypes: CMMSLicenseType[];
  license?: CMMSLicenseForm;
}

const LicenseNew = (props: LicenseProps) => {
  const router = useRouter();

  return (
    <ModuleMain>
      <ModuleHeader
        title="Create License Tracking"
        header="Create License Tracking"
      >
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <LicenseContainer data={props} type="new" />
    </ModuleMain>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };
  // console.log(context)
  const plantLocs = await instance.get("/api/plantLocation/self", headers);
  const licenseTypes = await instance.get("/api/license_types", headers);
  let license;
  if (context.query.id) {
    license = await instance.get(`/api/license/${context.query.id}`, headers);
  }

  let props: LicenseProps = {
    plantLocs: plantLocs.data,
    licenseTypes: licenseTypes.data,
    license: license ? license.data : null,
  };

  return {
    props: props,
  };
};

export default LicenseNew;