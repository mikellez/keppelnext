import formStyles from "../../../styles/formStyles.module.css"
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


export default function password(){
	const [form, setform] = useState<CMMSChangePassword>({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	})
	const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
	  };
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
            title="Same Confirmation"
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
			// validate();
		  }}
		  className="btn btn-primary"
		>
		  Yes
	  </button>
			  ]}
          />
			</ModuleContent>
			<ModuleFooter>
			<button className="btn btn-warning">
				{

				}
				cancel</button>

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
// export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {


// 	return {
// 		props: props
// 	} 

// }
