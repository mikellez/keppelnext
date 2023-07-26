/*
  Explanation of License Edit Page

  This is the landing page responsible for the editing of a an existing license
  In this page, users may edit most details except for the license's
  acquisition date and expiry date (See Acquire and Renew). In this page,
  an unassigned license (draft) can be assigned to a user to acquire the license.
  A user can choose to archive or delete an existing licensei in this page too

  This page is made up a single major container

  - LicenseContainer (More information can be found within LicenseContainer)
*/

import React from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { LicenseProps } from '../New';
import { getServerSideProps as LicenseServerProps } from '../New';


const LicenseEdit = (props: LicenseProps) => {
    console.log(props);
    const router = useRouter();

    return <ModuleMain>
        <ModuleHeader title="Edit License Tracking"
        header="Edit License Tracking">
            <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
            >
            Back
            </button>
        </ModuleHeader>
        <LicenseContainer data={props} type="edit"/>
    </ModuleMain>
}

export const getServerSideProps = LicenseServerProps;

export default LicenseEdit;