import React, { useState, useEffect} from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ModuleMain, ModuleHeader, ModuleContent } from '../../../components';
import RequiredIcon from '../../../components/RequiredIcon';
import LicenseTypeSelect from '../../../components/License/LicenseTypeSelect';
import PlantLocSelect from '../../../components/License/PlantLocSelect';
import AssignToSelect, { AssignedUserOption } from '../../../components/Schedule/AssignToSelect';
import AssetSelect, { AssetOption } from '../../../components/Checklist/AssetSelect';
import MultipleImagesUpload from '../../../components/License/MultipleImagesUpload';
import { SingleValue, MultiValue } from 'react-select';
import LicenseContainer from '../../../components/License/LicenseContainer';



export interface LicenseProps {
    plantLocs: CMMSPlantLocation[],
    licenseTypes: CMMSLicenseType[],
    license?: CMMSLicense,
}

export interface CMMSPlantLocation {
    plant_id: number,
    plant_name: string,
    loc_id: number,
    loc_floor: string,
    loc_room: string,
}

export interface CMMSLicenseType {
    type_id: number,
    type: string,
}

export interface CMMSLicense {
    license_id?: number;
    license_name: string;
    license_provider: string;
    license_type_id: number;
    license_details: string;
    plant_id: number;
    plantLoc_id: number;
    linked_asset_id: number | null;
    assigned_user_id: number | null;
    images: File[];

}

const LicenseNew = (props: LicenseProps) => {

    const router = useRouter();


    return <ModuleMain>
        <ModuleHeader title={router.query.action === "New" ? `Create License Tracking` : `Acquire License Tracking`} 
        header={router.query.action === "New" ? `Create License Tracking` : `Acquire License Tracking`}>
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

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const headers = {
        withCredentials: true,
        headers: {
          Cookie: context.req.headers.cookie,
        },
      };
      console.log(context)
      const plantLocs = await instance.get("/api/plantLocation/self", headers);
      const licenseTypes = await instance.get("/api/license_types", headers);

      if (context.query.id) {
        const license = await instance.get(`/api/license/${context.query.id}`, headers);
      }

      let props: LicenseProps = {
        plantLocs: plantLocs.data,
        licenseTypes: licenseTypes.data,
      }
      
      return {
        props: props
      }
}

export default LicenseNew;