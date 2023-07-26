import React from 'react';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { LicenseProps } from '../New';
import { getServerSideProps as LicenseServerProps } from '../New';


const LicenseAcquire = (props: LicenseProps) => {
    const router = useRouter();

    return <ModuleMain>
        <ModuleHeader title="Renew License"
        header="Renew License">
            <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
            >
            Back
            </button>
        </ModuleHeader>
        <LicenseContainer data={props} type="renew"/>
    </ModuleMain>
}

export const getServerSideProps = LicenseServerProps;

export default LicenseAcquire;