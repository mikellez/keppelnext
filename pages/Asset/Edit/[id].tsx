import React, { useEffect, useState } from "react";
import formStyles from "../../../styles/formStyles.module.css";
import instance from "../../../types/common/axios.config";
import { CMMSAssetDetails } from "../../../types/common/interfaces";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../../components/SWR";
import RequiredIcon from "../../../components/RequiredIcon";
import Link from "next/link";
import {
  ModuleContent,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../../components";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import AssetDetails from "../Details/[id]";
import HighlightChangedText from "../../../components/HighlightChangeText";
import { renderToStaticMarkup } from "react-dom/server";
import Input from "../../../components/Input";
import Diff from "diff";

interface EditAssetProps {
  header: string;
}
// get asset details query
const getAsset = async (id: number) => {
  const url = "/api/assetDetails/";
  // console.log(url + id);
  return await instance
    .get(url + id)
    .then((res) => {
      // console.log("test");
      // console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      // console.log("test1");
      // console.log(err.response);
      return err.response.status;
    });
};

export default function EditAsset(props: EditAssetProps) {
  const { userPermission } = useCurrentUser();

  const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>(
    {} as CMMSAssetDetails
  );
  const [formAssetData, setFormAssetData] = useState<CMMSAssetDetails>(
    {} as CMMSAssetDetails
  );
  const [initial, setInitial] = useState<boolean>(true);
  const router = useRouter();
  const user = useCurrentUser();

  const [testdetails, setTestDetails] = useState<any>("");
  const psa_id: string = router.query.id as string;
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [confirmModal, setconfirmModal] = useState<boolean>(false);
  const [deleteModal, setdeleteModal] = useState<boolean>(false);
  type UploadedFile = [string, string];
  const [fileraw, setfileraw] = useState<UploadedFile[]>([]);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  //Function to get value of elements upon changing
  const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAssetDetail((prevState) => {
      return {
        ...prevState,
        [e.target.name]: e.target.value,
        system_asset: e.target.options[e.target.selectedIndex].text,
      };
    });
  };

  //Function to get name of elements upon changing
  const handleForm = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    // console.log(e.target.id);
    // console.log(e.target.value);

    setFormAssetData((prevState) => {
      return { ...prevState, [e.target.id]: e.target.value };
    });
  };
  // console.log(assetDetail);

  //Function to get state of image
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const dataURL = reader.result as string;
        setImagePreview(dataURL);
        setFormAssetData({ ...formAssetData, uploaded_image: dataURL });
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
            setfileraw((prevState) => {
              // console.log(prevState);
              if (
                prevState === undefined ||
                prevState === null ||
                prevState.length === 0
              ) {
                return [...uploadedFiles];
              } else {
                return [...prevState, ...uploadedFiles];
              }
            });
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
    // console.log(postData);

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

  //deactivate funciton
  function deactivate() {
    let postData: {} = {
      psa_id: psa_id,
    };
    // console.log(postData);

    // if confirmmodal true, allow delete
    fetch("/api/asset/deactivateAsset", {
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
      description: formAssetData.asset_description
        ? formAssetData.asset_description
        : assetDetail.asset_description,
      location: formAssetData.asset_location
        ? formAssetData.asset_location
        : assetDetail.asset_location,
      brand: formAssetData.brand ? formAssetData.brand : assetDetail.brand,
      model_number: formAssetData.model_number
        ? formAssetData.model_number
        : assetDetail.model_number,
      warranty: formAssetData.warranty
        ? formAssetData.warranty
        : assetDetail.warranty,
      tech_specs: formAssetData.technical_specs
        ? formAssetData.technical_specs
        : assetDetail.technical_specs,
      manufacture_country: formAssetData.manufacture_country
        ? formAssetData.manufacture_country
        : assetDetail.manufacture_country,
      remarks: formAssetData.remarks
        ? formAssetData.remarks
        : assetDetail.remarks,
      image: formAssetData.uploaded_image
        ? formAssetData.uploaded_image
        : assetDetail.uploaded_image,
      files: JSON.stringify(fileraw),
      user_id: user.data!.id,
    };
    // console.log(postData);
    //post data to API
    instance.post("/api/asset/editAsset", postData);
    //open modal to show success
    setSubmissionModal(true);
  }

  //Function to get asset details and set image and files states **when loading page**
  useEffect(() => {
    getAsset(parseInt(psa_id as string)).then((result) => {
      // console.log(result);
      // console.log(result[0]);
      if (!result[0].system_asset_lvl5) {
        // console.log(11);
        setAssetDetail({
          ...result[0],
          system_asset_lvl5: result[0].asset_name,
          asset_name: "",
        });
        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      } else if (!result[0].system_asset_lvl6) {
        // console.log(22);
        setAssetDetail({
          ...result[0],
          system_asset_lvl6: result[0].asset_name,
          asset_name: "",
        });

        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      } else if (!result[0].system_asset_lvl7) {
        // console.log(33);
        setAssetDetail({
          ...result[0],
          system_asset_lvl7: result[0].asset_name,
          asset_name: "",
        });
        setImagePreview(result[0].uploaded_image);
        setfileraw(result[0].uploaded_files);
      } else {
        setAssetDetail({
          ...result[0],
        });
      }
    });
  }, []);

  // console.log(assetDetail, 1);
  // console.log(assetDetail.plant_name, 2);
  //function TO MAP file name and value to variables
  var filename = [""];
  var filevalue = [""];
  if (fileraw !== undefined && fileraw !== null && fileraw.length > 0) {
    filename = fileraw.map((file) => file[0]);
    filevalue = fileraw.map((file) => file[1]);
  }

  const filesToDownload = filevalue.map((file, index) => {
    return (
      <tr key={index}>
        <Link href={file} download={filename[index]}>
          {filename[index]}
        </Link>
      </tr>
    );
  });

  useEffect(() => {
    if (initial && assetDetail) {
      setFormAssetData(assetDetail);
      setInitial(false);
      // console.log("data is in" + formAssetData);
    }
  }, [assetDetail.asset_description]);

  useEffect(() => {
    // console.log(formAssetData);
  }, [formAssetData]);

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
            <Input
              className="form-control"
              inputId="asset_description"
              placeholder="Enter Description"
              value={assetDetail.asset_description}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Location</label>
            <Input
              className="form-control"
              inputId="asset_location"
              placeholder="Enter Location"
              value={assetDetail.asset_location}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Brand</label>
            <Input
              className="form-control"
              inputId="brand"
              placeholder="Enter Brand"
              value={assetDetail.brand}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Number</label>
            <Input
              className="form-control"
              inputId="model_number"
              placeholder="Enter Model Number"
              value={assetDetail.model_number}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Warranty</label>
            <Input
              className="form-control"
              inputId="warranty"
              placeholder="Enter Warranty"
              value={assetDetail.warranty}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tech Specs</label>
            <Input
              className="form-control"
              inputId="technical_specs"
              placeholder="Enter Tech Specs"
              value={assetDetail.technical_specs}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Manufacture Country</label>
            <Input
              className="form-control"
              inputId="manufacture_country"
              placeholder="Enter Country"
              value={assetDetail.manufacture_country}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Remarks</label>
            <Input
              className="form-control"
              inputId="remarks"
              placeholder="Enter Remarks"
              value={assetDetail.remarks}
              details={assetDetail}
              setDetails={setFormAssetData}
              // oldDetails={formAssetData}
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
          shouldCloseOnOverlayClick={true}
          buttons={
            <button
              onClick={() => {
                setSubmissionModal(false);
                router.push("/Asset/Details/" + psa_id);
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
          shouldCloseOnOverlayClick={true}
          buttons={[
            <button
              key={1}
              className="btn"
              style={{ backgroundColor: "grey", color: "white" }}
              onClick={() => {
                setdeleteModal(false);
              }}
            >
              Cancel
            </button>,
            <button
              key={2}
              onClick={() => {
                //deletion();
                deactivate();
                setdeleteModal(false);
                // route back to assets
                router.push("/Asset");
              }}
              className="btn btn-primary"
            >
              Confirm
            </button>,
          ]}
          onRequestClose={() => {
            router.push("/Asset");
          }}
        />
      </ModuleContent>
      <ModuleFooter>
        { userPermission('canDeleteAsset') && <button className="btn btn-primary" onClick={handledeleteModal}>
          Delete
        </button>}
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
