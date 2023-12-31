import formStyles from "../../styles/formStyles.module.css";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Select from "react-select";
import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../components";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../components/ModuleLayout/ModuleSimplePopup";
import RequiredIcon from "../../components/RequiredIcon";
import instance from "../../types/common/axios.config";
import {
  CMMSPlant,
  CMMSUserInfo,
  CMMSUserSettings,
} from "../../types/common/interfaces";

interface settingsProps {
  plants: CMMSPlant[];
  info: CMMSUserInfo;
  sortedPlants: { value: number; label: string }[];
}

export default function SettingsPage(props: settingsProps) {
  const [form, setform] = useState<CMMSUserSettings>({
    username: props.info.username,
    email: props.info.email,
    userId: props.info.id,
  });
  const [isSameDetailsModalOpen, setIsSameDetailsModalOpen] =
    useState<boolean>(false);
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] =
    useState<boolean>(false);
  const [submissionModal, setSubmissionModal] = useState<boolean>(false);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [emailModal, setEmailModal] = useState<boolean>(false);
  const [usernameModal, setUsernameModal] = useState<boolean>(false);
  const router = useRouter();
  const handleForm = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setform((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value };
    });
  };

  async function validate() {
    // console.log(form);
    if (
      form.username == props.info.username &&
      form.email == props.info.email
    ) {
      setIsSameDetailsModalOpen(true);
    } else if (form.username == "" || form.email == "") {
      setIsMissingDetailsModaOpen(true);
    } else if (
      (await validation(form.email, "/api/setting/check/email/")) == true &&
      form.email != props.info.email
    ) {
      setEmailModal(true);
    } else if (
      (await validation(form.username, "/api/setting/check/username/")) ==
        true &&
      form.username != props.info.username
    ) {
      setUsernameModal(true);
    } else {
      submission();
    }
  }
  async function validation(field: string, link: string) {
    let res = await instance.get(link + field);
    return res.data;
  }
  async function submission() {
    try {
      let res = await instance.post("/api/setting/update", form);
      // console.log(res);
      setSubmissionModal(true);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <ModuleMain>
      <ModuleHeader header="User Settings" title="User Settings"></ModuleHeader>

      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Full Name</label>

            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="First Name"
                name="firstName"
                value={props.info.first_name}
                disabled
              />

              <input
                type="text"
                className="form-control"
                placeholder="Last Name"
                name="lastName"
                value={props.info.last_name}
                disabled
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Username
            </label>
            <input
              className="form-control"
              type="text"
              onChange={handleForm}
              name="username"
              defaultValue={props.info.username}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div>
              <Link href="/Settings/Password">
                <button className="btn btn-primary">Change password</button>
              </Link>
            </div>
          </div>
        </div>

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              className="form-control"
              type="text"
              name="employeeId"
              value={props.info.employee_id}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Email
            </label>
            <input
              className="form-control"
              type="email"
              onChange={handleForm}
              defaultValue={props.info.email}
              name="email"
            />
          </div>
        </div>

        <ModuleDivider style={{ gridColumn: "span 2" }} />

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Role Type</label>
            <input
              className="form-control"
              type="text"
              name="roleType"
              value={
                ["Admin", "Manager", "Engineer", "Operation Specialist", "CMT Engineer", "CMT Specialist"][
                  props.info.role_id - 1
                ]
              }
              disabled
            />
          </div>
        </div>

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Allocated Plants</label>
            <Select
              classNamePrefix="form-control"
              isMulti={true}
              name="allocatedPlants"
              defaultValue={props.info.allocated_plants.map((p) => {
                return {
                  value: p,
                  label: props.sortedPlants[parseInt(p) - 1]?.label,
                };
              })}
              isDisabled={true}
            />
          </div>
        </div>
        <ModuleSimplePopup
          modalOpenState={confirmationModal}
          setModalOpenState={setConfirmationModal}
          title="Confirmation"
          text="Are you sure you want to change your details?"
          icon={SimpleIcon.Exclaim}
          shouldCloseOnOverlayClick={true}
          buttons={[
            <button
              key={2}
              onClick={() => {
                setConfirmationModal(false);
              }}
              className="btn btn-warning"
            >
              No
            </button>,
            <button
              key={1}
              onClick={() => {
                setConfirmationModal(false);
                validate();
              }}
              className="btn btn-primary"
            >
              Yes
            </button>,
          ]}
        />
        <ModuleSimplePopup
          modalOpenState={isSameDetailsModalOpen}
          setModalOpenState={setIsSameDetailsModalOpen}
          title="Same Details"
          text="You did not change any details."
          icon={SimpleIcon.Cross}
          shouldCloseOnOverlayClick={true}
        />
        <ModuleSimplePopup
          modalOpenState={isMissingDetailsModalOpen}
          setModalOpenState={setIsMissingDetailsModaOpen}
          title="Missing Details"
          text="Please ensure that you have filled in all the required entries."
          icon={SimpleIcon.Cross}
          shouldCloseOnOverlayClick={true}
        />
        <ModuleSimplePopup
          modalOpenState={emailModal}
          setModalOpenState={setEmailModal}
          title="Duplicate Email"
          text="Please ensure that the email you have entered is not already in use."
          icon={SimpleIcon.Cross}
          shouldCloseOnOverlayClick={true}
        />
        <ModuleSimplePopup
          modalOpenState={usernameModal}
          setModalOpenState={setUsernameModal}
          title="Duplicate Username"
          text="Please ensure that the username you have entered is not already in use."
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
              key={2}
              onClick={() => {
                setSubmissionModal(false);
                router.push("/Dashboard");
              }}
              className="btn btn-primary"
            >
              Ok
            </button>,
          ]}
          onRequestClose={() => {
            router.push("/Dashboard");
          }}
        />
      </ModuleContent>
      <ModuleFooter>
        <button
          className="btn btn-warning"
          onClick={() => {
            router.push("Dashboard");
          }}
        >
          {}
          back
        </button>

        <button
          className="btn btn-primary"
          onClick={() => {
            setConfirmationModal(true);
          }}
        >
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

  const fetchedPlants = await instance.get<CMMSPlant[]>(`/api/plants`, headers);
  const userInfo = await instance.get<any>(`/api/user`, headers);
  //   console.log(userInfo.data);
  let Plants: { value: number; label: string }[] = [];
  for (let i = 0; i < fetchedPlants.data.length; i++) {
    Plants.push({
      value: fetchedPlants.data[i].plant_id,
      label: fetchedPlants.data[i].plant_name,
    });
  }
  Plants.sort((a, b) => a.value - b.value);
  let props: settingsProps = {
    plants: fetchedPlants.data,
    info: userInfo.data,
    sortedPlants: Plants,
  };
  return {
    props: props,
  };
};
