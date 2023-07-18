import React, { useState, useEffect} from 'react';
import instance from '../../../types/common/axios.config';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ModuleMain, ModuleHeader, ModuleContent } from '../../../components';
import RequiredIcon from '../../../components/RequiredIcon';
import ModuleSelect from '../../../components/ModuleLayout/ModuleSelect';
import LicenseTypeSelect from '../../../components/License/LicenseTypeSelect';
import PlantLocSelect from '../../../components/License/PlantLocSelect';
import AssignToSelect, { AssignedUserOption } from '../../../components/Schedule/AssignToSelect';
import AssetSelect, { AssetOption } from '../../../components/Checklist/AssetSelect';
import MultipleImagesUpload from '../../../components/License/MultipleImagesUpload';
import { SingleValue, MultiValue } from 'react-select';
import { useForm } from 'react-hook-form'



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
    license_id?: number;
    license_name: string;
    license_provider: string;
    license_type_id: number;
    license_details: string;
    plant_id: number;
    plantLoc_id: number;
    linked_asset_id: number;
    assigned_user_id: number;
    images: File[];

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
        assigned_user_id: -1,
        images: [],
    })

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const router = useRouter();
    // const { data: assetList } = useAsset(licenseForm.plant_id == -1 ? null : licenseForm.plant_id);

    // update assign_to dropdown according to plant_id
    // useEffect(() => {
    //     if (licenseForm.plant_id != -1) {
    //         instance.
    //     }
    // }, [licenseForm.plant_id])

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

    const handleLinkedAsset = (option: MultiValue<AssetOption> | SingleValue<AssetOption>) => {
        setLicenseForm(prev => {
            return {
                ...prev,
                "linked_asset_id": (option as SingleValue<AssignedUserOption>)?.value as number
            }
        })
    }

    const handleAssignee = (option: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>) => {
        setLicenseForm(prev => {
            return {
                ...prev,
                "assigned_user_id": (option as SingleValue<AssignedUserOption>)?.value as number
            }
        })
    }

    const handleImages = (files: File[]) => {
        setLicenseForm(prev => {
            return {
                ...prev,
                "images": [...prev.images, ...files]
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
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/>Linked Asset</label>
                        <AssetSelect isSingle plantId={licenseForm.plant_id == -1 ? 1: licenseForm.plant_id}
                        defaultIds={[]} onChange={handleLinkedAsset}/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> Assign To</label>
                        <AssignToSelect isSingle plantId={licenseForm.plant_id == -1 ? 1: licenseForm.plant_id}
                            onChange={handleAssignee} disabled={licenseForm.plant_id === -1}/>
                    </div>
                    
                </div>
                <div className="col-6 ps-5">
                <MultipleImagesUpload setLicenseForm={setLicenseForm} isSubmitting={isSubmitting}/>
                
                </div>
            </div>
            
        </ModuleContent>
        <div className='d-flex justify-content-end'>
            <button className="btn btn-primary d-flex">Submit</button>
        </div>
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