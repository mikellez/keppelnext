import formStyles from "../../styles/formStyles.module.css";
import instance from '../../types/common/axios.config';
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { useState } from "react";
import {
  ModuleContent,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../components";
import AssetFormTemplate from "../../components/Asset/AssetFormTemplate";
import RequiredIcon from "../../components/RequiredIcon";
import {
  useSystemAsset,
  useSystemAssetName,
  useSubComponent1Name,
  useCurrentUser,
} from "../../components/SWR";
import {
  CMMSPlant,
  CMMSSystem,
  CMMSAssetType,
  CMMSAssetDetailsState,
} from "../../types/common/interfaces";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../components/ModuleLayout/ModuleSimplePopup";
import Link from "next/link";
import { useRouter } from "next/router";

interface NewAssetProps {
  plants: CMMSPlant[];
  systems: CMMSSystem[];
  assetTypes: CMMSAssetType[];
}

export default function NewAsset(props: NewAssetProps) {
  const user = useCurrentUser();
  const router = useRouter();
  //state of all fields to be sent to API
  const [form, setform] = useState<CMMSAssetDetailsState>({
    plant_id: 0,
    system_id: 0,
    system_asset_id: 0,
    system_asset: "",
    asset_type_id: "",
    system_asset_name: "",
    system_asset_name_form: "",
    sub_component_1: "",
    sub_component_1_form: "",
    sub_component_2: "",
    description: "",
    location: "",
    brand: "",
    model_number: "",
    warranty: "",
    tech_specs: "",
    manufacture_country: "",
    remarks: "",
    image: "",
    files: "",
  });

  //state to display popup
  //state when details are missing
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] =
    useState<boolean>(false);
  //state when multiple entries are found
  const [isMultipleEntries, setIsMultipleEntries] = useState<boolean>(false);
  //state when submission is successful
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);

  type UploadedFile = [string, string];

  const [fileraw, setfileraw] = useState<UploadedFile[]>([]);

  //API to get system asset
  const {
    data: systemAssetData,
    error: systemAssetError,
    isValidating: systemAssetIsValidating,
    mutate: systemAssetMutate,
  } = useSystemAsset(form.system_id === 0 ? null : form.system_id!);

  //API to get system asset name
  const {
    data: systemAssetNameData,
    error: systemAssetNameError,
    isValidating: systemAssetNameIsValidating,
    mutate: systemAssetNameMutate,
  } = useSystemAssetName(
    form.plant_id === 0 ? null : form.plant_id!,
    form.system_id === 0 ? null : form.system_id!,
    form.system_asset_id === 0 ? null : form.system_asset_id!
  );

  //API to get sub component 1
  const {
    data: subComponent1NameData,
    error: subComponent1NameError,
    isValidating: ssubComponent1NameIsValidating,
    mutate: subComponent1NameMutate,
  } = useSubComponent1Name(
    form.plant_id === 0 ? null : form.plant_id!,
    form.system_id === 0 ? null : form.system_id!,
    form.system_asset_id === 0 ? null : form.system_asset_id!,
    form.system_asset_name === "" ? "" : form.system_asset_name!
  );

  //Function to get value of fields
  const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setform((prevState) => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
        system_asset: e.target.options[e.target.selectedIndex].text,
      };
    });
  };

  //Function to get name of fields
  const handleForm = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setform((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataURL = reader.result as string;
        setImagePreview(dataURL);
        setform({ ...form, image: dataURL });
        console.log(form.image);
      };
    } else {
      setImagePreview(undefined);
      setform({ ...form, image: "" });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const uploadedFiles: [string, string][] = [];

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();

        reader.onload = () => {
          uploadedFiles.push([files[i].name, reader.result as string]);

          // If all files have been processed, update the state
          if (uploadedFiles.length === files.length) {
            setfileraw(uploadedFiles);
          }
        };

        reader.readAsDataURL(files[i]);
      }
    }
  }

  //Function to submit form
  function submission() {
    //check if details are missing
    if (
      form.plant_id === 0 ||
      form.system_id === 0 ||
      form.system_asset_id === 0 ||
      (form.system_asset_name === "" && form.system_asset_name_form === "")
    ) {
      setIsMissingDetailsModaOpen(true);
      //check if multiple entries are found
    } else if (
      (form.system_asset_name !== "" && form.system_asset_name_form !== "") ||
      (form.sub_component_1 !== "" && form.sub_component_1_form !== "")
    ) {
      setIsMultipleEntries(true);
    }
    //if no errors, submit form
    else {
      var system_asset_name_post_data: string;
      //check if system asset name is selected from dropdown or entered manually
      if (form.system_asset_name !== "") {
        system_asset_name_post_data = form.system_asset_name;
      } else if (form.system_asset_name_form !== "") {
        system_asset_name_post_data = form.system_asset_name_form;
      } else {
        system_asset_name_post_data = "";
      }
      var system_lvl_5_post_data: string;
      //check if sub component 1 is selected from dropdown or entered manually
      if (form.sub_component_1 !== "") {
        system_lvl_5_post_data = form.sub_component_1;
      } else if (form.sub_component_1_form !== "") {
        system_lvl_5_post_data = form.sub_component_1_form;
      } else {
        system_lvl_5_post_data = "";
      }
      //post data
      let postData: {
        plant_id: number;
        system_id: number;
        system_asset: string;
        system_asset_id: number;
        system_asset_name: string;
        system_lvl_5: string;
        user_id: number;
        [key: string]: string | number;
      } = {
        plant_id: form.plant_id,
        system_id: form.system_id,
        system_asset: form.system_asset,
        system_asset_id: form.system_asset_id,
        system_asset_name: system_asset_name_post_data,
        system_lvl_5: system_lvl_5_post_data,
        asset_type: form.asset_type_id,
        system_lvl_6: form.sub_component_2,
        description: form.description,
        location: form.location,
        brand: form.brand,
        model_number: form.model_number,
        warranty: form.warranty,
        tech_specs: form.tech_specs,
        manufacture_country: form.manufacture_country,
        remarks: form.remarks,
        image: form.image,
        files: JSON.stringify(fileraw),
        user_id: user.data!.id,
      };

      console.log(postData);
      //post data to API
      instance.post("/api/asset/addNewAsset", 
        postData
      );
      //open modal to show success
      setSubmissionModal(true);
    }
  }

  // const updateData = (
  // 	e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  //   ) => {
  // 	if (e.target.name === "image") {
  // 	  const input = e.target as HTMLInputElement;
  // 	  if (!input.files || input.files.length == 0) {
  // 		setCompletionData((prev) => {
  // 		  return {
  // 			...prev,
  // 			image: undefined,
  // 		  };
  // 		});
  // 	  } else if (input.files && input.files.length > 0) {
  // 		setCompletionData((prev) => {
  // 		  return {
  // 			...prev,
  // 			image: input.files![0],
  // 		  };
  // 		});
  // 	  }
  // 	} else {
  // 	  setCompletionData((prev) => {
  // 		return {
  // 		  ...prev,
  // 		  complete_comments: e.target.value,
  // 		};
  // 	  });
  // 	}
  //   };

  return (
    <ModuleMain>
      <ModuleHeader header="New Asset" />
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            {/* for testing */}
            {/* <div>PlantID: {form.plant_id}</div>
				<div>SystemID: {form.system_id}</div>
					<div>SystemAssetID: {form.system_asset_id}</div>
					<div>SystemAsset: {form.system_asset}</div>
					<div>Asset type: {form.asset_type_id}</div>
					<div>SystemAssetNameOption: {form.system_asset_name}</div>
					<div>SystemAssetNameForm: {form.system_asset_name_form}</div>
					<div>Sub Component-1 Option: {form.sub_component_1}</div>
					<div>Sub Component-1 Form: {form.sub_component_1_form}</div>
					<div>Sub Component-2 Form: {form.sub_component_2}</div>
					<div>Description Form: {form.description}</div>
					<div>Location Form: {form.location}</div>
					<div>Brand Form: {form.brand}</div>
					<div>Model Number Form: {form.model_number}</div>
					<div>Warranty Form: {form.warranty}</div>
					<div>Tech Specs Form: {form.tech_specs}</div>
					<div>Manufacture Country Form: {form.manufacture_country}</div>
					<div>Remarks Form: {form.remarks}</div> */}

            <label className="form-label">
              Plant
              <RequiredIcon />
            </label>
            <select
              className="form-select"
              onChange={handleForm}
              name="plant_id"
            >
              <option value="0" disabled hidden selected>
                -- Select Plant --
              </option>
              {props.plants.map((plant) => (
                <option key={plant.plant_id} value={plant.plant_id}>
                  {plant.plant_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              System
              <RequiredIcon />
            </label>
            <select
              className="form-select"
              onChange={handleForm}
              name="system_id"
            >
              <option value="0" disabled hidden selected>
                -- Select System --
              </option>
              {props.systems.map((system) => (
                <option key={system.system_id} value={system.system_id}>
                  {system.system_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              System Asset
              <RequiredIcon />
            </label>
            <select
              className="form-select"
              defaultValue={0}
              onChange={handleAssetNameSelect}
              name="system_asset_id"
            >
              <option value={0} disabled hidden>
                -- Select System Asset --
              </option>
              {systemAssetData !== undefined &&
                systemAssetData.map((systemAsset) => (
                  <option
                    key={systemAsset.system_asset_id}
                    value={systemAsset.system_asset_id}
                  >
                    {systemAsset.system_asset}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Asset Type
              <RequiredIcon />
            </label>
            <select
              className="form-select"
              defaultValue={""}
              onChange={handleForm}
              name="asset_type_id"
            >
              <option value={""}>NA</option>
              {props.assetTypes.map((assetType) => (
                <option key={assetType.asset_type} value={assetType.asset_type}>
                  {assetType.asset_type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              {" "}
              System Asset Name
              <RequiredIcon />
            </label>
            <div className="input-group">
              <select
                className="form-select"
                defaultValue={""}
                disabled={!form.asset_type_id}
                onChange={handleForm}
                name="system_asset_name"
              >
                <option value={""} disabled hidden>
                  -- Select System Asset Name--
                </option>
                {systemAssetNameData !== undefined &&
                  systemAssetNameData.map((systemAsset) => (
                    <option
                      key={systemAsset.system_asset_lvl6}
                      value={systemAsset.system_asset_lvl6}
                    >
                      {systemAsset.system_asset_lvl6}
                    </option>
                  ))}
              </select>
              <span className="input-group-text">or</span>
              <input
                type="text"
                className="form-control"
                onChange={handleForm}
                name="system_asset_name_form"
                placeholder="Enter New System Asset Name"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"> Sub-Components 1</label>
            <div className="input-group">
              <select
                className="form-select"
                defaultValue={0}
                disabled={!form.asset_type_id}
                onChange={handleForm}
                name="sub_component_1"
              >
                <option value={0} disabled hidden>
                  -- Select Sub-Components 1--
                </option>
                {subComponent1NameData !== undefined &&
                  subComponent1NameData.map((systemAsset) => (
                    <option
                      key={systemAsset.system_asset_lvl7}
                      value={systemAsset.system_asset_lvl7}
                    >
                      {systemAsset.system_asset_lvl7}
                    </option>
                  ))}
              </select>
              <span className="input-group-text">or</span>
              <input
                type="text"
                className="form-control"
                onChange={handleForm}
                name="sub_component_1_form"
                placeholder="Enter New Sub-Component"
                disabled={!form.asset_type_id}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Sub-Components 2</label>
            <div className="input-group">
              <input
                onChange={handleForm}
                name="sub_component_2_form"
                type="text"
                className="form-control"
                placeholder="Enter New Sub-Component"
                disabled={!form.asset_type_id}
              />
            </div>
          </div>
        </div>

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="description"
              placeholder="Enter Description"
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Location</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="location"
              placeholder="Enter Location"
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Brand</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="brand"
              placeholder="Enter Brand"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Number</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="model_number"
              placeholder="Enter Model Number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="warranty"
              placeholder="Enter Warranty"
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Tech Specs</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="tech_specs"
              placeholder="Enter Tech Specs"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manufacture Country</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="manufacture_country"
              placeholder="Enter Country"
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Remarks</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              name="remarks"
              placeholder="Enter Remarks"
            />
          </div>
          <div className="form-group">
            <div style={{ marginBottom: "1rem" }}>
              {form.image !== "" && (
                <img
                  src={imagePreview}
                  alt="form image"
                  style={{ width: "300px", height: "300px" }}
                />
              )}
            </div>
            {/* </img> */}

            <label className="form-label"> Image of Asset</label>
            <input
              type="file"
              className="form-control"
              accept="image/png, image/jpg, image/jpeg"
              placeholder="Select Image"
              name="image"
              onChange={handleImageChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label"> Upload documents</label>
            <input
              type="file"
              className="form-control"
              name="file"
              placeholder="Select Files"
              multiple
              onChange={handleFileChange}
            ></input>
          </div>

          <ModuleSimplePopup
            modalOpenState={isMissingDetailsModalOpen}
            setModalOpenState={setIsMissingDetailsModaOpen}
            title="Missing Details"
            text="Please ensure that you have filled in all the required entries."
            icon={SimpleIcon.Cross}
            shouldCloseOnOverlayClick={true}
          />
          <ModuleSimplePopup
            modalOpenState={isMultipleEntries}
            setModalOpenState={setIsMultipleEntries}
            title="Multiple Entries Selected"
            text="Please ensure that you only fill the dropdown or form. DO NOT choose both."
            icon={SimpleIcon.Cross}
            shouldCloseOnOverlayClick={true}
          />
          <ModuleSimplePopup
            modalOpenState={submissionModal}
            setModalOpenState={setSubmissionModal}
            title="Success!"
            text="Your inputs has been submitted!"
            icon={SimpleIcon.Check}
            shouldCloseOnOverlayClick={true}
            buttons={[
              <button
                  key={1}
                  onClick={() => {
                    setSubmissionModal(false);
                    router.reload();
                  }}
                  className="btn btn-secondary"
                >
                  Submit another asset
              </button>, 
              <button
                key={2}
                onClick={() => {
                  setSubmissionModal(false);
                  router.push("/Asset");
                }}
                className="btn btn-primary"
              >
                Ok
            </button>
            ]}
            onRequestClose={() => {
              router.push("/Asset");
            }}
          />
        </div>
      </ModuleContent>
      <ModuleFooter>
        <button className="btn btn-primary" onClick={submission}>
          Submit
        </button>
      </ModuleFooter>
    </ModuleMain>
  );
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
  // API to get plants, systems, asset types
  const plants = await instance.get<CMMSPlant[]>(
    `/api/getPlants`,
    headers
  );
  const systems = await instance.get<CMMSSystem[]>(
    `/api/asset/systems`,
    headers
  );
  const asset_type = await instance.get<CMMSAssetType[]>(
    `/api/asset/fetch_asset_types`,
    headers
  );

  if (plants.status !== 200) throw Error("Error getting plants");
  if (systems.status !== 200) throw Error("Error getting systems");
  if (asset_type.status !== 200) throw Error("Error getting asset_type");

  console.log(asset_type.data);

  let props: NewAssetProps = {
    plants: plants.data,
    systems: systems.data,
    assetTypes: asset_type.data,
  };

  return {
    props: props,
  };
};
