import React, { useEffect, useState } from 'react';
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from '../index';
import Link from 'next/link';
import TooltipBtn from '../TooltipBtn';
import PlantSelect from '../PlantSelect';
import RequiredIcon from '../RequiredIcon';
import AssetTypeSelect from './AssetTypeSelect';
import SystemSelect from './SystemSelect';
import SystemAsset from './SelectSystemAsset';
import axios from 'axios';

interface AssetFormTemplateProps {
    header: string;
}

export default function AssetFormTemplate(props: AssetFormTemplateProps) {
	const [systemId, setSystemId] = useState<string>('0');

	function systemSelectChangeHandler(e: React.ChangeEvent<HTMLSelectElement>) {
		console.log(e.target.value)
		setSystemId(e.target.value)
	}

    return (
        <ModuleMain>
				<ModuleHeader header={props.header}>
            </ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div>
					<label className='form-label'>
						<RequiredIcon /> Select Plant
					</label>
					<PlantSelect onChange={() => {}} />
                    <label className='form-label'>
						<RequiredIcon /> Select System
					</label>
                    <SystemSelect onChange={systemSelectChangeHandler} />
					<label className='form-label'>
						<RequiredIcon /> Select System Asset
					</label>
                    <SystemAsset />
					<label className='form-label'>
						<RequiredIcon /> Select Asset Type
					</label>
                    <AssetTypeSelect />
				</div>
			</ModuleContent>
			<ModuleFooter>
				<Link href="/Asset" className="btn btn-secondary">Back</Link>
				<TooltipBtn toolTip={false}>Submit</TooltipBtn>
			</ModuleFooter>
		</ModuleMain>
    );
};

