/*
  Explanation of License View Page

  This is the landing page that displays the details of a license in a view-only format

  This page is made up a single major container

  - LicenseContainer (More information can be found within LicenseContainer)
*/

import React, { useEffect, useState } from "react";
import { LicenseProps } from "../New";
import Link from "next/link";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { CMMSLicenseForm } from "../../../types/common/interfaces";
import LicenseContainer from "../../../components/License/LicenseContainer";
import { getServerSideProps as LicenseServerProps } from "../New";

export default function ViewLicense(props: LicenseProps) {
  return (
    <>
      <ModuleMain>
        <ModuleHeader header="View License">
          <Link href="/License" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>
        <ModuleContent>
          <LicenseContainer data={props} type={"view"} disabled={true} />
        </ModuleContent>
      </ModuleMain>
    </>
  );
}

export const getServerSideProps = LicenseServerProps;
