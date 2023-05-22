/*
  EXPLANATION

  The following is a form component used for creating of new
  requests as well as the assigning of request to other users.
  Due to the many features that this one component supports, 
  it takes in the following props

  RequestData
  assignRequestData
  linkedRequestData

  - RequestData is an attribute that enables the dropdowns in
    the form, such as priority, faults and etc

  - assignRequestData and linkedRequestData are ways of idenitfy
    the current usage of the component and what exactly needs to 
    be rendered for each use case
*/





import formStyles from "../../styles/formStyles.module.css";

import React, { use, useEffect, useState } from "react";
import instance from '../../axios.config.js';

import { ModuleContent, ModuleDivider, ModuleFooter } from "../../components";
import ImagePreview from "../../components/Request/ImagePreview";

import { SubmitHandler } from "react-hook-form/dist/types";
import {
  CMMSBaseType,
  CMMSRequestTypes,
  CMMSFaultTypes,
  CMMSUser,
  CMMSPlant,
  CMMSAsset,
  CMMSRequest,
} from "../../types/common/interfaces";
import RequiredIcon from "../../components/RequiredIcon";
import PlantSelect from "../PlantSelect";
import { PropsWithChildren } from "preact/compat";
import { useRouter } from "next/router";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import Image from "next/image";
import { set } from "nprogress";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";



export default function RequestGuestContainer(props: any) {
  const router = useRouter();

  const [form, setForm]  = useState<{
    name : string,
    requestTypeID: string,
    faultTypeID: string,
    description: string
    plantLocationID: string,
    taggedAssetID: string,
    image?: FileList

  }>(
    {
    name: "",
    requestTypeID: "",
    faultTypeID: "",
    description: "",
    plantLocationID: props.requestData.plant[0].plant_id,
    taggedAssetID: props.requestData.asset[0].psa_id,
    image: undefined
  }
  );
  useEffect(() => {
    console.log(props.user)
    if (props.user){
      setForm((prevState) => {
        return {...prevState, name: "user"}
      })
    }
  }, [])
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewedFile, setPreviewedFile] = useState<string>();
  const [isImage, setIsImage] = useState<boolean>(true);
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);


  async function submitform() {
    console.log(form)
    if (form.requestTypeID == "" || form.faultTypeID == "" || form.name == "") {
      setIsMissingDetailsModaOpen(true);
    } else {
    const formData = new FormData();
    for (const key in form) {
      if ( key == "image" ) {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      } else{
        formData.append(key, form[key]);
      }
    }
    return await instance
    .post("/api/request/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      console.log("ni hao")
      setSubmissionModal(true);
      return response.data;
    })
    .catch((e) => {
      console.log("error creating request");
      console.log(e);
      return null;
    }); 
  }}

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
  
      reader.onload = () => {
        setPreviewedFile(reader.result as string);
        setIsImage(true);
        setForm((prevState) => {
          return {...prevState, image: selectedFile}
        })
      };
      reader.readAsDataURL(selectedFile);
    }
  }, [selectedFile]);
  


  return (
    <div>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
        {!props.user && (<div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Name
              <textarea
              className="form-control"
              rows={1}
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, name: e.target.value}
                })
              }}
            ></textarea>
            </label>
            </div>)}
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Request Type
            </label>
            <select
              className="form-control"
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, requestTypeID: e.target.value}
                })
              }}
            >
              <option hidden key={0} value={0}>
                Select request type
              </option>
              {
                props.requestData.requestTypes.map((requestType: CMMSRequestTypes) => {
                  return <option key={requestType.req_id} value={requestType.req_id}>{requestType.request}
                  </option>
              })}
            
              </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Fault Type
            </label>
            <select
              className="form-control"
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, faultTypeID: e.target.value}
                })
              }}
            >
              <option hidden key={0} value={""}>
                Select fault type
              </option>
              {
                props.requestData.faultTypes.map((faultType: CMMSFaultTypes) => {
                  return <option key={faultType.fault_id} value={faultType.fault_id}>{faultType.fault_type}
                  </option>
              })}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={6}
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, description: e.target.value}
                })
              }}
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Plant Location
            </label>
              <select className="form-select" disabled={true}
              >
                <option value={props.requestData.plant[0].plant_id}>
                  {props.requestData.plant[0].plant_name}
                </option>
              </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Tag Asset
            </label>
            <select
              className="form-select"
              disabled = {true}
            >
              <option value={props.requestData.asset[0].psa_id}> 
              {props.requestData.asset[0].psa_id + " | " + props.requestData.asset[0].plant_asset_instrument}
              </option>
            </select>

          </div>
      
        </div>
        <div
          className={formStyles.halfContainer}
          style={{
            // gridRow: "span 3",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {!props.assignRequestData && (
            <div className="form-group">
              <label className="form-label">Image</label>
              <input
                className="form-control"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                id="formFile"
                onChange={(e) => {
                  setIsImage(false);
                  // console.log(e.target.files);
                  setSelectedFile(e.target.files![0]);
                //   setForm((prevState) => {
                //     return {...prevState, image: e.target.files![0]}
                //   })
                // }
              }}
              />
            </div>
          )}

          { isImage && previewedFile && (
            <ImagePreview previewObjURL={previewedFile} />
          )}

          {props.assignRequestData && (
            <div className="form-group">
              <label className="form-label">
                <RequiredIcon />
                Assign to:
              </label>
            </div>
          )}

          {props.assignRequestData && (
            <div className="form-group">
              <label className="form-label">
                <RequiredIcon />
                Priority
              </label>
              {
                <Select
                  // options={}
                  // onChange={}
                  // defaultValue={
                
                  //  }
                  
                />
              }
            </div>
          )}
        </div>
      </ModuleContent>
      <ModuleFooter>
        <button type="submit" className="btn btn-primary"
        onClick={submitform}
        >
          {
            <span
              role="status"
              aria-hidden="true"
              style={{ marginRight: "0.5rem" }}
            />
          }
          Submit
        </button>
        <ModuleSimplePopup
            modalOpenState={isMissingDetailsModalOpen}
            setModalOpenState={setIsMissingDetailsModaOpen}
            title="Missing Details"
            text="Please ensure that you have filled in all the required entries."
            icon={SimpleIcon.Cross}
          />
          <ModuleSimplePopup
            modalOpenState={submissionModal}
            setModalOpenState={setSubmissionModal}
            title="Success!"
            text="Your inputs has been submitted!"
            icon={SimpleIcon.Check}
            buttons={[
              <button
                  key={1}
                  onClick={() => {
                    setSubmissionModal(false);
                    router.reload();
                  }}
                  className="btn btn-secondary"
                >
                  Submit another request
              </button>, 
            ]}
            onRequestClose={() => {
              router.reload();
            }}
          />
      </ModuleFooter>
    </div>
  );
}
