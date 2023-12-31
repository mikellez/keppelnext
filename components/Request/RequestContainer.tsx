/*
  EXPLANATION

  The following is a form component used for creating of new
  requests as well as the assigning of request to other users.
  Due to the many features that this one component supports, 
  it takes in the following props

  RequestData
  assignRequestData
  linkedRequestData

  - RequestData is an attribute that enables the dropdowns in
    the form, such as priority, faults and etc

  - assignRequestData and linkedRequestData are ways of idenitfy
    the current usage of the component and what exactly needs to 
    be rendered for each use case
*/

import formStyles from "../../styles/formStyles.module.css";

import React, { useEffect, useState } from "react";
import instance from "../../types/common/axios.config";

import {
  ModuleContent,
  ModuleFooter
} from "../../components";
import ImagePreview from "../../components/Request/ImagePreview";

import moment from "moment";
import { useRouter } from "next/router";
import { PropsWithChildren } from "preact/compat";
import { useForm } from "react-hook-form";
import { SubmitHandler } from "react-hook-form/dist/types";
import { TbSquareRoundedArrowRightFilled } from "react-icons/tb";
import Select from "react-select";
import RequiredIcon from "../../components/RequiredIcon";
import {
  CMMSAsset,
  CMMSFaultTypes,
  CMMSRequest,
  CMMSRequestTypes,
  CMMSUser
} from "../../types/common/interfaces";
import PlantSelect from "../PlantSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import SelectWithTooltip from "../SelectWithTooltip";

type FormValues = {
  requestTypeID: number;
  faultTypeID: number;
  description_other: string;
  description: string;
  // plantLocationID: number;
  taggedAssetID: number;
  image: FileList;
};

async function getAssets(plant_id: number) {
  return await instance
    .get("/api/asset/" + plant_id)
    .then((response) => {
      return response.data;
    })
    .catch((e) => {
      // console.log("error getting assets");
      console.log(e);
      return null;
    });
}

async function createRequest(
  data: FormValues,
  plantId: number,
  linkedRequestId?: string,
  priority?: CMMSRequestPriority,
  assignedUser?: AssignedUserOption
) {
  const formData = new FormData();

  formData.append("description", data.description);
  formData.append("faultTypeID", data.faultTypeID.toString());
  formData.append("plantLocationID", plantId.toString());
  formData.append("requestTypeID", data.requestTypeID.toString());
  formData.append("taggedAssetID", data.taggedAssetID.toString());
  formData.append("description_other", data.description_other);
  if(priority != undefined) {
    formData.append("priority", priority?.p_id);
  }
  if(assignedUser != undefined) {
    formData.append("assignedUser", assignedUser?.value);
  }

  // console.log("data", data);
  if (data.image.length > 0) formData.append("image", data.image[0]);
  if (linkedRequestId) formData.append("linkedRequestId", linkedRequestId);

  // console.log("formData", formData);

  return await instance
    .post("/api/request/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      return response.data;
    })
    .catch((e) => {
      // console.log("error creating request");
      console.log(e);
      return null;
    });
}

async function updateRequest(
  id: string,
  priority: CMMSRequestPriority,
  assignedUser: AssignedUserOption
) {
  return await instance({
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
  windowWidth?: number;
  requestData?: RequestProps; // if not null, use data for creating new request (populate the dropdowns in create request page)
  // isAssignRequest?: boolean; // true: assign request page (prefill page), false : create new request page
  assignRequestData?: AssignRequestProps; // if not null, use data for assigning request
  linkedRequestData?: CMMSRequest;
  isNotAssign: boolean;
}

export interface RequestProps {
  user: CMMSUser;
  requestTypes: CMMSRequestTypes[];
  faultTypes: CMMSFaultTypes[];
  priority: CMMSRequestPriority[];
  assigned_user_id: number;
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
  const [isImage, setIsImage] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewedFile, setPreviewedFile] = useState<string>();
  const requestTypes = props.requestData?.requestTypes as CMMSRequestTypes[];
  const faultTypes = props.requestData?.faultTypes as CMMSFaultTypes[];
  const [availableAssets, setAvailableAssets] = useState<CMMSAssetOption[]>([]);
  const [plantId, setPlantId] = useState<number>();
  const assignRequestData = props.assignRequestData?.requestData as CMMSRequest;
  const priorityList = (props.assignRequestData || props.requestData)
    ?.priority as CMMSRequestPriority[];

  const defaultValues = props.linkedRequestData
    ? {
        requestTypeID: props.linkedRequestData.req_id,
        taggedAssetID: props.linkedRequestData.psa_id,
        faultTypeID: props.linkedRequestData.fault_id,
        description:
          "[Corrective Request] " + props.linkedRequestData.fault_description,
        description_other: props.linkedRequestData.description_other,
        assignedUser: props.linkedRequestData.assigned_user_id,
        priority: props.linkedRequestData.priority_id
      }
    : {};

  // console.log("assigenReqData", assignRequestData);
  // console.log("linkedReqData", props.linkedRequestData);
  // console.log(props.requestData);
  const { register, handleSubmit, formState, control, resetField, setValue } =
    useForm<FormValues>({ defaultValues });

  const [prioritySelected, setPrioritySelected] =
    useState<CMMSRequestPriority>();
  const [assignedUsers, setAssignedUsers] = useState<AssignedUserOption>();
  const [isReady, setIsReady] = useState<boolean>();
  const [assignNotFilled, setAssignNotFilled] = useState<boolean>(false);
  const [url, setUrl] = useState("");
  const [selectedValue, setSelectedValue] = useState('');

  const { isSubmitting, errors } = formState;

  const router = useRouter();

  // console.log(props.assignRequestData);
  const formSubmit: SubmitHandler<FormValues> = async (data) => {
    // console.log(data);
    if (props.linkedRequestData) {
      // console.log("Creating corrective request");
      const { id } = router.query;
      await createRequest(data, plantId as number, id as string, prioritySelected as CMMSRequestPriority, assignedUsers as AssignedUserOption);
    } else if (props.requestData) {
      // console.log("Creating new request");
      await createRequest(data, plantId as number, "", prioritySelected as CMMSRequestPriority, assignedUsers as AssignedUserOption);
    } else if (props.assignRequestData) {
      // console.log("Assigning request");
      // console.log(prioritySelected);
      // console.log(assignedUsers);
      const { id } = router.query;
      // if priority and assign user dropdown are filled
      if (prioritySelected && assignedUsers) {
        await updateRequest(
          id as string,
          prioritySelected as CMMSRequestPriority,
          assignedUsers as AssignedUserOption
        );
      }
      // if priority and assign user dropdown are not filled
      else {
        setAssignNotFilled(true);
        return;
      }
    }
    router.push("/Request/");
  };
  useEffect(() => {
    // console.log("linked", props.linkedRequestData);
    // console.log("assigned", props.assignRequestData);
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
      setAssignedUsers({
        value: props.assignRequestData?.requestData.assigned_user_id,
        label: props.assignRequestData?.requestData.assigned_user_email,
      });
      // console.log(props.assignRequestData.requestData.uploaded_file.data)
      if (props.assignRequestData.requestData.uploaded_file) {
        // console.log("processing image");
        setPreviewedFile(
          URL.createObjectURL(
            new Blob([
              new Uint8Array(
                props.assignRequestData?.requestData.uploaded_file.data
              ),
            ])
          )
        );
      }
    }
    // setPreviewedFile(props.assignRequestData?.assigned_file)

    if (props.linkedRequestData) {
      setPlantId(props.linkedRequestData.plant_id);
      updateAssetLists(
        props.linkedRequestData.plant_id as number,
        props.linkedRequestData.psa_id
      ); // asset dropdown according to default plant
    }
    setIsReady(true);
  }, [
    props.linkedRequestData,
    assignRequestData?.plant_id,
    props.assignRequestData,
    setValue,
    props.requestData,
  ]);

  // useEffect(() => {
  //   console.log(previewedFile);
  // }, [previewedFile]);

  useEffect(() => {
    if (!props.assignRequestData) {
      if (!selectedFile) {
        setPreviewedFile(undefined);
        return;
      }

      const objectURL = URL.createObjectURL(selectedFile);
      setPreviewedFile(objectURL);

      return () => URL.revokeObjectURL(objectURL);
    }
  }, [selectedFile]);

  // useEffect(() => {
  //   const imageUrl = URL.createObjectURL(
  //     new Blob([
  //       new Uint8Array(
  //         props.assignRequestData?.requestData.uploaded_file?.data
  //       ),
  //     ])
  //   );
  //   setUrl(imageUrl);
  // }, []);

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
          selected: selected === asset.psa_id,
        });

      setAvailableAssets(options);
    });
  };
  const sortedAssets = availableAssets.sort((a, b) =>
    a.asset_name.trim().localeCompare(b.asset_name.trim())
  );
  const plantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlantId(parseInt(e.target.value));
    updateAssetLists(parseInt(e.target.value));
    resetField("taggedAssetID");
  };

  const sortedRequests = (requestTypes || []).sort((a, b) => 
    a.request.localeCompare(b.request)
  );

  const sortedFaults = (faultTypes || []).sort((a, b) => {
    if (a.fault_type === "OTHERS") {
      return 1; 
    } else if (b.fault_type === "OTHERS") {
      return -1; 
    } else {
      return a.fault_type.localeCompare(b.fault_type);
    }
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("event", e.target.options[e.target.selectedIndex]);
    setSelectedValue(e.target.options[e.target.selectedIndex].text);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <ModuleContent includeGreyContainer grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Requested From
            </label>
            <select
              className="form-control"
              id="formControlTypeRequest"
              {...register("requestTypeID", { required: true })}
              disabled={props.assignRequestData ? true : false}
            >
              <option hidden key={0} value={""}>
                Select Requesting Entity
              </option>
              {!props.assignRequestData &&
                sortedRequests.map((rType: CMMSRequestTypes) => {
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
              onChange = {handleSelectChange}
            >
              <option hidden key={0} value={""}>
                Select fault type
              </option>
              {!props.assignRequestData &&
                sortedFaults.map((fType: CMMSFaultTypes) => {
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

          { 
            ( selectedValue === 'OTHERS' 
            || props.linkedRequestData?.fault_name === 'OTHERS' 
            || assignRequestData?.fault_name === 'OTHERS' 
            ) && (
              <div className="form-group">
                <label className="form-label">Specify Fault Type</label>
                <textarea
                  className="form-control"
                  id="formControlDescriptionOther"
                  rows={2}
                  {...register("description_other")}
                  disabled={props.assignRequestData ? true : false}
                  defaultValue={
                    props.assignRequestData
                      ? assignRequestData.description_other
                      : ""
                  }
                ></textarea>
              </div> )
          }
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              id="formControlDescription"
              rows={6}
              {...register("description")}
              disabled={props.assignRequestData ? true : false}
              defaultValue={
                props.assignRequestData
                  ? assignRequestData.fault_description
                  : ""
              }
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Plant Location
            </label>

            {props.assignRequestData || props.linkedRequestData ? (
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
              <RequiredIcon /> Tag Asset
            </label>
            {/* <select
              className="form-select"
              id="formControlTagAsset"
              {...register("taggedAssetID", { required: true })}
              disabled={props.assignRequestData || !plantId ? true : false}
              // defaultValue={props.linkedRequestData?.psa_id}
            >
              <option hidden key={0} value={""}>
                Select asset
              </option>
              {!props.assignRequestData &&
                sortedAssets.map((asset: CMMSAssetOption) => {
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
            </select> */}
            <SelectWithTooltip
              className="form-control"
              id="formControlTagAsset"
              {...register("taggedAssetID", { required: true })}
              isDisabled={props.assignRequestData || !plantId ? true : false}
              onChange={(value) => {
                setValue("taggedAssetID", value?.value);
              }}
              defaultValue={
                props.assignRequestData
                  ? {
                      value: props.assignRequestData.requestData.psa_id,
                      label: props.assignRequestData.requestData.asset_name,
                    }
                  : 1
              }
              options={
                props.assignRequestData
                  ? [
                      {
                        value: -1,
                        label: props.assignRequestData.requestData.asset_name,
                      },
                    ]
                  : [
                      { value: 0, label: "Select asset" },
                      ...(!props.assignRequestData &&
                        sortedAssets.map((asset: CMMSAssetOption) => ({
                          value: asset.psa_id,
                          label: asset.asset_name,
                          selected: asset.selected,
                        }))),
                    ]
              }
            />
          </div>
          {(props.linkedRequestData ||
            props.assignRequestData?.requestData.associatedrequestid) && (
            // <div className="form-group">
            //   <label className="form-label">Linked Request</label>
            //   <input
            //     className="form-control"
            //     type="text"
            //     id="formControlLinkedRequest"
            //     disabled
            //     defaultValue={props.linkedRequestData.request_id}
            //   />
            // </div>
            <div className="mt-3 d-flex align-items-center">
              <span className="me-3">
                {`Linked Request ID: ${
                  props.linkedRequestData
                    ? props.linkedRequestData.request_id
                    : props.assignRequestData?.requestData.associatedrequestid
                }`}
              </span>
              {/* <Link href={`/Request/View/${props.linkedRequestData!.request_id}`}>
              </Link> */}
              <TbSquareRoundedArrowRightFilled
                size={22}
                color="#c70f2b"
                cursor="pointer"
                title={"See this request"}
                onClick={() =>
                  router.push(
                    `/Request/View/${
                      props.linkedRequestData
                        ? props.linkedRequestData.request_id
                        : props.assignRequestData?.requestData
                            .associatedrequestid
                    }`
                  )
                }
              />
            </div>
          )}
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
              <div>
                <label className="form-label"><RequiredIcon /> Fault Image</label>
                <input
                  className="form-control"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  id="formFile"
                  // onChange={(e) => {
                  //   // console.log(e.target.files![0]);
                  //   setIsImage(false);
                  //   setSelectedFile(e.target.files!);
                  //   console.log(e.target.files![0]);
                  // }}
                  {...register("image", { onChange: onFileSelected })}
                />
              </div>
            </div>
          )}
          {/* {previewedFile?.toString()} */}
          {previewedFile && (
            <div>
              {props.assignRequestData && (
                <label className="form-label mb-0">Fault Image</label>
              )}
              <div
                className={`${formStyles.imageClick} form-group mt-0`}
                // onClick={() => setIsImage(true)}
              >
                <ImagePreview previewObjURL={previewedFile} />
              </div>
            </div>
          )}

          {/* <ImagePreview previewObjURL={previewedFile} /> */}
          {/* {props.assignRequestData &&
          props.assignRequestData.requestData.uploaded_file?.data &&
          url ? (
            <div style={{ height: "100%", position: "relative" }}>
              <Image
                src={url}
                alt="File error"
                fill
                // width={200}
                // height={200}
              />
            </div>
          ) : (
            <ImagePreview previewObjURL={previewedFile} />
          )} */}

          {(props.assignRequestData || props.requestData) && (
            <div className="form-group">
              <label className="form-label">
                {props.assignRequestData && <RequiredIcon />} Assign to:
              </label>

              {/* {!plantId && <select className="form-control" disabled></select>} */}
              {/* {plantId && ( */}
              <AssignToSelect
                plantId={plantId as number}
                isSingle={true}
                onChange={(value) => {
                  setAssignedUsers(value as AssignedUserOption);
                }}
                defaultIds={
                  assignedUsers 
                    ? [assignedUsers.value] 
                    : []
                }
              />
            </div>
          )}

          {(props.assignRequestData || props.requestData) && (
            <div className="form-group">
              <label className="form-label">
                {props.assignRequestData && <RequiredIcon />} Priority
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
          {assignRequestData && (
            <div className="form-group">
              <label className="form-label">Created Date</label>
              <input
                type="text"
                className="form-control"
                disabled
                value={`${moment(assignRequestData.created_date).format(
                  "MMMM Do YYYY, h:mm:ss a"
                )}`}
              />
            </div>
          )}
        </div>
      </ModuleContent>
      <ModuleFooter>
        {/* new request not filled */}
        {(errors.requestTypeID ||
          errors.faultTypeID ||
          errors.taggedAssetID) && (
          <span style={{ color: "red" }}>
            Please fill in all required fields
          </span>
        )}
        {/* assign request not filled */}
        {props.assignRequestData && assignNotFilled && (
          <span style={{ color: "red" }}>
            Please assign a user and set priority for the request
          </span>
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
