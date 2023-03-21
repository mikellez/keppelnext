import formStyles from "../../styles/formStyles.module.css";

import React, { useEffect, useState } from "react";
import axios from "axios";

import { ModuleContent, ModuleDivider, ModuleFooter } from "../../components";
import ImagePreview from "../../components/Request/ImagePreview";

import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form/dist/types";

import {
    CMMSBaseType,
    CMMSRequestTypes,
    CMMSFaultTypes,
    CMMSUser,
    CMMSPlant,
    CMMSAsset,
    CMMSRequest,
} from "../../types/common/interfaces";
import RequiredIcon from "../../components/RequiredIcon";
import PlantSelect from "../PlantSelect";
import { PropsWithChildren } from "preact/compat";
import { useRouter } from "next/router";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";

type FormValues = {
    requestTypeID: number;
    faultTypeID: number;
    description: string;
    // plantLocationID: number;
    taggedAssetID: number;
    image: FileList;
};

async function getAssets(plant_id: number) {
    return await axios
        .get("/api/asset/" + plant_id)
        .then((response) => {
            return response.data;
        })
        .catch((e) => {
            console.log("error getting assets");
            console.log(e);
            return null;
        });
}

async function createRequest(data: FormValues, plantId: number) {
    const formData = new FormData();

    formData.append("description", data.description);
    formData.append("faultTypeID", data.faultTypeID.toString());
    formData.append("plantLocationID", plantId.toString());
    formData.append("requestTypeID", data.requestTypeID.toString());
    formData.append("taggedAssetID", data.taggedAssetID.toString());
    if (data.image.length > 0) formData.append("image", data.image[0]);

    return await axios
        .post("/api/request/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
            return response.data;
        })
        .catch((e) => {
            console.log("error creating request");
            console.log(e);
            return null;
        });
}

export interface RequestContainerProps extends PropsWithChildren {
    requestData?: RequestProps; // if not null, use data for creating new request (populate the dropdowns in create request page)
    // isAssignRequest?: boolean; // true: assign request page (prefill page), false : create new request page
    assignRequestData?: AssignRequestProps; // if not null, use data for assigning request
}

export interface RequestProps {
    user: CMMSUser;
    requestTypes: CMMSRequestTypes[];
    faultTypes: CMMSFaultTypes[];
}

export interface AssignRequestProps {
    requestData: CMMSRequest;
    priority: Priority[];
}

interface Priority {
    p_id: number;
    priority: string;
}

export default function RequestContainer(props: RequestContainerProps) {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [previewedFile, setPreviewedFile] = useState<string>();
    const [requestTypes, setRequestTypes] = useState<CMMSRequestTypes[]>(
        props.requestData?.requestTypes as CMMSRequestTypes[]
    );
    const [faultTypes, setFaultTypes] = useState<CMMSFaultTypes[]>(
        props.requestData?.faultTypes as CMMSFaultTypes[]
    );
    const [availableAssets, setAvailableAssets] = useState<CMMSAsset[]>([]);
    const [plantId, setPlantId] = useState<number>();
    const [assignRequestData, setAssignRequestData] = useState<CMMSRequest>(
        props.assignRequestData?.requestData as CMMSRequest
    );
    console.log(assignRequestData);
    const [priority, setPriority] = useState<Priority[]>(
        props.assignRequestData?.priority as Priority[]
    );

    const { register, handleSubmit, formState, control, resetField } = useForm<FormValues>();

    const { isSubmitting, errors } = formState;

    const router = useRouter();

    const formSubmit: SubmitHandler<FormValues> = async (data) => {
        if (props.requestData) {
            console.log(data);
            await createRequest(data, plantId as number);
        } else if (props.assignRequestData) {
            //update database here
            console.log("update database");
        }
        // router.push("/Request/");
    };

    useEffect(() => {
        console.log(props.assignRequestData);
        console.log(props.requestData);
        if (props.assignRequestData) {
            setPlantId(assignRequestData.plant_id);
        }
        if (!selectedFile) {
            setPreviewedFile(undefined);
            return;
        }

        const objectURL = URL.createObjectURL(selectedFile);
        setPreviewedFile(objectURL);

        return () => URL.revokeObjectURL(objectURL);
    }, [selectedFile]);

    const onFileSelected = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        setSelectedFile(input.files[0]);
    };

    const updateAssetLists = (plant_id: number) => {
        let options: CMMSAsset[] = [];

        getAssets(plant_id).then((data) => {
            if (data === null) return console.log("assets null");

            for (let asset of data)
                options.push({
                    psa_id: asset.psa_id,
                    asset_name: asset.asset_name,
                });

            setAvailableAssets(options);
        });
    };

    const plantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPlantId(parseInt(e.target.value));
        updateAssetLists(parseInt(e.target.value));
        resetField("taggedAssetID");
    };

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <ModuleContent includeGreyContainer grid>
                <div className={formStyles.halfContainer}>
                    <div className="form-group">
                        <label className="form-label">
                            <RequiredIcon /> Request Type
                        </label>
                        <select
                            className="form-control"
                            id="formControlTypeRequest"
                            {...register("requestTypeID", { required: true })}
                            disabled={props.assignRequestData ? true : false}
                        >
                            <option hidden key={0} value={""}>
                                Select request type
                            </option>
                            {!props.assignRequestData &&
                                requestTypes.map((rType: CMMSRequestTypes) => {
                                    return (
                                        <option key={rType.req_id} value={rType.req_id}>
                                            {rType.request}
                                        </option>
                                    );
                                })}
                            {props.assignRequestData && (
                                <option selected> {assignRequestData.request_name} </option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <RequiredIcon /> Fault Type
                        </label>
                        <select
                            className="form-control"
                            id="formControlTypeFault"
                            {...register("faultTypeID", { required: true })}
                            disabled={props.assignRequestData ? true : false}
                        >
                            <option hidden key={0} value={""}>
                                Select fault type
                            </option>
                            {!props.assignRequestData &&
                                faultTypes.map((fType: CMMSFaultTypes) => {
                                    return (
                                        <option key={fType.fault_id} value={fType.fault_id}>
                                            {fType.fault_type}
                                        </option>
                                    );
                                })}
                            {props.assignRequestData && (
                                <option selected> {assignRequestData.fault_name} </option>
                            )}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            id="formControlDescription"
                            rows={6}
                            {...register("description")}
                            disabled={props.assignRequestData ? true : false}
                        >
                            {props.assignRequestData ? assignRequestData.fault_description : ""}
                        </textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <RequiredIcon /> Plant Location
                        </label>

                        {props.assignRequestData ? (
                            <PlantSelect
                                onChange={plantChange}
                                disabled={props.assignRequestData ? true : false}
                                defaultPlant={props.assignRequestData.requestData.plant_id}
                            />
                        ) : (
                            <PlantSelect
                                onChange={plantChange}
                                disabled={props.assignRequestData ? true : false}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <RequiredIcon /> Tag Asset:
                        </label>
                        <select
                            className="form-control"
                            id="formControlTagAsset"
                            {...register("taggedAssetID", { required: true })}
                            disabled={props.assignRequestData ? true : false}
                        >
                            <option hidden key={0} value={""}>
                                Select asset
                            </option>
                            {!props.assignRequestData &&
                                availableAssets.map((asset: CMMSAsset) => {
                                    return (
                                        <option
                                            key={asset.psa_id + "|" + asset.asset_name}
                                            value={asset.psa_id}
                                        >
                                            {asset.asset_name}
                                        </option>
                                    );
                                })}
                            {props.assignRequestData && (
                                <option selected> {assignRequestData.asset_name} </option>
                            )}
                        </select>
                    </div>
                </div>
                <div
                    className={formStyles.halfContainer}
                    style={{
                        // gridRow: "span 3",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    {!props.assignRequestData && (
                        <div className="form-group">
                            <label className="form-label">Image</label>
                            <input
                                className="form-control"
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                id="formFile"
                                {...register("image", { onChange: onFileSelected })}
                            />
                        </div>
                    )}

                    <ImagePreview previewObjURL={previewedFile} />

                    {props.assignRequestData && (
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon />
                                Assign to:
                            </label>

                            {/* {!plantId && <select className="form-control" disabled></select>} */}
                            {/* {plantId && ( */}
                            <AssignToSelect onChange={() => {}} plantId={plantId as number} />
                            {/* )} */}
                        </div>
                    )}

                    {props.assignRequestData && (
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon />
                                Priority
                            </label>
                            <Select
                                options={priority.map((priority) => {
                                    return { value: priority.p_id, label: priority.priority };
                                })}
                            />
                        </div>
                    )}
                </div>

                {/* <div className={formStyles.halfContainer}>
                    <div className="form-group">
                        <label className="form-label">Reported By</label>
                        <input
                            className="form-control"
                            type="text"
                            disabled
                            value={props.requestData.user.role_name}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Reporter Name</label>
                        <input
                            className="form-control"
                            type="text"
                            disabled
                            value={props.requestData.user.name}
                        />
                    </div>
                </div> */}
            </ModuleContent>
            <ModuleFooter>
                {(errors.requestTypeID ||
                    errors.faultTypeID ||
                    // errors.plantLocationID ||
                    errors.taggedAssetID) && (
                    <span style={{ color: "red" }}>Please fill in all required fields</span>
                )}
                <button type="submit" className="btn btn-primary">
                    {isSubmitting && (
                        <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                            style={{ marginRight: "0.5rem" }}
                        />
                    )}
                    Submit
                </button>
            </ModuleFooter>
        </form>
    );
}