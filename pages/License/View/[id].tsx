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
          <LicenseContainer data={props} type={"acquire"} disabled={true} />
        </ModuleContent>
      </ModuleMain>
    </>
  );
}

export const getServerSideProps = LicenseServerProps;
