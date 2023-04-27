export default function Password() {
	return <div>what</div>
} 

/*import formStyles from "../../../styles/formStyles.module.css"
import React, {useState, useEffect} from 'react';
import Select, { defaultTheme } from "react-select";
import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../../components';
import RequiredIcon from "../../../components/RequiredIcon";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import LoadingIcon from "../../../components/LoadingIcon";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import router from "next/router";
import Link from "next/link";
import Head from "next/head";
import {CMMSChangePassword, CMMSPlant, CMMSUserInfo, CMMSUserSettings} from "../../../types/common/interfaces";
import { useCurrentUser } from "../../../components/SWR";
import { useRouter } from "next/router";

interface passwordProps {
	info: CMMSUserInfo;
}

const sendLogout = (): void => {
    axios
      .post("/api/logout")
      .then((response) => {
        console.log("success", response);
        localStorage.removeItem("staff");
        window.location.href = "/";
      })
      .catch((e) => {
        console.log("error", e);
        alert("logout fail");
      });
  };

export default function password(props: passwordProps){
	const [form, setform] = useState<CMMSChangePassword>({
		current_password: "",
		new_password: "",
		confirm_password: "",
		id : props.info.id
	})
	const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
	const [isWrongPasswordModalOpen, setIsWrongPasswordModalOpen] = useState<boolean>(false);
	const [isNotMatchModalOpen, setIsNotMatchModalOpen] = useState<boolean>(false);
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
	  };
	function validate(){
		if (form.new_password != form.confirm_password){
			setIsNotMatchModalOpen(true);
		} else {
		submission()};
	};
	async function submission(){
		try { let res = await axios.post("/api/setting/updatePassword", form);
		console.log(res);
		setSubmissionModal(true);
		setTimeout(sendLogout, 3000);

	} catch(err){
		console.log(err);
		setIsWrongPasswordModalOpen(true);
	}
	}
    return(
        <ModuleMain>
			<ModuleHeader header="Change Password" title="Change Password">
			</ModuleHeader>

			<ModuleContent includeGreyContainer grid>
			<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Current Password
						</label>
						<input className="form-control" 
						type="password"
						name="current_password"
						onChange={handleForm}
						/>
					</div>
					</div>

					<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> New Password
						</label>
						<input className="form-control" 
						type="password"
						name="new_password"
						onChange={handleForm}/>
					</div>
					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/>Confirm Password
						</label>
						<input className="form-control" 
						type="password"
						name="confirm_password"
						onChange={handleForm}/>
					</div>
					</div>
					<ModuleSimplePopup
            modalOpenState={confirmationModal}
            setModalOpenState={setConfirmationModal}
            title="Confirmation"
            text="Are you sure you want to change your password?"
            icon={SimpleIcon.Exclaim}
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
			console.log(form);
			validate();
		  }}
		  className="btn btn-primary"
		>
		  Yes
	  </button>
			  ]}
          />
		  <ModuleSimplePopup
            modalOpenState={isWrongPasswordModalOpen}
            setModalOpenState={setIsWrongPasswordModalOpen}
            title="Wrong Password"
            text="Please ensure that you have filled in the old password correctly."
            icon={SimpleIcon.Cross}
          />
		  <ModuleSimplePopup
            modalOpenState={isNotMatchModalOpen}
            setModalOpenState={setIsNotMatchModalOpen}
            title="Missing Details"
            text="Please ensure that your passwords match"
            icon={SimpleIcon.Cross}
          />
		  <ModuleSimplePopup
            modalOpenState={submissionModal}
            setModalOpenState={setSubmissionModal}
            title="Success!"
            text="Your password has been changed! Logging you out..."
            icon={SimpleIcon.Check}
            buttons={[
              <button
                key={2}
                onClick={() => {
                  sendLogout();
                }}
                className="btn btn-primary"
              >
                Ok
            </button>
            ]}
            onRequestClose={() => {
				sendLogout();
            }}
          />
			</ModuleContent>
			<ModuleFooter>
			<button className="btn btn-warning"
			onClick={() => {
				router.push("/Settings");
			}}
			>
				{

				}
				back</button>

				<button className="btn btn-primary"
				onClick={() => {
					setConfirmationModal(true);
				}}
				>
				Submit</button>
			</ModuleFooter>
		</ModuleMain>
	);
}
export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
	const headers = {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie
		}
	}
	const fetchedPlants = await axios.get<CMMSPlant[]>(`http://${process.env.SERVER}:${process.env.PORT}/api/plants`, headers);
	const userInfo = await axios.get<any>(
		`http://${process.env.SERVER}:${process.env.PORT}/api/user`,
		headers
	  );

	let props: passwordProps = {info: userInfo.data}
	return {
		props: props
	}
}
*/