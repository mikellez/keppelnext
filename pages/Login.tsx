import styles from '../styles/Login.module.css'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import axios from 'axios';
import { useForm } from 'react-hook-form';
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

	const { isSubmitting } = formState;

	const formSubmit: SubmitHandler<FormValues> = (data) => {
		console.log(data);
		axios.post("/api/login", data)
		.then((response) => {
			console.log("success", response);
			window.location.href = '/';
		}).catch((e) => {
			console.log("error", e);
			alert("login fail")
		})
	};

	return <div>
		<div className={styles.loginContainer}>
			<Image src="/keppellogo.png" alt="Keppell Logo" className={styles.loginImage} width={450} height={56}/><br></br>
			<div className={styles.textContainer}>
				<h1 className={styles.headerLogin}>Login</h1>
				<form onSubmit={handleSubmit(formSubmit)}>
					<div className={`form-group ${styles.group}`}>
						<input className="form-control" type="text" placeholder="Username" {...register("username")} />
					</div>
					<div className={`form-group ${styles.group}`}>
						<input className="form-control" type="password" placeholder="Password" {...register("password")} />
					</div>
					<button type="submit" disabled={isSubmitting} className="btn btn-warning">Login</button>
				</form>
			</div>
		</div>
	</div>
}

export default Login;