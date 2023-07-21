import React, { useState } from "react";
import { LicenseProps } from "../New";
import Link from "next/link";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { CMMSFeedback, CMMSLicense } from "../../../types/common/interfaces";
import LicenseContainer from "../../../components/License/LicenseContainer";

export default function ViewLicense(props: LicenseProps) {
  const [formData, setFormData] = useState<CMMSLicense>(props.feedbackData);

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="View License">
          <Link href="/License" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>
        <ModuleContent>
          <LicenseContainer data={formData} type={} />
        </ModuleContent>
      </ModuleMain>
    </>
  );
}
