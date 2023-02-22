import React from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components';
import Link from "next/link";


const NewAsset = () => {
    return (
		<ModuleMain>
			<ModuleHeader header="Asset Management">
                <Link href="/Asset" className="btn btn-secondary">Back</Link>
            </ModuleHeader>
			<ModuleContent>

			</ModuleContent>
		</ModuleMain>
  	);
};

export default NewAsset;