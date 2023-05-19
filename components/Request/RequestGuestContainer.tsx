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

import React, { useEffect, useState } from "react";
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



export default function RequestGuestContainer(props: any) {

  const [form, setForm]  = useState<{
    request_type: string,
    fault_type: string,
    description: string
    plant: string,
    asset: string,
    image?: string

  }>(
    {
    request_type: "",
    fault_type: "",
    description: "",
    plant: props.plant,
    asset: props.asset,
    image: undefined
  }
  );

  async function submitform() {
      console.log(form);
  }
  


  return (
    <div>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Request Type
            </label>
            <select
              className="form-control"
              onChange = {(e) => {
                console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, request_type: e.target.value}
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
                console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, fault_type: e.target.value}
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
                console.log(e.target.value);
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
                <option value={props.plant}>
                  {props.plant}
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
              <option value={props.asset}> {props.asset}</option>
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
                  console.log(e.target.files);
                  setForm((prevState) => {
                    return {...prevState, image: e.target.files![0]}
                  })
                }}
              />
            </div>
          )}

          { form.image
          &&
          // (
          //   <div style={{ height: "100%", position: "relative" }}>
          //     <Image
          //       src={form.image}
          //       alt="File error"
          //       fill
          //       // width={200}
          //       // height={200}
          //     />
          //   </div>
          // ) : (
            (<ImagePreview previewObjURL={form.image} />
          )}

          {props.assignRequestData && (
            <div className="form-group">
              <label className="form-label">
                <RequiredIcon />
                Assign to:
              </label>

              {/* <AssignToSelect
                plantId={plantId as number}
                isSingle={true}
                // onChange={}
                defaultIds={[
                  props.assignRequestData.requestData.assigned_user_id,
                ]}
              /> */}
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
      </ModuleFooter>
    </div>
  );
}
