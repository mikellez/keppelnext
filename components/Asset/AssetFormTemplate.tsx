import React, { useEffect, useState } from 'react';
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from '../index';
import Link from 'next/link';
import TooltipBtn from '../TooltipBtn';
import PlantSelect from '../PlantSelect';
import RequiredIcon from '../RequiredIcon';
import AssetTypeSelect from './AssetTypeSelect';
import SystemSelect from './SystemSelect';
import axios from 'axios';

interface AssetFormTemplateProps {
    header: string;
}

export default function AssetFormTemplate(props: AssetFormTemplateProps) {

    return (
        <ModuleMain>
			<ModuleHeader header={props.header}>
                <Link href="/Asset" className="btn btn-secondary">Back</Link>
            </ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div>
					<label className='form-label'>
						<RequiredIcon /> Plant
					</label>
					<PlantSelect onChange={() => {}} />
                    <label className='form-label'>
						<RequiredIcon /> System
					</label>
                    <SystemSelect />
					<label className='form-label'>
						<RequiredIcon /> Asset Type
					</label>
                    <AssetTypeSelect />
				</div>
			</ModuleContent>
			<ModuleFooter>
				<TooltipBtn toolTip={false}>Submit</TooltipBtn>
			</ModuleFooter>
		</ModuleMain>
    );
};
