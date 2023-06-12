import formStyles from "../../styles/formStyles.module.css";

import React, { use, useEffect, useState } from "react";
import instance from '../../types/common/axios.config';

import { ModuleContent, ModuleDivider, ModuleFooter } from "..";
import ImagePreview from "../Request/ImagePreview";
import RequiredIcon from "../RequiredIcon";
import PlantSelect from "../PlantSelect";
import { PropsWithChildren } from "preact/compat";
import { useRouter } from "next/router";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import Image from "next/image";
import { set } from "nprogress";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import StarRatings from 'react-star-ratings';
import Login from "../../pages/Login";





export default function FeedbackContainer(props: any) {
  const router = useRouter();

  const [form, setForm]  = useState<{
    name : string,
    comments: string,
    plantLocationID: string,
    taggedAssetID: string,
    rating: number,
    phoneNumber: string,
    email: string,
    image?: FileList

  }>(
    {
    name: "",
    comments: "",
    plantLocationID: props.requestData.plant[0].plant_id,
    taggedAssetID: props.requestData.asset[0].psa_id,
    rating: 5,
    phoneNumber: "",
    email: "",
    image: undefined
  }
  );

  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewedFile, setPreviewedFile] = useState<string>();
  const [isImage, setIsImage] = useState<boolean>(true);
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [loginModal, setLoginModal] = useState<boolean>(true);
  useEffect(() => {
    console.log(props.user)
    if (props.user){
      setForm((prevState) => {
        return {...prevState, name: "user"}
      });
    }
  }, [])


  async function submitform() {
    console.log(form)
    if (form.name == "") {
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
        {!props.user && (<div>
            <div className="form-group">
            <label className="form-label">
              <RequiredIcon />  Name
              </label>
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
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon />  Email
              </label>
            <textarea
              className="form-control"
              rows={1}
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, email: e.target.value}
                })
              }}
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon />  Contact
              </label>
            <textarea
              className="form-control"
              rows={1}
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, contact: e.target.value}
                })
              }}
            ></textarea>
          </div>
            </div>)}

            <div className="form-group">
            <label className="form-label">Rating</label>
            <div>
            <StarRatings
        rating={form.rating} // The initial rating value
        starRatedColor="orange" // Color of the selected stars
        changeRating={(newRating) => {
          setForm((prevState) => {
            return {...prevState, rating: newRating}
          })
        }}
        numberOfStars={5} // Total number of stars
        starDimension="20px" // Size of the stars
        starSpacing="2px" // Spacing between the stars
      />
      </div>
          </div>
          <div className="form-group">
            <label className="form-label">Comments</label>
            <textarea
              className="form-control"
              rows={6}
              onChange = {(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return {...prevState, comments: e.target.value}
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
      <ModuleFooter>s
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
          {!props.user && <ModuleSimplePopup
            modalOpenState={loginModal}
            setModalOpenState={setLoginModal}
            title="Login?"
            text="Please login if you have an account."
            icon={SimpleIcon.Question}
            shouldCloseOnOverlayClick={false}
            buttons={[
              <button
                  key={1}
                  onClick={() => {
                    setSubmissionModal(false);
                    localStorage.setItem("feedback",`/Guest/Asset/feedback/${props.requestData.plant[0].plant_id}/${props.requestData.asset[0].psa_id}`);
                    router.push("/Login");
                  }}
                  className="btn btn-primary"
                >
                  Login
              </button>, 
              <button
              key={1}
              onClick={() => {
                setLoginModal(false);
              }}
              className="btn btn-secondary"
              style={{backgroundColor: "#767676"}}
            >
              Continue as guest
          </button>, 
            ]}

          />}
      </ModuleFooter>
    </div>
  );
}
