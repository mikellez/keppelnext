import React from 'react';
import instance from '../../types/common/axios.config';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TooltipBtn from '../../components/TooltipBtn';
import { BsFileEarmarkPlus } from 'react-icons/bs'
import { MdPostAdd } from 'react-icons/md';
import { ModuleContent, ModuleHeader, ModuleMain } from '../../components';

const License = () => {
    return <ModuleMain>
        <ModuleHeader title="License" header="License">
        <Link href="/License/New">
          <TooltipBtn text="New Checklist">
            <MdPostAdd size={20} />
          </TooltipBtn>
        </Link>
        </ModuleHeader>
        <ModuleContent>
            hello license
        </ModuleContent>
    </ModuleMain>
}

export default License;