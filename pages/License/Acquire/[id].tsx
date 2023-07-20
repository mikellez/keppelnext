import React from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { LicenseProps } from '../New';
import { getServerSideProps as LicenseServerProps } from '../New';


const LicenseAcquire = (props: LicenseProps) => {
    console.log(props);
    const router = useRouter();

    return <ModuleMain>
        <ModuleHeader title="Acquire License Tracking"
        header="Acquire License Tracking">
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