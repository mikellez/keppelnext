import formStyles from "../../../styles/formStyles.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ModuleContent,
    ModuleDivider,
    ModuleHeader,
    ModuleMain,
    ModuleFooter,
} from "../../../components";
import ChecklistTemplateCreator from "../../../components/Checklist/ChecklistTemplateCreator";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSPlant, CMMSChecklist } from "../../../types/common/interfaces";
import axios from "axios";
import { useCurrentUser } from "../../../components/SWR";
import PlantSelect from "../../../components/PlantSelect";
import AssignToSelect, { AssignedUserOption } from "../../../components/Schedule/AssignToSelect";
import AssetSelect from "../../../components/Checklist/AssetSelect";
import { CheckSection } from "../../../types/common/classes";
import LoadingHourglass from "../../../components/LoadingHourglass";
import { SingleValue } from "react-select";
import TooltipBtn from "../../../components/TooltipBtn";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import RequiredIcon from "../../../components/RequiredIcon";
import ChecklistCreationForm from "../../../components/Checklist/ChecklistCreationForm";
import { ch } from "@fullcalendar/core/internal-common";

interface ChecklistPageProps {
    checklist: CMMSChecklist | null;
}

const createChecklist = async (checklist: CMMSChecklist, type: string) => {
    return await axios
        .post(`/api/checklist/${type}`, { checklist })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const editChecklistAPI = async (checklist: CMMSChecklist, checklistId: number) => {
    return await axios
        .patch(`/api/checklist/record/${checklistId}`, { checklist })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
}

export default function ChecklistNew(props: ChecklistPageProps) {
    const [checklistData, setChecklistData] = useState<CMMSChecklist>({} as CMMSChecklist);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [sections, setSections] = useState<CheckSection[]>([]);
    const [incompleteModal, setIncompleteModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);

    const resetChecklist = () => {
        setSections([]);
    };

    const user = useCurrentUser();
    const router = useRouter();

    const submitChecklist = (checklistType: string) => {
        if (!checkInputFields(checklistType)) {
            setIncompleteModal(true);
        } else {
            setSuccessModal(true);
            createChecklist(checklistData, checklistType);
            setTimeout(() => {
                router.push("/Checklist");
            }, 1000);
        }
    };

    const updateChecklist = async () => {
        if (!checkInputFields("record")) {
            setIncompleteModal(true);
        } else {
            setSuccessModal(true);
            await editChecklistAPI(checklistData, +router.query.id!)
            setTimeout(() => {
                router.push("/Checklist");
            }, 1000);
        }
    };

    const checkInputFields = (checklistType: string) => {
        switch (checklistType) {
            case "record":
                return (
                    // checklistData.assigned_user_id &&
                    checklistData.signoff_user_id &&
                    checklistData.chl_name &&
                    checklistData.chl_name != "" &&
                    checklistData.description &&
                    checklistData.description != "" &&
                    checklistData.plant_id &&
                    checklistData.linkedassetids &&
                    checklistData.linkedassetids != ""
                );
            case "template":
                return (
                    checklistData.signoff_user_id &&
                    checklistData.chl_name &&
                    checklistData.chl_name != "" &&
                    checklistData.description &&
                    checklistData.description != "" &&
                    checklistData.plant_id
                );
        }
    };

    useEffect(() => {
        setChecklistData((prev) => {
            return {
                ...prev,
                createdbyuser: user.data?.name as string,
                plant_id: user.data?.allocated_plants[0] as number,
            };
        });

        if (props.checklist) {
            setChecklistData((prev) => {
                return {
                    ...prev,
                    ...props.checklist,
                };
            });

            if (props.checklist.datajson.length > 0) {
                const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
                    return CheckSection.fromJSON(JSON.stringify(section));
                });
                setSections(sectionsFromJSON);
            }
        }

        setTimeout(() => {
            setIsReady(true);
        }, 1000);
    }, [user.data, props.checklist]);

    useEffect(() => {
        const json = sections.length > 0 ? sections.map((section) => section.toJSON()) : [];
        setChecklistData((prev) => {
            return {
                ...prev,
                datajson: JSON.stringify(json),
            };
        });
    }, [sections]);

    return (
        <>
            <ModuleMain>
                <ModuleHeader title="New Checklist" header="Create New Checklist">
                    <Link href="/Checklist/Templates" className="btn btn-primary">
                        Templates
                    </Link>
                    <Link href="/Checklist" className="btn btn-secondary">
                        Back
                    </Link>
                </ModuleHeader>
                {isReady ? (
                    <>
                        <ChecklistCreationForm 
                            checklistData={checklistData} 
                            setChecklistData={setChecklistData} 
                        />

                        <ModuleContent>
                            <ModuleHeader header="Add Checklists" headerSize="1.5rem">
                                <button className="btn btn-primary" onClick={resetChecklist}>
                                    Reset
                                </button>
                            </ModuleHeader>

                            <ChecklistTemplateCreator
                                sections={sections}
                                setSections={setSections}
                            />
                        </ModuleContent>

                        <ModuleFooter>
                            {router.query.action === "New" ?
                            <><TooltipBtn
                                toolTip={false}
                                style={{ backgroundColor: "#F7C04A", borderColor: "#F7C04A" }}
                                onClick={() => submitChecklist("template")}
                                disabled={successModal}
                            >
                                Save Template
                            </TooltipBtn>

                            <TooltipBtn
                                toolTip={false}
                                onClick={() => submitChecklist("record")}
                                disabled={successModal}
                            >
                                Submit
                            </TooltipBtn></> : 

                            <TooltipBtn
                                toolTip={false}
                                style={{ backgroundColor: "#F7C04A", borderColor: "#F7C04A" }}
                                onClick={updateChecklist}
                                disabled={successModal}
                            >
                                Update
                            </TooltipBtn>}

                        </ModuleFooter>
                    </>
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc((100% - 8rem) / 2)",
                            left: "50%",
                            transform: "translate(-50%,-50%)",
                        }}
                    >
                        <LoadingHourglass />
                    </div>
                )}
            </ModuleMain>

            <ModuleSimplePopup
                setModalOpenState={setSuccessModal}
                modalOpenState={successModal}
                title="Success"
                text="New checklist successfully created"
                icon={SimpleIcon.Check}
            />

            <ModuleSimplePopup
                setModalOpenState={setIncompleteModal}
                modalOpenState={incompleteModal}
                title="Missing details"
                text="Please ensure that all input fields have been filled"
                icon={SimpleIcon.Exclaim}
            />
        </>
    );
}

const getServerSideProps = createChecklistGetServerSideProps();

export { type ChecklistPageProps, getServerSideProps };
