import React, { useState, useEffect} from 'react';
import instance from '../../types/common/axios.config';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components';
import RequiredIcon from '../../components/RequiredIcon';
import LicenseTypeSelect from '../../components/License/LicenseTypeSelect';
import PlantLocSelect from '../../components/License/PlantLocSelect';
import AssignToSelect, { AssignedUserOption } from '../../components/Schedule/AssignToSelect';
import AssetSelect, { AssetOption } from '../../components/Checklist/AssetSelect';
import MultipleImagesUpload from '../../components/License/MultipleImagesUpload';
import { SingleValue, MultiValue } from 'react-select';
import { CMMSLicense, CMMSLicenseType, CMMSPlantLocation, LicenseProps } from '../../pages/License/Form';
import ModuleSimplePopup from '../ModuleLayout/ModuleSimplePopup';
import { SimpleIcon } from '../ModuleLayout/ModuleSimplePopup';

interface LicenseContainerProps {
    data: LicenseProps
}

const LicenseContainer = (props: LicenseContainerProps) => {

    const [licenseForm, setLicenseForm] = useState<CMMSLicense>({

        license_name: "",
        license_provider: "",
        license_type_id: -1,
        license_details: "",
        plant_id: -1,
        plantLoc_id: -1,
        linked_asset_id: null,
        assigned_user_id: null,
        images: [],
    })

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);

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

    const handleSubmit = () => {
        setIsSubmitting(true);
        console.log(licenseForm);
        const formData = new FormData();
        for (const key of Object.keys(licenseForm)) {
            console.log(key);
            if (key !== "images" && !!licenseForm[key as keyof CMMSLicense]) {
                formData.append(key, licenseForm[key as keyof CMMSLicense]!.toString());
            } else {
                const images = licenseForm.images as File[];
                for (let i = 0; i < images.length; i++) {
                    formData.append('images', images[i]);
                }
            }
        }
        instance.post("/api/license", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }).then(res => {
            console.log(res);
            setIsSubmitting(false);
            setSuccessModal(true);
            setTimeout(() => {
                setSuccessModal(false);
                router.push("/License");
            }, 1500)
          }).catch(err => {
            setIsSubmitting(false);
            console.log(err);
          })
    }

    return <div>
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
                    <LicenseTypeSelect optionsData={props.data.licenseTypes} onChange={handleInput}/>
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> License Details</label>
                        <input type="text" name="license_details" className="form-control" 
                            value={licenseForm.license_details} onChange={handleInput}/>
                    </div>
                    <PlantLocSelect optionsData={props.data.plantLocs} onChange={handlePlantSelect}/>
                    <div className="mb-3">
                        <label className="form-label"><RequiredIcon/> Linked Asset</label>
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
            <button className="btn btn-primary d-flex" onClick={handleSubmit}>
                Submit
            </button>
        </div>
        <ModuleSimplePopup 
            setModalOpenState={setSuccessModal}
            modalOpenState={successModal}
            title="Success"
            text="New license tracking successfully created"
            icon={SimpleIcon.Check}
            shouldCloseOnOverlayClick={false}/>
    </div>
}

export default LicenseContainer;