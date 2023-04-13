import React, { useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { CMMSChangeOfParts } from '../../types/common/interfaces';
import PlantSelect from '../../components/PlantSelect';
import axios from 'axios';
import COPTable from '../../components/ChangeOfParts/COPTable';

export interface ChangeOfPartsPageProps {
    changeOfParts: CMMSChangeOfParts[];
};

const fetchChangeOfParts = async (plantId: number) => {
    const plant = plantId > 0 ? plantId : "";
    return await axios.get<CMMSChangeOfParts[]>("/api/changeOfParts/" + plant)   
        .then(res => res.data)
        .catch(err => console.log(err));
};

const ChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {

    const [COPData, setCOPData] = useState<CMMSChangeOfParts[]>(props.changeOfParts);

    const updateCOPData = async (plantId: number) => {
        const newCOP = await fetchChangeOfParts(plantId);
        if (newCOP) setCOPData(newCOP);
        else setCOPData([]);
    };

    console.log(COPData)

    return (
        <ModuleMain>
            <ModuleHeader header="Change of Parts">
                <PlantSelect 
                    onChange={(e) => updateCOPData(+e.target.value)}
                    allPlants
                    accessControl
                />
            </ModuleHeader>
            <ModuleContent>
                <COPTable changeOfParts={COPData} />
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