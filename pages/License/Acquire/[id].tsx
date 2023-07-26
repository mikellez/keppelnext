/*
  Explanation of License Acquire Page

  This is the landing page responsible for the updating on the acquisition of 
  a license. Only the acquistion_date and expiry_date fields can be added
  in this page

  This page is made up a single major container

  - LicenseContainer (More information can be found within LicenseContainer)
*/

import React from 'react';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { LicenseProps } from '../New';
import { getServerSideProps as LicenseServerProps } from '../New';


const LicenseAcquire = (props: LicenseProps) => {
    const router = useRouter();

    return <ModuleMain>
        <ModuleHeader title="Acquire License"
        header="Acquire License">
            <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
            >
            Back
            </button>
        </ModuleHeader>
        <LicenseContainer data={props} type="acquire"/>
    </ModuleMain>
}

export const getServerSideProps = LicenseServerProps;

export default LicenseAcquire;