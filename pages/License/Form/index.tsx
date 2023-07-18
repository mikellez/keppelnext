import React, { useState, useEffect} from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ModuleMain, ModuleHeader, ModuleContent } from '../../../components';
import RequiredIcon from '../../../components/RequiredIcon';
import ModuleSelect from '../../../components/ModuleLayout/ModuleSelect';
import LicenseTypeSelect from '../../../components/License/LicenseTypeSelect';
import PlantLocSelect from '../../../components/License/PlantLocSelect';
import AssignToSelect from '../../../components/Schedule/AssignToSelect';
import AssetSelect from '../../../components/Checklist/AssetSelect';


interface LicenseProps {
    plantLocs: CMMSPlantLocation[],
    licenseTypes: CMMSLicenseType[],
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
    license_id?: number,
    license_name: string,
    license_provider: string,
    license_type_id: number,
    license_details: string,
    plant_id: number,
    plantLoc_id: number,
    linked_asset_id: number,

}

const LicenseNew = (props: LicenseProps) => {

    const [licenseForm, setLicenseForm] = useState<CMMSLicense>({

        license_name: "",
        license_provider: "",
        license_type_id: -1,
        license_details: "",
        plant_id: -1,
        plantLoc_id: -1,
        linked_asset_id: - 1,
    })

    // console.log(props);
    const router = useRouter();

    const handleInput = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        setLicenseForm(prev => {
            return {
                ...prev,
                [event.target.name]: event.target.value
            };
        });
    }

    const handlePlantSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const plant_id = event.target.value.split('-')[0];
        const loc_id = event.target.value.split('-')[1];

        setLicenseForm(prev => {
            return {
                ...prev,
                "plant_id": +plant_id,
                "plantLoc_id": +loc_id,
            }
        })
    }

    return <ModuleMain>
        <ModuleHeader title="Create License Tracking" header="Create License Tracking">
            <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
            >
            Back
            </button>
        </ModuleHeader>
        <ModuleContent includeGreyContainer>
            <div className="row">
                <div className="col-6 pe-5">
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> License Name</label>
                        <input type="text" name="license_name" className="form-control" 
                            value={licenseForm.license_name} onChange={handleInput}/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> License Provider</label>
                        <input type="text" name="license_provider" className="form-control" 
                            value={licenseForm.license_provider} onChange={handleInput}/>
                    </div>
                    <LicenseTypeSelect optionsData={props.licenseTypes} onChange={handleInput}/>
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> License Details</label>
                        <input type="text" name="license_details" className="form-control" 
                            value={licenseForm.license_details} onChange={handleInput}/>
                    </div>
                    <PlantLocSelect optionsData={props.plantLocs} onChange={handlePlantSelect}/>
                    {/* <AssignToSelect /> */}
                </div>
                <div className="col-6 ps-5">
                    bye
                </div>
            </div>
        </ModuleContent>
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

      const plantLocs = await instance.get("/api/plantLocation/self", headers);
      const licenseTypes = await instance.get("/api/license_types", headers);

      let props: LicenseProps = {
        plantLocs: plantLocs.data,
        licenseTypes: licenseTypes.data,
      }
      
      return {
        props: props
      }
}

export default LicenseNew;