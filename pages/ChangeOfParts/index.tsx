import React from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { CMMSChangeOfParts } from '../../types/common/interfaces';
import axios from 'axios';

interface ChangeOfPartsPageProps {
    changeOfParts: CMMSChangeOfParts[];
};

const ChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    return (
        <ModuleMain>
            <ModuleHeader header="Change of Parts"></ModuleHeader>
            <ModuleContent>
                
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const response = await axios.get("http://localhost:3001/api/changeOfParts");
    
    return {
        props: {
            changeOfParts: response.data
        }
    };
};