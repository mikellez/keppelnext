import React from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import LicenseContainer from '../../../components/License/LicenseContainer';
import { getServerSideProps as LicenseServerProps, CMMSLicense, CMMSLicenseType, CMMSPlantLocation, LicenseProps} from "../New/index";
import { GetServerSideProps, GetServerSidePropsContext } from 'next';


const LicenseEdit = (props: LicenseProps) => {
    
    const router = useRouter();

    return <ModuleMain>
        <ModuleHeader title="Acquire License Tracking"
        header="Create License Tracking">
            <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
            >
            Back
            </button>
        </ModuleHeader>
        <LicenseContainer data={props}/>
    </ModuleMain>
}

const getServerSideProps = LicenseServerProps

export default LicenseEdit;