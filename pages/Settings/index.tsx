import formStyles from "../../styles/formStyles.module.css"

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
import {CMMSPlant, CMMSUserSettings } from "../../types/common/interfaces";
import { useCurrentUser } from "../../components/SWR";
import { useRouter } from "next/router";

interface AddUserProps {
	plants: CMMSPlant[];
}

export default function settings(props: AddUserProps){
    const [form, setform] = useState<CMMSUserSettings>({
		username: "",
		email: "",
		allocatedPlants: [],
			});
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
	  };
	const handleFormNumber =(
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	) => {
		setform((prevState) => {
			return { ...prevState, [e.target.name]: Number(e.target.value) };
		})
	}
    const user = useCurrentUser();
	const router = useRouter();
    console.log(user);

	

	// function validate(){
	// 	// console.log(form);
	// 	if(form.firstName == "" || form.lastName == "" || form.username == "" || form.password == "" || form.email == "" || form.roleType == 0 || form.allocatedPlants.length == 0){
	// 		setIsMissingDetailsModaOpen(true);
	// 	}
	// 	else{
	// 		submission();
	// 	}
	// }

	// async function submission(){
	// 	try { let res = await axios.post("/api/user/addUser", form);
	// 	console.log(res);
	// 	setSubmissionModal(true);

	// } catch(err){
	// 	console.log(err);
	// }
	// }
    return (
        <ModuleMain>
			<ModuleHeader header="User Settings" title="User Settings">
			</ModuleHeader>

			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Full Name
						</label>

						<div className="input-group">
							<input type="text" 
							className="form-control" 
							placeholder="First Name" 
							onChange={handleForm} 
							name="firstName"/>

							<input type="text" 
							className="form-control" 
							placeholder="Last Name" 
							onChange={handleForm} 
							name="lastName"/>
						</div>

					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Username
						</label>
						<input className="form-control" 
						type="text"
						onChange={handleForm} 
						name="username"/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Password
						</label>
                        <div>
						<button className="btn btn-primary">Change password</button>
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
						onChange={handleForm} 
						name="employeeId"/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Email
						</label>
						<input className="form-control" 
						type="email"
						onChange={handleForm}
						name="email"/>
					</div>
				</div>

				<ModuleDivider style={{gridColumn: "span 2"}}/>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Role Type
						</label>
						<select className="form-select"
						onChange={handleFormNumber}
						name="roleType">
							<option value={0} disabled hidden selected> -- Select Role -- </option>
							<option value={1}>Admin</option>
							<option value={2}>Manager</option>
							<option value={3}>Engineer</option>
							<option value={4}>Operation Specialist</option>
						</select>
					</div>
				</div>

				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Allocated Plants
						</label>
						{/* TODO style this somehow */}
						<Select classNamePrefix='form-control' 
						isMulti={true} 
						onChange={(e) => {
							console.log(e)
							setform((prevState) => {
								return { ...prevState, allocatedPlants: e.map(p => p.value) };
							})
						}}
						name="allocatedPlants"
						options={props.plants.map(p => {
							return {
								value: p.plant_id,
								label: p.plant_name
							}
						})}
						/>
					</div>
				</div>
			</ModuleContent>
			<ModuleFooter>
				<button type="submit" className="btn btn-primary">
				{
					//isSubmitting && <LoadingIcon/>

				}
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
	//   console.log(userInfo);

	let props: AddUserProps = { plants: fetchedPlants.data }
	return {
		props: props
	}
}