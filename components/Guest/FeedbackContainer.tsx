import formStyles from "../../styles/formStyles.module.css";

import React, { use, useEffect, useState } from "react";
import instance from "../../types/common/axios.config";

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
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import StarRatings from "react-star-ratings";
import Login from "../../pages/Login";
import { userAgent } from "next/server";

const FeedbackContainer = (props: any) => {
  const router = useRouter();

  const [form, setForm] = useState<{
    name: string;
    comments: string;
    plantID: string;
    taggedLocID: string;
    rating: number;
    contact: {
      telegram: number;
      whatsapp: number;
      number: string;
    };
    email: string;
    image?: string;
  }>({
    name: "",
    comments: "",
    plantID: props.requestData.plantLoc.plant_id,
    taggedLocID: props.requestData.plantLoc.id,
    rating: 5,
    contact: { telegram: 0, whatsapp: 0, number: "" },
    email: "",
    image: "",
  });

  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewedFile, setPreviewedFile] = useState<string>();
  const [isImage, setIsImage] = useState<boolean>(true);
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] =
    useState<boolean>(false);
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [loginModal, setLoginModal] = useState<boolean>(true);

  useEffect(() => {
    // console.log(props.user.data);
    if (props.user.data) {
      setForm((prevState) => {
        return {
          ...prevState,
          ["name"]: props.user.data.name,
          ["email"]: props.user.data.email,
        };
      });
    }
  }, [props.user]);

  async function submitform() {
    // console.log(form);
    const emptyContactCondition =
      form.email === "" &&
      (form.contact.number === "0" ||
        (form.contact.whatsapp === 0 && form.contact.telegram === 0));
    if (
      form.name == "" ||
      form.comments == "" ||
      (!props.user.data && emptyContactCondition)
    ) {
      console.log(form);
      const emptyContactCondition =
        form.email === "" &&
        (form.contact.number === "" ||
          (form.contact.whatsapp === 0 && form.contact.telegram === 0));
      if (
        form.name == "" ||
        form.comments == "" ||
        (!props.user.data && emptyContactCondition)
      ) {
        setIsMissingDetailsModaOpen(true);
      } else {
        await instance
          .post("/api/feedback", form)
          .then((res) => {
            console.log(res);
            setSubmissionModal(true);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();

      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setPreviewedFile(reader.result as string);
        setIsImage(true);
        setForm((prevState: any) => {
          return { ...prevState, image: reader.result };
        });
      };
    }
  }, [selectedFile]);

  return (
    <div>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          {!props.user.data ? (
            <div>
              <div className="form-group">
                <label className="form-label">
                  <RequiredIcon /> Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  onChange={(e) => {
                    // console.log(e.target.value);
                    setForm((prevState) => {
                      return { ...prevState, name: e.target.value };
                    });
                  }}
                ></input>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <RequiredIcon /> Email
                </label>
                <input
                  className="form-control"
                  placeholder="Email Address"
                  onChange={(e) => {
                    // console.log(e.target.value);
                    setForm((prevState) => {
                      return { ...prevState, email: e.target.value };
                    });
                  }}
                ></input>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <RequiredIcon /> Contact
                </label>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Contact Number"
                  value={form.contact.number}
                  onChange={(e) => {
                    // console.log(e.target.value);
                    setForm((prevState: any) => {
                      return {
                        ...prevState,
                        contact: {
                          ...prevState.contact,
                          number: e.target.value,
                        },
                      };
                    });
                  }}
                />
                <div className="form-check">
                  <input
                    type="checkbox"
                    value={1}
                    name="Whatsapp"
                    className="form-check-input"
                    onChange={(e) => {
                      setForm((prevState) => {
                        return {
                          ...prevState,
                          contact: {
                            ...prevState.contact,
                            whatsapp: prevState.contact.whatsapp == 0 ? 1 : 0,
                          },
                        };
                      });
                    }}
                    // onChange={handleChange}
                  />
                  <label className="form-check-label">Whatsapp</label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    value={1}
                    name="Telegram"
                    className="form-check-input"
                    onChange={(e) => {
                      setForm((prevState) => {
                        return {
                          ...prevState,
                          contact: {
                            ...prevState.contact,
                            telegram: prevState.contact.telegram == 0 ? 1 : 0,
                          },
                        };
                      });
                    }}
                    // onChange={handleChange}
                  />
                  <label className="form-check-label">Telegram</label>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p>
                Your Name: <span className="ms-4">{form.name}</span>
              </p>
              <p>
                Email: <span className="ms-4">{form.email}</span>
              </p>
            </div>
          )}
          <ModuleDivider></ModuleDivider>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Feedback Comments
            </label>
            <textarea
              className="form-control"
              rows={6}
              onChange={(e) => {
                // console.log(e.target.value);
                setForm((prevState) => {
                  return { ...prevState, comments: e.target.value };
                });
              }}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Plant
            </label>
            <select className="form-select" disabled={true}>
              <option value={props.requestData.plantLoc.plant_id}>
                {props.requestData.plantLoc.plant_name}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Plant Location
            </label>
            <select className="form-select" disabled={true}>
              <option value={props.requestData.plantLoc.id}>
                {/* {props.requestData.asset[0].psa_id + " | " + props.requestData.asset[0].plant_asset_instrument} */}
                {props.requestData.plantLoc.location}
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
          <div className="form-group">
            <label className="form-label">Image</label>
            <input
              className="form-control"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              id="formFile"
              onChange={(e) => {
                setIsImage(false);
                setSelectedFile(e.target.files![0]);
              }}
            />
          </div>

          {isImage && previewedFile && (
            <ImagePreview previewObjURL={previewedFile} />
          )}
        </div>
      </ModuleContent>
      <ModuleFooter>
        <button type="submit" className="btn btn-primary" onClick={submitform}>
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
        {!props.user.data && (
          <ModuleSimplePopup
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
                  localStorage.setItem(
                    "feedback",
                    `/Guest/Feedback/${props.requestData.plantLoc.id}`
                  );
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
                style={{ backgroundColor: "#767676" }}
              >
                Continue as guest
              </button>,
            ]}
          />
        )}
      </ModuleFooter>
    </div>
  );
};

export default FeedbackContainer;
