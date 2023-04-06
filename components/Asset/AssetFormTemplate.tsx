import formStyles from "../../styles/formStyles.module.css";
import React, { useEffect, useState } from "react";
import {
  ModuleMain,
  ModuleContent,
  ModuleHeader,
  ModuleFooter,
} from "../index";
import Link from "next/link";
import TooltipBtn from "../TooltipBtn";
import PlantSelect from "../PlantSelect";
import RequiredIcon from "../RequiredIcon";
import AssetTypeSelect from "./AssetTypeSelect";
import SystemSelect from "./SystemSelect";
import SystemAsset from "./SelectSystemAsset";
import axios from "axios";
import { useRouter } from "next/router";
import {
  CMMSAsset,
  CMMSAssetDetails,
  CMMSAssetDetailsState,
} from "../../types/common/interfaces";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { useCurrentUser } from "../SWR";

interface AssetFormTemplateProps {
  header: string;
}
const getAsset = async (id: number) => {
  const url = "/api/assetDetails/";
  return await axios
    .get(url + id)
    .then((res) => {
      // console.log(res.data)
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
};

export default function AssetFormTemplate(props: AssetFormTemplateProps) {
  const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>(
    {} as CMMSAssetDetails
  );

  const router = useRouter();
  const user = useCurrentUser();

  const psa_id: string = router.query.id as string;
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [confirmModal, setconfirmModal] = useState<boolean>(false);
  const [deleteModal, setdeleteModal] = useState<boolean>(false);
  type UploadedFile = [string, string];
  const [fileraw, setfileraw] = useState<UploadedFile[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  //Function to get value of fields
  const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetDetail((prevState) => {
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
    setAssetDetail((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
    console.log("&*^&^*&^");
  };
  console.log(assetDetail);

  //Function to get state of image
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataURL = reader.result as string;
        setImagePreview(dataURL);
        setAssetDetail({ ...assetDetail, uploaded_image: dataURL });
      };
    } else {
      setImagePreview(undefined);
    }
  }
  //Function to get state of files and post them to form
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
            setfileraw((prevState) => [...prevState, ...uploadedFiles]);
          }
        };

        reader.readAsDataURL(files[i]);
      }
    }
  }

  //Function to delete when pressed Confirm
  function handledeleteModal() {
    setdeleteModal(true);
  }

  //delete funciton
  function deletion() {
    let postData: {} = {
      psa_id: psa_id,
    };
    console.log(postData);

    // if confirmmodal true, allow delete
    fetch("/api/asset/deleteAsset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    //open modal to show success
  }

  function submission() {
    //if no errors, submit form
    //post data
    let postData: {
      [key: string]: string | number;
    } = {
      psa_id: psa_id,
      description: assetDetail.asset_description,
      location: assetDetail.asset_location,
      brand: assetDetail.brand,
      model_number: assetDetail.model_number,
      warranty: assetDetail.warranty,
      tech_specs: assetDetail.technical_specs,
      manufacture_country: assetDetail.manufacture_country,
      remarks: assetDetail.remarks,
      image: assetDetail.uploaded_image,
      files: JSON.stringify(fileraw),
      user_id: user.data!.id,
    };
    console.log(postData);
    //post data to API
    fetch("/api/asset/editAsset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    //open modal to show success
    setSubmissionModal(true);
  }

  //Function to get asset details and set image and files states
  useEffect(() => {
    getAsset(parseInt(psa_id as string)).then((result) => {
      console.log(result);
      if (!result[0].system_asset_lvl5) {
        setAssetDetail({
          ...result[0],
          system_asset_lvl5: result[0].asset_name,
          asset_name: "",
        });
        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      } else if (!result[0].system_asset_lvl6) {
        setAssetDetail({
          ...result[0],
          system_asset_lvl6: result[0].asset_name,
          asset_name: "",
        });

        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      } else if (!result[0].system_asset_lvl7) {
        setAssetDetail({
          ...result[0],
          system_asset_lvl7: result[0].asset_name,
          asset_name: "",
        });
        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      }
    });
  }, []);
  //function for files
  var filename = [""];
  var filevalue = [""];
  if (fileraw !== undefined && fileraw !== null) {
    filename = fileraw.map((file) => file[0]);
    filevalue = fileraw.map((file) => file[1]);
  }

  const filesToDownload = filevalue.map((file, index) => {
    return (
      <Link key={index} href={file} download>
        {filename[index]}
      </Link>
    );
  });
  return (
    <ModuleMain>
      <ModuleHeader header={props.header}></ModuleHeader>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              Plant
              <RequiredIcon />
            </label>
            <select
              className="form-control"
              disabled
              onChange={handleForm}
              name="plant_id"
            >
              <option value="{assetDetail.plant_name}" disabled hidden selected>
                {assetDetail.plant_name}
              </option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              System
              <RequiredIcon />
            </label>
            <select
              className="form-control"
              name="system_id"
              disabled
              onChange={handleForm}
            >
              <option
                value="{assetDetail.system_name}"
                disabled
                hidden
                selected
              >
                {assetDetail.system_name}
              </option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              System Asset
              <RequiredIcon />
            </label>
            <select
              className="form-control"
              name="system_asset_id"
              disabled
              onChange={handleAssetNameSelect}
            >
              <option
                value="{assetDetail.system_asset_lvl5}"
                disabled
                hidden
                selected
              >
                {assetDetail.system_asset_lvl5}
              </option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              Asset Type
              <RequiredIcon />
            </label>
            <select
              className="form-control"
              name="asset_type_id"
              disabled
              onChange={handleForm}
            >
              <option value="{assetDetail.asset_type}">
                {assetDetail.asset_type}
              </option>
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
                className="form-control"
                name="system_asset_name"
                disabled
                onChange={handleForm}
              >
                <option
                  value="{assetDetail.system_asset_lvl6}"
                  disabled
                  hidden
                  selected
                >
                  {assetDetail.system_asset_lvl6}
                </option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"> Sub-Components 1</label>
            <div className="input-group">
              <select
                className="form-control"
                name="sub_component_1"
                disabled
                onChange={handleForm}
              >
                <option
                  value="{assetDetail.system_asset_lvl7}"
                  disabled
                  hidden
                  selected
                >
                  {assetDetail.system_asset_lvl7}
                </option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Sub-Components 2</label>
            <div className="input-group">
              <select
                className="form-control"
                name="sub_component_2"
                disabled
                onChange={handleForm}
              >
                <option
                  value="{assetDetail.asset_name}"
                  disabled
                  hidden
                  selected
                >
                  {assetDetail.asset_name}
                </option>
              </select>
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
              onBlur={handleForm} name="asset_description"
              placeholder="Enter Description"
              defaultValue={assetDetail.asset_description}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Location</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="asset_location"
              placeholder="Enter Location"
              defaultValue={assetDetail.asset_location}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Brand</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="brand"
              placeholder="Enter Brand"
              defaultValue={assetDetail.brand}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Number</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="model_number"
              placeholder="Enter Model Number"
              defaultValue={assetDetail.model_number}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="warranty"
              placeholder="Enter Warranty"
              defaultValue={assetDetail.warranty}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Tech Specs</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="technical_specs"
              placeholder="Enter Tech Specs"
              defaultValue={assetDetail.technical_specs}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manufacture Country</label>
            <input
              type="text"
              className="form-control"
              onChange={handleForm}
              onBlur={handleForm} name="manufacture_country"
              placeholder="Enter Country"
              defaultValue={assetDetail.manufacture_country}
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
              defaultValue={assetDetail.remarks}
            />
          </div>
          <div className="form-group">
            <div style={{ marginBottom: "1rem" }}>
              {imagePreview !== null && imagePreview !== "" && (
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
              name="uploaded_image"
              onChange={handleImageChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label"> Upload documents</label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "0.8em",
              }}
            >
              {filesToDownload}
            </div>
            <input
              type="file"
              className="form-control"
              name="file"
              placeholder="Select Files"
              multiple
              onChange={handleFileChange}
            ></input>
          </div>
        </div>
        <ModuleSimplePopup
          modalOpenState={submissionModal}
          setModalOpenState={setSubmissionModal}
          title="Success!"
          text="Your inputs have been submitted!"
          icon={SimpleIcon.Check}
          buttons={
            <button
              onClick={() => {
                setSubmissionModal(false);
                router.push("/Asset");
              }}
              className="btn btn-primary"
            >
              Ok
            </button>
          }
          onRequestClose={() => {
            router.push("/Asset");
          }}
        />
        <ModuleSimplePopup
          modalOpenState={deleteModal}
          setModalOpenState={setdeleteModal}
          title="Irreversible Action!"
          text="The whole entity will be deleted!"
          icon={SimpleIcon.Exclaim}
          buttons2={
            <button
              onClick={() => {
                deletion();
                setdeleteModal(false);
                // route back to assets
                // router.push("/Asset")
              }}
              className="btn btn-primary"
            >
              Confirm
            </button>
          }
          buttons={
            <button
              className="btn"
              style={{ backgroundColor: "grey", color: "white" }}
              onClick={() => {
                setdeleteModal(false);
              }}
            >
              Cancel
            </button>
          }
          onRequestClose={() => {
            router.push("/Asset");
          }}
        />
      </ModuleContent>
      <ModuleFooter>
        <button className="btn btn-primary" onClick={handledeleteModal}>
          Delete
        </button>
        <Link href={{ pathname: "/Asset/Details/[id]", query: { id: psa_id } }}>
          <button
            className="btn"
            style={{ backgroundColor: "grey", color: "white" }}
          >
            Back{" "}
          </button>{" "}
        </Link>
        <button
          className="btn"
          style={{ backgroundColor: "green", color: "white" }}
          onClick={submission}
        >
          Submit
        </button>
      </ModuleFooter>
    </ModuleMain>
  );
}
