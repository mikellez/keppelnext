/*import formStyles from "../../styles/formStyles.module.css"

import React, {useState, useEffect} from 'react';
import Select, { defaultTheme } from "react-select";
import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components';
import RequiredIcon from "../../components/RequiredIcon";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import LoadingIcon from "../../components/LoadingIcon";
import ModuleSimplePopup, { SimpleIcon } from "../../components/ModuleLayout/ModuleSimplePopup";
import router from "next/router";
import Link from "next/link";
import Head from "next/head";
import {CMMSPlant, CMMSUserInfo, CMMSUserSettings} from "../../types/common/interfaces";
import { useCurrentUser } from "../../components/SWR";
import { useRouter } from "next/router";

interface settingsProps {
	plants: CMMSPlant[];
	info: CMMSUserInfo;
	sortedPlants: {value: number, label: string}[];
}

export default function settings(props: settingsProps){
    const [form, setform] = useState<CMMSUserSettings>({
		username: props.info.username,
		email: props.info.email,
		userId: props.info.id,
			});
	const [isSameDetailsModalOpen, setIsSameDetailsModalOpen] = useState<boolean>(false);
	const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
	const router = useRouter();
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
	  };

	function validate(){
		console.log(form);
		if(form.username == props.info.username && form.email == props.info.email){
			setIsSameDetailsModalOpen(true);
		} else if (form.username == "" || form.email == ""){
			setIsMissingDetailsModaOpen(true);
		} else {
			submission();
		}
	}

	async function submission(){
		try { let res = await axios.post("/api/setting/update", form);
		console.log(res);
		setSubmissionModal(true);

	} catch(err){
		console.log(err);
	}
	}
    return (
        <ModuleMain>
			<ModuleHeader header="User Settings" title="User Settings">
			</ModuleHeader>

			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							Full Name
						</label>

						<div className="input-group">
							<input type="text" 
							className="form-control" 
							placeholder="First Name" 
							name="firstName"
							value={props.info.first_name}
							disabled
							/>

							<input type="text" 
							className="form-control" 
							placeholder="Last Name" 
							name="lastName"
							value={props.info.last_name}
							disabled
							/>
						</div>

					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Username
						</label>
						<input className="form-control" 
						type="text"
						onChange={handleForm} 
						name="username"
						defaultValue={props.info.username}
						/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							Password
						</label>
                        <div>
						<Link href="/Settings/Password">
						<button className="btn btn-primary">Change password</button>
						</Link>
                        </div>
					</div>

				</div>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							Employee ID
						</label>
						<input className="form-control" 
						type="text"
						name="employeeId"
						value = {props.info.employee_id}
						disabled
						/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Email
						</label>
						<input className="form-control" 
						type="email"
						onChange={handleForm}
						defaultValue={props.info.email}
						name="email"/>
					</div>
				</div>

				<ModuleDivider style={{gridColumn: "span 2"}}/>

				<div className={formStyles.halfContainer}>
				<div className="form-group">
						<label className='form-label'>
							Role Type
						</label>
						<input className="form-control" 
						type="text"
						name="roleType"
						value={["Admin","Manager","Engineer","Operation Specialist"][props.info.role_id-1]}
						disabled
						/>
					</div>
				</div>

				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
						Allocated Plants
						</label>
						<Select classNamePrefix='form-control' 
						isMulti={true} 
						name="allocatedPlants"
						defaultValue = {props.info.allocated_plants.map(p => {
								return {
									value: p,
									label: props.sortedPlants[parseInt(p)-1].label
								}
							})}
						isDisabled = {true}
						/>
					</div>
				</div>
				<ModuleSimplePopup
            modalOpenState={confirmationModal}
            setModalOpenState={setConfirmationModal}
            title="Same Confirmation"
            text="Are you sure you want to change your details?"
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
			validate();
		  }}
		  className="btn btn-primary"
		>
		  Yes
	  </button>
	  
			  ]}
          />
				<ModuleSimplePopup
            modalOpenState={isSameDetailsModalOpen}
            setModalOpenState={setIsSameDetailsModalOpen}
            title="Same Details"
            text="You did not change any details."
            icon={SimpleIcon.Cross}
          />
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
                key={2}
                onClick={() => {
                  setSubmissionModal(false);
                  router.push("/Dashboard");
                }}
                className="btn btn-primary"
              >
                Ok
            </button>
            ]}
            onRequestClose={() => {
              router.push("/Dashboard");
            }}
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
	  console.log(userInfo.data);
	  let Plants: {value: number, label: string}[] = []
	  for(let i=0;i<fetchedPlants.data.length;i++){
		Plants.push({ value: fetchedPlants.data[i].plant_id, label: fetchedPlants.data[i].plant_name });
	  }
	  Plants.sort((a,b) => a.value - b.value);
	let props: settingsProps = { plants: fetchedPlants.data, info: userInfo.data, sortedPlants: Plants}
	return {
		props: props
	}
}*/