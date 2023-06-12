import formStyles from "../../styles/formStyles.module.css"

import React, {useState} from 'react';
import Select, { defaultTheme } from "react-select";
import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components';
import RequiredIcon from "../../components/RequiredIcon";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSPlant, CMMSAddUser } from "../../types/common/interfaces";
import instance from '../../types/common/axios.config';
import LoadingIcon from "../../components/LoadingIcon";
import ModuleSimplePopup, { SimpleIcon } from "../../components/ModuleLayout/ModuleSimplePopup";
import router from "next/router";

interface AddUserProps {
	plants: CMMSPlant[];
}

export default function AddUser(props: AddUserProps) {
	const [form, setform] = useState<CMMSAddUser>({
		firstName: "",
		lastName: "",
		username: "",
		password: "",
		employeeId: "-",
		email: "",
		roleType: 0,
		allocatedPlants: [],
			});
	const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	const handleForm = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	  ) => {
		setform((prevState) => {
		  return { ...prevState, [e.target.name]: e.target.value };
		});
				console.log(form);
	  };
	const handleFormNumber =(
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	) => {
		setform((prevState) => {
			return { ...prevState, [e.target.name]: Number(e.target.value) };
		})
		console.log(form);

	}

	function validate(){
		// console.log(form);
		if(form.firstName == "" || form.lastName == "" || form.username == "" || form.password == "" || form.email == "" || form.roleType == 0 || form.allocatedPlants.length == 0){
			setIsMissingDetailsModaOpen(true);
		}
		else{
			submission();
		}
	}

	async function submission(){
		try { let res = await instance.post("/api/user/addUser", form);
		console.log(res);
		setSubmissionModal(true);

	} catch(err){
		console.log(err);
	}


			
		
		
	}
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
						<input className="form-control" 
						type="password"
						onChange={handleForm} 
						name="password"/>
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
							<option value={4}>Admin</option>
							<option value={1}>Manager</option>
							<option value={2}>Engineer</option>
							<option value={3}>Operation Specialist</option>
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
				<ModuleSimplePopup
            modalOpenState={isMissingDetailsModalOpen}
            setModalOpenState={setIsMissingDetailsModaOpen}
            title="Missing Details"
            text="Please ensure that you have filled in all the required entries."
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
                  key={1}
                  onClick={() => {
                    setSubmissionModal(false);
                    router.reload();
                  }}
                  className="btn btn-secondary"
                >
                  Add another user
              </button>, 
              <button
                key={2}
                onClick={() => {
                  setSubmissionModal(false);
                  router.push("/User/Management");
                }}
                className="btn btn-primary"
              >
                Ok
            </button>
            ]}
            onRequestClose={() => {
              router.push("/User/Management");
            }}
          />
			</ModuleContent>
			<ModuleFooter>
				<button type="submit" className="btn btn-primary" onClick={validate}>
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

	const fetchedPlants = await instance.get<CMMSPlant[]>(`/api/plants`, headers);

	let props: AddUserProps = { plants: fetchedPlants.data }

	return {
		props: props
	}
}