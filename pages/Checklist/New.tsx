import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'

import { ModuleContent, ModuleDivider, ModuleHeader, ModuleMain } from '../../components'

export default function ChecklistNew() {
	return (
		<ModuleMain>
			<ModuleHeader title="New Checklist" header="Create New Checklist">
				<a href="/Checklist" className="btn btn-secondary">Back</a>
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
						<select className="form-control" id="formControlLocation"/>
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
						<select className="form-control" id="formControlAssigned"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Created By</label>
						<select className="form-control" id="formControlCreated"/>
					</div>
					
					<div className="form-group">
						<label className='form-label'>Sign Off By</label>
						<select className="form-control" id="formControlSignOff"/>
					</div>
				</div>

			</ModuleContent>
			<ModuleContent>
				<ModuleHeader header="Add Checklists" headerSize="1.5rem">
					<a className="btn btn-primary">Reset</a>
				</ModuleHeader>
				checklist add stuff go here
			</ModuleContent>
		</ModuleMain>
  	)
}