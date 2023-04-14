import React, { useState, useEffect } from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import TooltipBtn from "../../../components/TooltipBtn";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { ChangeOfPartsPageProps } from "..";
import COPForm, { ChangeOfPartsForm } from "../../../components/ChangeOfParts/COPForm";
import { useRouter } from "next/router";
import axios from "axios";

const editChangeOfParts = async (formData: ChangeOfPartsForm) => {
    return await axios
        .patch(``, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const EditChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [formData, setFormData] = useState<ChangeOfPartsForm>({} as ChangeOfPartsForm);
    const router = useRouter();

    const handleSubmit = () => {
        editChangeOfParts(formData)
            .then(result => {

                setTimeout(() => [
                    // router.push("/ChangeOfParts")
                ])
            })
    }
    
    useEffect(() => {
        if (props.changeOfParts[0]) {
            const cop = props.changeOfParts[0];
            const data = {
                linkedAsset: {value: cop.psaId, label: "Asset"},
                description: cop.description,
                assignedUser: {value: cop.assignedUserId, label: "User"},
                scheduledDate: new Date(cop.scheduledDate),
            }
            setFormData(data)
        }

    }, [props.changeOfParts]);

    return (
        <ModuleMain>
            <ModuleHeader header="Edit Change of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <COPForm formData={formData} setFormData={setFormData} />
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn 
                    toolTip={false}
                    onClick={handleSubmit}
                >
                    Submit
                </TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default EditChangeOfPartsPage;
export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps("Edit")