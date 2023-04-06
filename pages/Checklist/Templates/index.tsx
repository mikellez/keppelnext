import styles from "../../../styles/Checklist.module.scss";
import React, { useEffect, useState } from "react";
import Iframe from "react-iframe";
import Link from "next/link";

import {
    ModuleContent,
    ModuleDivider,
    ModuleHeader,
    ModuleMain,
    ModuleFooter,
} from "../../../components";
import { CMMSChecklist } from "../../../types/common/interfaces";
import axios from "axios";
import { useCurrentUser } from "../../../components/SWR";
import TooltipBtn from "../../../components/TooltipBtn";
import { useRouter } from "next/router";



const Templates = () => {
    const user = useCurrentUser();

    const [checklistTemplates, setChecklistTemplates] = useState<CMMSChecklist[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<CMMSChecklist>();
    const [iframeURL, setIframeURL] = useState<string>();

    const router = useRouter();

    async function getChecklistTemplates(plants: number[]) {
        return await axios({
            method: "get",
            url: `/api/checklist/templateNames?test=${JSON.stringify(plants)}`,
        })
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    useEffect(() => {
        if (user.data) {
            getChecklistTemplates(user.data.allocated_plants)
                .then((result) => {
                    setChecklistTemplates(result);
                })
                .catch((err) => console.log(err));
        }
    }, [user.data]);

    useEffect(() => {
        setIframeURL("http://localhost:3001/Checklist/Templates/" + selectedTemplate);
    }, [selectedTemplate]);

    const checklistTemplateHTML = checklistTemplates?.map((checklist) => {
        return (
            <tr 
                key={checklist.checklist_id}
                style={{
                    // borderLeft: selectedTemplate?.checklist_id == checklist.checklist_id ? "1px solid red" : "none",
                    backgroundColor: selectedTemplate?.checklist_id == checklist.checklist_id ? "#B2B2B2" : "transparent"
                }}
            >
                <th
                    onClick={() => {
                        // console.log(checklist.checklist_id);
                        setSelectedTemplate(checklist);
                    }}
                    style={{ cursor: "pointer" }}
                >
                    {" "}
                    {checklist.chl_name}
                </th>
            </tr>
        );
    });

    return (
        <ModuleMain>
            <ModuleHeader title="Checklist Templates" header="Create From Checklist Templates">
                <Link href="/Checklist" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>

            <ModuleContent includeGreyContainer>
                <div className={styles.gridContainer}>
                    <div style={{ maxHeight: "800px", overflow: "auto" }}>
                        <table className="table">
                            <thead id="templates_list">{checklistTemplateHTML}</thead>
                        </table>
                    </div>
                    {/* <div>
                        {selectedTemplate && (
                            <Iframe
                                url={iframeURL!}
                                width="100%"
                                height="800px"
                                id=""
                                className=""
                                display="block"
                                position="relative"
                                styles={{ pointerEvents: "none" }}
                            />
                        )}
                    </div> */}
                </div>
            </ModuleContent>

            <ModuleFooter>
                <TooltipBtn 
                    toolTip={false} 
                    disabled={!selectedTemplate}
                    onClick={() => {
                        router.push(`/Checklist/New?id=${selectedTemplate?.checklist_id}`)
                    }}>
                    Use Template
                </TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default Templates;

