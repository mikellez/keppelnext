import React from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { getServerSideProps as LicenseServerProps, CMMSLicense, CMMSLicenseType, CMMSPlantLocation, LicenseProps} from "../New/index";
import { GetServerSideProps, GetServerSidePropsContext } from 'next';


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
        <LicenseContainer data={props} create={false}/>
    </ModuleMain>
}

export const getServerSideProps = LicenseServerProps;

export default LicenseEdit;