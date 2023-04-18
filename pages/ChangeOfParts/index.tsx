import React, { useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSChangeOfParts } from "../../types/common/interfaces";
import PlantSelect from "../../components/PlantSelect";
import axios from "axios";
import { AiOutlineEdit } from "react-icons/ai";
import { VscNewFile } from "react-icons/vsc";
import TooltipBtn from "../../components/TooltipBtn";
import COPTable from "../../components/ChangeOfParts/COPTable";
import { useRouter } from "next/router";
import { createChangeOfPartsServerSideProps } from "../../types/common/props";

export interface ChangeOfPartsPageProps {
    changeOfParts: CMMSChangeOfParts[];
}

const fetchChangeOfParts = async (plantId: number) => {
    const plant = plantId > 0 ? plantId : "";
    return await axios
        .get<CMMSChangeOfParts[]>("/api/changeOfParts/?plantId=" + plant)
        .then((res) => res.data)
        .catch((err) => console.log(err));
};

const ChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [COPData, setCOPData] = useState<CMMSChangeOfParts[]>(props.changeOfParts);
    const [selectedCOP, setSelectedCOP] = useState<CMMSChangeOfParts>({} as CMMSChangeOfParts);
    const router = useRouter();

    const updateCOPData = async (plantId: number) => {
        const newCOP = await fetchChangeOfParts(plantId);
        if (newCOP) setCOPData(newCOP);
        else setCOPData([]);
    };

    return (
        <ModuleMain>
            <ModuleHeader header="Change of Parts">
                <TooltipBtn text="Create new" onClick={() => router.push("/ChangeOfParts/New")}>
                    <VscNewFile size={22} />
                </TooltipBtn>

                <TooltipBtn
                    text="Edit"
                    disabled={(!selectedCOP.copId || selectedCOP.changedDate) as boolean}
                    onClick={() => router.push("/ChangeOfParts/Edit/" + selectedCOP.copId)}
                >
                    <AiOutlineEdit size={22} />
                </TooltipBtn>

                <PlantSelect
                    onChange={(e) => updateCOPData(+e.target.value)}
                    allPlants
                    accessControl
                />
            </ModuleHeader>
            <ModuleContent>
                <COPTable
                    changeOfParts={COPData}
                    setSelectedCOP={setSelectedCOP}
                    selectedCOP={selectedCOP}
                    isDisabledSelect={false}
                />
                {COPData.length === 0 && <p>No Change of Parts</p>}
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps();
