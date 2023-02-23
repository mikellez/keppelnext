import React from 'react';
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from '../index';
import Link from 'next/link';
import TooltipBtn from '../TooltipBtn';

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

				</div>
			</ModuleContent>
			<ModuleFooter>
				<TooltipBtn toolTip={false}>Submit</TooltipBtn>
			</ModuleFooter>
		</ModuleMain>
    );
};