import styles from '../styles/Login.module.css'
import React, { useState } from 'react'
import Image from 'next/image'
import instance from '../types/common/axios.config';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { SubmitHandler } from 'react-hook-form/dist/types';

type FormValues = {
	username: string;
	password: string;
}

function Login() {
	const {
		register,
		handleSubmit,
		formState
	} = useForm<FormValues>();

	const { isSubmitting, errors } = formState;
	const [errorSubmitting, setErrorSubmitting] = useState<string>("");
	const router = useRouter();

	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		console.log(data);
		await instance.post("/api/login", data)
		.then((response) => {
			setErrorSubmitting("");
			console.log("success", response);
			router.push("/Dashboard");
		}).catch((e) => {
			alert(e)
			console.log("error", e);
			let reason:string = ""
			if(e.response.status === 429)
				reason = ": Too many Login attempts. Try again later."
			if(e.response.status === 401)
				reason = ": Username and password combination does not match."
			

			setErrorSubmitting("Login Failed" + reason);
		});
	};

	return <>
		<div className={styles.loginContainer}>
			<Image src="/keppellogo.png" alt="Keppell Logo" className={styles.loginImage} width={450} height={56}/><br></br>
			<div className={styles.textContainer}>
				<h1 className={styles.headerLogin}>Login</h1>
				<form onSubmit={handleSubmit(formSubmit)}>
					<div className={`form-group ${styles.group}`}>
						<input className="form-control" type="text" placeholder="Username" {...register("username", {required: true})} />
						{errors.username && (
							<div className={styles.loginErrorInfoText}>Please enter your username</div>
						)}
					</div>
					<div className={`form-group ${styles.group}`}>
						<input className="form-control" type="password" placeholder="Password" {...register("password", {required: true})} />
						{errors.password && (
							<div className={styles.loginErrorInfoText}>Please enter your password</div>
						)}
					</div>
					<button type="submit" disabled={isSubmitting} className="btn btn-primary">
						{
							isSubmitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"
							style={{marginRight: "0.5rem"}}/>
						}
						Login
					</button>
				</form>
			</div>
		<div className={styles.loginMessageContainer} style={!(errorSubmitting && !isSubmitting) ? {visibility: "hidden"} : {}}>
			{errorSubmitting}
		</div>
		</div>
	</>
}

export default Login;