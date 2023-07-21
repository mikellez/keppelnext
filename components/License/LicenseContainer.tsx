import React, { useState, useEffect } from "react";
import instance from "../../types/common/axios.config";
import { useRouter } from "next/router";
import { ModuleContent } from "../../components";
import RequiredIcon from "../../components/RequiredIcon";
import LicenseTypeSelect from "../../components/License/LicenseTypeSelect";
import PlantLocSelect from "../../components/License/PlantLocSelect";
import AssignToSelect, {
  AssignedUserOption,
} from "../../components/Schedule/AssignToSelect";
import AssetSelect, {
  AssetOption,
} from "../../components/Checklist/AssetSelect";
import MultipleImagesUpload from "../../components/License/MultipleImagesUpload";
import { SingleValue, MultiValue } from "react-select";
import { LicenseProps } from "../../pages/License/New";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { CMMSLicenseForm } from "../../types/common/interfaces";
// import { LicenseProps } from "../"

export interface ImageStatus {
  received: boolean;
  processed: boolean;
}

const LicenseContainer = ({
  data,
  type,
  disabled,
}: {
  data: LicenseProps;
  type: string;
  disabled?: boolean;
}) => {
  const [licenseForm, setLicenseForm] = useState<CMMSLicenseForm>({
    license_id: 0,
    license_name: "",
    license_provider: "",
    license_type_id: -1,
    license_details: "",
    plant_id: -1,
    plant_loc_id: -1,
    linked_asset_id: null,
    assigned_user_id: null,
    images: [],
  });

  // fields can only be edited when creating or editing
  const [dateOnly, setDateOnly] = useState<boolean>(type === "acquire");
  // tracking image fetching and processing, used in MultipleImageUpload
  const [imageProcess, setImageProcess] = useState<ImageStatus>({
    received: false,
    processed: false,
  });
  // used in MultipleImageUpload to handle URL.revokeObjectUrl to prevent memory leak
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [missingFields, setMissingFields] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (data.license) {
      setLicenseForm(data.license);
    }
  }, [data.license]);

  useEffect(() => {
    if (type !== "new" && licenseForm.license_id && !imageProcess.received) {
      instance
        .get(`api/license/images/${licenseForm.license_id}`)
        .then((res) => {
          console.log("images fetched");
          const files = res.data.images.map(
            (image: { data: Iterable<number> }, index: number) => {
              const blob = new Blob([new Uint8Array(image.data)]);
              return new File([blob], `file${index}`);
            }
          );
          setLicenseForm((prev) => {
            return {
              ...prev,
              images: files,
            };
          });
          setImageProcess((prev) => {
            return {
              ...prev,
              received: true,
            };
          });
        });
    }
    if (type === "new") {
      setImageProcess({
        received: true,
        processed: true,
      });
    }
  }, [licenseForm, type]);

  const handleInput = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLicenseForm((prev) => {
      return {
        ...prev,
        [event.target.name]: event.target.value,
      };
    });
  };

  const handlePlantSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const plant_id = event.target.value.split("-")[0];
    const loc_id = event.target.value.split("-")[1];

    setLicenseForm((prev) => {
      return {
        ...prev,
        plant_id: +plant_id,
        plant_loc_id: +loc_id,
      };
    });
  };

  const handleLinkedAsset = (
    option: MultiValue<AssetOption> | SingleValue<AssetOption>
  ) => {
    setLicenseForm((prev) => {
      return {
        ...prev,
        linked_asset_id: (option as SingleValue<AssignedUserOption>)
          ?.value as number,
      };
    });
  };

  const handleAssignee = (
    option: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>
  ) => {
    setLicenseForm((prev) => {
      return {
        ...prev,
        assigned_user_id: (option as SingleValue<AssignedUserOption>)
          ?.value as number,
      };
    });
  };

  const handleDate = (type: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setLicenseForm((prev) => {
        return {
          ...prev,
          [type]: new Date(event.target.value),
        };
      });
    };
  };

  const handleSubmit = () => {
    console.log(licenseForm);
    if (
      !licenseForm.license_name ||
      !licenseForm.license_provider ||
      licenseForm.license_type_id === -1 ||
      !licenseForm.license_details ||
      licenseForm.plant_id === -1 ||
      licenseForm.plant_loc_id === -1 ||
      licenseForm.linked_asset_id === -1
    ) {
      setMissingFields(true);
    } else {
      // doing axios request

      setIsSubmitting(true);
      if (type === "acquire") {
        //acquire
        instance
          .patch(`api/license/acquire/${licenseForm.license_id}`, licenseForm)
          .then((res) => {
            console.log(res);
            setIsSubmitting(false);
            setSuccessModal(true);
            setTimeout(() => {
              setSuccessModal(false);
              router.push("/License");
            }, 1500);
          })
          .catch((err) => {
            setIsSubmitting(false);
            console.log(err);
          });
      } else if (type === "new" || type === "edit") {
        const formData = new FormData(); //process form data for both new and edit
        for (const key of Object.keys(licenseForm)) {
          if (key == "images") {
            const images = licenseForm.images as File[];
            for (let i = 0; i < images.length; i++) {
              console.log(i);
              formData.append("images", images[i]);
            }
          } else if (!!licenseForm[key as keyof CMMSLicenseForm]) {
            formData.append(
              key,
              licenseForm[key as keyof CMMSLicenseForm]!.toString()
            );
          }
        }
        if (type === "new") {
          // new

          instance
            .post("/api/license", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => {
              console.log(res);
              setIsSubmitting(false);
              setSuccessModal(true);
              setTimeout(() => {
                setSuccessModal(false);
                router.push("/License");
              }, 1500);
            })
            .catch((err) => {
              setIsSubmitting(false);
              console.log(err);
            });
        } else {
          //edit
          instance
            .patch(`api/license/${licenseForm.license_id}`, formData)
            .then((res) => {
              console.log(res);
              setIsSubmitting(false);
              setSuccessModal(true);
              setTimeout(() => {
                setSuccessModal(false);
                router.push("/License");
              }, 1500);
            })
            .catch((err) => {
              setIsSubmitting(false);
              console.log(err);
            });
        }
      }
    }
  };

  return (
    <div>
      <ModuleContent includeGreyContainer>
        <div className="row">
          <div className="col-6 pe-5">
            <div className="mb-3">
              <label className="form-label">
                <RequiredIcon /> License Name
              </label>
              <input
                type="text"
                name="license_name"
                className="form-control"
                value={licenseForm.license_name}
                onChange={handleInput}
                disabled={dateOnly || disabled}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                <RequiredIcon /> License Provider
              </label>
              <input
                type="text"
                name="license_provider"
                className="form-control"
                value={licenseForm.license_provider}
                onChange={handleInput}
                disabled={dateOnly || disabled}
              />
            </div>
            <LicenseTypeSelect
              optionsData={data.licenseTypes}
              onChange={handleInput}
              value={licenseForm.license_type_id}
              disabled={dateOnly || disabled}
            />
            <div className="mb-3">
              <label className="form-label">
                <RequiredIcon /> License Details
              </label>
              <input
                type="text"
                name="license_details"
                className="form-control"
                value={licenseForm.license_details}
                onChange={handleInput}
                disabled={dateOnly || disabled}
              />
            </div>
            <PlantLocSelect
              optionsData={data.plantLocs}
              onChange={handlePlantSelect}
              value={`${licenseForm.plant_id}-${licenseForm.plant_loc_id}`}
              plant_loc_id={licenseForm.plant_loc_id}
              disabled={dateOnly || disabled}
            />
            <div className="mb-3">
              <label className="form-label">
                <RequiredIcon /> Linked Asset
              </label>
              <AssetSelect
                isSingle
                plantId={licenseForm.plant_id == -1 ? 1 : licenseForm.plant_id}
                defaultIds={
                  licenseForm.linked_asset_id
                    ? [licenseForm.linked_asset_id]
                    : []
                }
                onChange={handleLinkedAsset}
                disabled={dateOnly || disabled}
              />
            </div>
            <div className="mb-3">
              <label className="form-label"> Assign To</label>
              <AssignToSelect
                isSingle={true}
                plantId={licenseForm.plant_id == -1 ? 1 : licenseForm.plant_id}
                onChange={handleAssignee}
                disabled={dateOnly || licenseForm.plant_id === -1 || disabled}
                defaultIds={
                  licenseForm.assigned_user_id
                    ? [licenseForm.assigned_user_id]
                    : []
                }
              />
            </div>
          </div>
          <div className="col-6 ps-5 d-flex flex-column justify-content-between">
            <MultipleImagesUpload
              setLicenseForm={setLicenseForm}
              files={licenseForm.images}
              imageStatus={imageProcess}
              setImageStatus={setImageProcess}
              disabled={dateOnly || disabled}
            />
            {/* Create is true only for new license tracking */}
            {(type === "acquire" || licenseForm.acquisition_date) && (
              <div>
                <div className="mb-3">
                  <label className="form-label">License Acquisition Date</label>
                  <input
                    type="date"
                    name="acquisition_date"
                    className="form-control"
                    onChange={handleDate("acquisition_date")}
                    disabled={!dateOnly || disabled}
                    value={
                      licenseForm.acquisition_date
                        ? (licenseForm.acquisition_date as string).slice(0, 10)
                        : ""
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">License Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    className="form-control"
                    onChange={handleDate("expiry_date")}
                    disabled={!dateOnly || disabled}
                    value={
                      licenseForm.expiry_date
                        ? (licenseForm.expiry_date as string).slice(0, 10)
                        : ""
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </ModuleContent>
      {!disabled && (
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary d-flex" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
      <ModuleSimplePopup
        setModalOpenState={setSuccessModal}
        modalOpenState={successModal}
        title="Success"
        text={
          type === "new"
            ? "New license tracking successfully created"
            : type === "acquire"
            ? "License acquisition updated successfully"
            : type === "edit"
            ? "License details edited successfully"
            : "License Renewal updated successfully"
        }
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={false}
      />
      <ModuleSimplePopup
        setModalOpenState={setMissingFields}
        modalOpenState={missingFields}
        title="Missing Fields"
        text="Please make sure that you have filled in the required fields"
        icon={SimpleIcon.Cross}
        shouldCloseOnOverlayClick={true}
      />
    </div>
  );
};

export default LicenseContainer;
