import formStyles from "../../styles/formStyles.module.css";
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
import ChecklistTemplateCreator from "../../../components/Checklist/ChecklistTemplateCreator";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSPlant, CMMSChecklist } from "../../../types/common/interfaces";
import axios from "axios";
import { useAsset, useCurrentUser } from "../../../components/SWR";

import PlantSelect from "../../../components/PlantSelect";
import AssignToSelect from "../../../components/Schedule/AssignToSelect";

import { CheckSection } from "../../../types/common/classes";
import LoadingIcon from "../../../components/LoadingIcon";
import LoadingHourglass from "../../../components/LoadingHourglass";
import TooltipBtn from "../../../components/TooltipBtn";

const Templates = () => {
    const user = useCurrentUser();

    const [checklistTemplates, setChecklistTemplates] = useState([]);
    const [templateSelected, setTemplateSelected] = useState();
    const [iframeURL, setIframeURL] = useState<string>();

    async function getChecklistTemplates(plants) {
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
        setIframeURL("http://localhost:3001/Checklist/Templates/" + templateSelected);
    }, [templateSelected]);

    const checklistTemplateHTML = checklistTemplates?.map((row) => {
        return (
            <tr key={row.checklist_id}>
                <th
                    id={row.checklist_id}
                    onClick={() => {
                        console.log(row.checklist_id);
                        setTemplateSelected(row.checklist_id);
                    }}
                    style={{ cursor: "pointer" }}
                >
                    {" "}
                    {row.chl_name}
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
                    <div>
                        {templateSelected && (
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
                    </div>
                </div>
            </ModuleContent>

            <ModuleFooter>
                <TooltipBtn toolTip={false} onClick={() => {}}>
                    Use Template
                </TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default Templates;

// export const getServerSideProps: GetServerSideProps = async (
//     context: GetServerSidePropsContext
// ) => {
//     const headers = {
//         withCredentials: true,
//         headers: {
//             Cookie: context.req.headers.cookie,
//         },
//     };
//     const getPlants = axios.get<CMMSPlant[]>("http://localhost:3001/api/getUserPlants", headers);
//     const values = await Promise.all([getPlants]);
//     const p: CMMSPlant[] = values[0].data;
//     console.log(p);
//     let props: {
//         plants: CMMSPlant[];
//     } = { plants: p };
//     return {
//         props: props,
//     };
// };
