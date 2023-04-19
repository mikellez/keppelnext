import React from 'react';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../components';
import Link from 'next/link';
import TooltipBtn from '../../components/TooltipBtn';
import { BsFileEarmarkPlus } from 'react-icons/bs';
import styles from './Workflow.module.scss';

const WorkflowNew = () => {
    return (
        <ModuleMain>
            <ModuleHeader header="Create New Workflow">
            </ModuleHeader>
            <ModuleContent>
                <div className="container">
                    <div className="card bg-secondary">
                        <div className="card-body">
                            <div className="p-5">
                                if &nbsp;&nbsp;
                                <select name="" id="">
                                    <option value="">-- Select Type --</option>
                                    <option value="">Fault Request</option>
                                </select>
                                &nbsp; at &nbsp;
                                <select name="" id="">
                                    <option value="">-- Select Plant Location --</option>
                                    <option value="">Woodland DCHS</option>
                                    <option value="">Biopolis</option>
                                    <option value="">Mediapolis</option>
                                    <option value="">Changi DCHS</option>
                                </select>
                                &nbsp; is a type of&nbsp;
                                <select name="" id="">
                                    <option value="">-- Select Asset Type --</option>
                                    <option value="">Cooling Tower</option>
                                    <option value="">Condensation</option>
                                    <option value="">Chw Supply Temperature Anomaly</option>
                                    <option value="">Room Temperature Anomaly</option>
                                    <option value="">Pipe Leak</option>
                                    <option value="">Customer Station Cleanliness Issue</option>
                                    <option value="">Chiller Trip</option>
                                    <option value="">Others</option>
                                </select>
                            </div>
                            <hr/>
                            <div className="p-5">
                                then &nbsp;&nbsp;
                                <select name="" id="">
                                    <option value="">-- Select Action --</option>
                                    <option value="">Assign To</option>
                                    <option value="">Send Email</option>
                                </select>
                                &nbsp; &nbsp;
                                <input type="text" placeholder="Enter Email Address" className=""/>
                                &nbsp; &nbsp;
                                <button className="btn btn-primary btn-sm">Send Email</button>
                                <div className="mt-5">
                                    <button className="btn btn-primary">Create Workflow</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModuleContent>
        </ModuleMain>
    )
}

export default WorkflowNew;