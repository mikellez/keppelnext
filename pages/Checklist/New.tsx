import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { ModuleContent, ModuleDivider, ModuleHeader, ModuleMain, ModuleFooter } from '../../components'

export default function ChecklistNew() {
	return (
		<ModuleMain>
			<ModuleHeader title="New Checklist" header="Create New Checklist">
				<Link href="/Checklist" className="btn btn-secondary">Back</Link>
			</ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>Checklist Name</label>
						<input type="text" className="form-control" id="formControlName"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Description</label>
						<input type="text" className="form-control" id="formControlDescription"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Plant Location</label>
						<select className="form-select" id="formControlLocation"/>
					</div>

				</div>
				<div className={formStyles.halfContainer}>
					<div className="form-group" style={{display:"flex", flexDirection:"column", height:"100%"}}>
						<label className="form-label">Linked Assets:</label>
						<select multiple className="form-control" id="formControlLinkedAssets"
							style={{display:"block", flex:1, height: "100%"}}/>
					</div>
				</div>

				<ModuleDivider style={{gridColumn: "span 2"}}/>

				<div className={formStyles.largeContainer}>
					
					<div className="form-group">
						<label className='form-label'>Assigned To</label>
						<select className="form-select" id="formControlAssigned"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Created By</label>
						<select className="form-select" id="formControlCreated"/>
					</div>
					
					<div className="form-group">
						<label className='form-label'>Sign Off By</label>
						<select className="form-select" id="formControlSignOff"/>
					</div>
				</div>

			</ModuleContent>
			<ModuleContent>
				<ModuleHeader header="Add Checklists" headerSize="1.5rem">
					<a className="btn btn-primary">Reset</a>
				</ModuleHeader>
				checklist add stuff go here
			</ModuleContent>
			<ModuleFooter>
				{/*(errors.type || errors.entries) && 
				<span style={{color: "red"}}>Please fill in all required fields</span>*/}
				<button type="submit" className="btn btn-primary">
				{
					//isSubmitting && <LoadingIcon/>
				}
				Submit</button>
			</ModuleFooter>
		</ModuleMain>
  	)
}