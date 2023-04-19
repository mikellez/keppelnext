import formStyles from "../../styles/formStyles.module.css"

import React, {useState} from 'react';
import Select, { defaultTheme } from "react-select";
import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components';
import RequiredIcon from "../../components/RequiredIcon";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSPlant, CMMSAddUser } from "../../types/common/interfaces";
import axios from "axios";
import LoadingIcon from "../../components/LoadingIcon";

interface AddUserProps {
	plants: CMMSPlant[];
}

export default function AddUser(props: AddUserProps) {
	const [form, setform] = useState<CMMSAddUser>({
		firstName: "",
		lastName: "",
		username: "",
		password: "",
		employeeId: "",
		email: "",
		roleType: 0,
		allocatedPlants: [],
			});
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
	  };
	return (
		<ModuleMain>
			<ModuleHeader header="Add User" title="Add User">

			</ModuleHeader>

			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Full Name
						</label>

						<div className="input-group">
							<input type="text" className="form-control" placeholder="First Name"/>
							<input type="text" className="form-control" placeholder="Last Name"/>
						</div>

					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Username
						</label>
						<input className="form-control" type="text"/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Password
						</label>
						<input className="form-control" type="password"/>
					</div>

				</div>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Employee ID
						</label>
						<input className="form-control" type="text"/>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Email
						</label>
						<input className="form-control" type="email"/>
					</div>

					{/* <div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Mobile Number
						</label>
						<input className="form-control" type="text"/>
					</div> */}

				</div>

				<ModuleDivider style={{gridColumn: "span 2"}}/>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Role Type
						</label>
						<select className="form-select">
							<option value="1">Admin</option>
							<option value="2">Manager</option>
							<option value="3">Engineer</option>
							<option value="4">Operation Specialist</option>
						</select>
					</div>

				</div>

				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Allocated Plants
						</label>
						{/* TODO style this somehow */}
						<Select classNamePrefix='form-control' isMulti={true} options={props.plants.map(p => {
							return {
								value: p.plant_id,
								label: p.plant_name
							}
						})} />
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

	const fetchedPlants = await axios.get<CMMSPlant[]>("http://localhost:3001/api/plants", headers);

	let props: AddUserProps = { plants: fetchedPlants.data }

	return {
		props: props
	}
}