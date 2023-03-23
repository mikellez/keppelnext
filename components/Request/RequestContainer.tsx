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

async function createRequest(data: FormValues, plantId: number, linkedRequestId?: string) {
    const formData = new FormData();

    formData.append("description", data.description);
    formData.append("faultTypeID", data.faultTypeID.toString());
    formData.append("plantLocationID", plantId.toString());
    formData.append("requestTypeID", data.requestTypeID.toString());
    formData.append("taggedAssetID", data.taggedAssetID.toString());
    if (data.image.length > 0) formData.append("image", data.image[0]);
    if (linkedRequestId) formData.append("linkedRequestId", linkedRequestId);

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

async function updateRequest(
    id: string,
    priority: CMMSRequestPriority,
    assignedUser: AssignedUserOption
) {
    return await axios({
        method: "patch",
        url: "/api/request/" + id,
        data: {
            priority: priority,
            assignedUser: assignedUser,
        },
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });
}

export interface RequestContainerProps extends PropsWithChildren {
    requestData?: RequestProps; // if not null, use data for creating new request (populate the dropdowns in create request page)
    // isAssignRequest?: boolean; // true: assign request page (prefill page), false : create new request page
    assignRequestData?: AssignRequestProps; // if not null, use data for assigning request
    linkedRequestData?: CMMSRequest;
}

export interface RequestProps {
    user: CMMSUser;
    requestTypes: CMMSRequestTypes[];
    faultTypes: CMMSFaultTypes[];
}

export interface AssignRequestProps {
    requestData: CMMSRequest;
    priority: CMMSRequestPriority[];
}

export interface CMMSRequestPriority {
    p_id?: number;
    priority?: string;
}

interface CMMSAssetOption extends CMMSAsset {
    selected: boolean;
}

export default function RequestContainer(props: RequestContainerProps) {
    const [selectedFile, setSelectedFile] = useState<File>();
    const [previewedFile, setPreviewedFile] = useState<string>();
    const requestTypes = props.requestData?.requestTypes as CMMSRequestTypes[];
    const faultTypes = props.requestData?.faultTypes as CMMSFaultTypes[];
    const [availableAssets, setAvailableAssets] = useState<CMMSAssetOption[]>([]);
    const [plantId, setPlantId] = useState<number>();
    const assignRequestData = props.assignRequestData?.requestData as CMMSRequest;
    const priorityList = props.assignRequestData?.priority as CMMSRequestPriority[];

    const defaultValues = props.linkedRequestData ? 
    {
        requestTypeID: props.linkedRequestData.req_id,
        taggedAssetID: props.linkedRequestData.psa_id,
        faultTypeID: props.linkedRequestData.fault_id,
        description: "[Corrective Request] " + props.linkedRequestData.fault_description,
    } : {};

    const { register, handleSubmit, formState, control, resetField, setValue } =
        useForm<FormValues>({ defaultValues });

    const [prioritySelected, setPrioritySelected] = useState<CMMSRequestPriority>();
    const [assignedUsers, setAssignedUsers] = useState<AssignedUserOption>();
    const [isReady, setIsReady] = useState<boolean>();

    const { isSubmitting, errors } = formState;

    const router = useRouter();

    const formSubmit: SubmitHandler<FormValues> = async (data) => {
        // console.log(data);
        if (props.linkedRequestData) {
            // console.log("Creating corrective request");
            const { id } = router.query;
            await createRequest(data, plantId as number, id as string);
        } else if (props.requestData) {
            // console.log("Creating new request");
            await createRequest(data, plantId as number);
        } else if (props.assignRequestData) {
            // console.log("Assigning request");
            const { id } = router.query;
            await updateRequest(
                id as string,
                prioritySelected as CMMSRequestPriority,
                assignedUsers as AssignedUserOption
            );
        }
        router.push("/Request/");
    };

    useEffect(() => {
        setIsReady(false);

        if (props.assignRequestData) {
            setPlantId(assignRequestData.plant_id);
            setValue("requestTypeID", -1);
            setValue("faultTypeID", -1);
            setValue("taggedAssetID", -1);
            props.assignRequestData.priority.forEach((option) => {
                if (option.p_id == props.assignRequestData?.requestData.priority_id) {
                    setPrioritySelected(option);
                }
            });
        }
        if (props.linkedRequestData) {
            setPlantId(props.linkedRequestData.plant_id);
            updateAssetLists(props.linkedRequestData.plant_id as number, props.linkedRequestData.psa_id); // asset dropdown according to default plant
        }
        setIsReady(true);

        if (!selectedFile) {
            setPreviewedFile(undefined);
            return;
        }

        const objectURL = URL.createObjectURL(selectedFile);
        setPreviewedFile(objectURL);

        return () => URL.revokeObjectURL(objectURL);
    }, [selectedFile, props.linkedRequestData, assignRequestData?.plant_id, props.assignRequestData, setValue, props.requestData]);

    const onFileSelected = (e: React.ChangeEvent) => {
        const input = e.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            setSelectedFile(undefined);
            return;
        }

        setSelectedFile(input.files[0]);
    };

    const updateAssetLists = (plant_id: number, selected?: number) => {
        let options: CMMSAssetOption[] = [];

        getAssets(plant_id).then((data) => {
            if (data === null) return console.log("assets null");

            for (let asset of data)
                options.push({
                    psa_id: asset.psa_id,
                    asset_name: asset.asset_name,
                    selected: selected === asset.psa_id
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
                                <option value={-1} selected>
                                    {assignRequestData.request_name}
                                </option>
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
                                <option value={-1} selected>
                                    {assignRequestData.fault_name}
                                </option>
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
                            defaultValue={props.assignRequestData ? assignRequestData.fault_description : ""}
                        >
                            
                        </textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <RequiredIcon /> Plant Location
                        </label>

                        {props.assignRequestData || props.linkedRequestData? (
                            <PlantSelect
                                onChange={plantChange}
                                disabled={props.assignRequestData ? true : false}
                                defaultPlant={plantId} 
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
                            disabled={props.assignRequestData || !plantId ? true : false}
                            // defaultValue={props.linkedRequestData?.psa_id}
                        >
                            <option hidden key={0} value={""}>
                                Select asset
                            </option>
                            {!props.assignRequestData &&
                                availableAssets.map((asset: CMMSAssetOption) => {
                                    return (
                                        <option
                                            key={asset.psa_id + "|" + asset.asset_name}
                                            value={asset.psa_id}
                                            selected={asset.selected}
                                        >
                                            {asset.asset_name}
                                        </option>
                                    );
                                })}
                            {props.assignRequestData && (
                                <option value={-1}>{assignRequestData.asset_name}</option>
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
                            <AssignToSelect
                                plantId={plantId as number}
                                isSingle={true}
                                onChange={(value) => {
                                    setAssignedUsers(value as AssignedUserOption);
                                }}
                                defaultIds={[props.assignRequestData.requestData.assigned_user_id]}
                            />
                        </div>
                    )}

                    {props.assignRequestData && (
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon />
                                Priority
                            </label>
                            {isReady && (
                                <Select
                                    options={priorityList.map((priority) => {
                                        return { value: priority.p_id, label: priority.priority };
                                    })}
                                    onChange={(value) => {
                                        const priority = {
                                            p_id: value?.value,
                                            priority: value?.label,
                                        };
                                        setPrioritySelected(priority);
                                    }}
                                    defaultValue={
                                        prioritySelected
                                            ? {
                                                  value: prioritySelected?.p_id,
                                                  label: prioritySelected?.priority,
                                              }
                                            : null
                                    }
                                />
                            )}
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
