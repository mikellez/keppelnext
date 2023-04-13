import React from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { CMMSChangeOfParts } from '../../types/common/interfaces';
import PlantSelect from '../../components/PlantSelect';
import axios from 'axios';

interface ChangeOfPartsPageProps {
    changeOfParts: CMMSChangeOfParts[];
};

const ChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    
    return (
        <ModuleMain>
            <ModuleHeader header="Change of Parts">
                <PlantSelect 
                    onChange={() => {}}
                />
            </ModuleHeader>
            <ModuleContent>
                
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {

    const headers = {
        withCredentials: true,
        headers: {
            Cookie: context.req.headers.cookie,
        },
    };

    const response = await axios.get("http://localhost:3001/api/changeOfParts", headers);
    
    return {
        props: {
            changeOfParts: response.data
        }
    };
};