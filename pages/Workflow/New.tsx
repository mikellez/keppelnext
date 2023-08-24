import React, { useEffect, useState } from "react";
import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";
import Link from "next/link";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import PlantSelect from "../../components/PlantSelect";
import { Card, Col, Divider, Row, Space, Timeline } from "antd";
import styles from "../../styles/Workflow.module.scss";
import RequiredIcon from "../../components/RequiredIcon";
import { time } from "console";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import {
  CMMSFaultTypes,
  CMMSPlant,
  CMMSUser,
} from "../../types/common/interfaces";
import instance from "../../axios.config";
import ModuleSimplePopup from "../../components/ModuleLayout/ModuleSimplePopup";
import router from "next/router";

type Props = {
  plants: CMMSPlant[];
  faultsTypes: CMMSFaultTypes[];
  assignTo: CMMSUser[];
};

type TimelineElement = {
  id: string;
  name: string;
  content: string;
  value: number | string;
  hidden?: boolean;
  dependency?: boolean;
  dependOn?: string;
  fieldContent: FieldContent[];
};

type FieldContent = {
  type: string;
  label: string;
  required: boolean;
  options?: FieldContentOptions[];
  onchange?: () => void;
};

type FieldContentOptions = {
  label: string;
  value: number | string;
  depend?: string;
};

type FormData = {
  type: number;
  plant: number;
  faultType: number;
  action: string;
  assignTo: number;
  sendEmail: number;
};

const WorkflowNew = ({
  plants,
  faultsTypes,
  assignTo,
}: {
  plants: CMMSPlant[];
  faultsTypes: CMMSFaultTypes[];
  assignTo: CMMSUser[];
}) => {
  const timelineElements: TimelineElement[] = [
    {
      id: "type",
      name: "type",
      content: "When type is: ",
      value: 0,
      fieldContent: [
        {
          type: "select",
          label: "Please select the type of request",
          required: true,
          options: [
            { label: "Fault Request", value: 1 },
          ],
        },
      ],
    },
    {
      id: "plant-location",
      name: "plant",
      content: "Plant location at: ",
      value: 0,
      fieldContent: [
        {
          type: "select",
          label: "Please select plant location",
          required: true,
          options: plants.map((item) => ({
            label: item.plant_name,
            value: item.plant_id,
          })),
        },
      ],
    },
    {
      id: "fault-type",
      name: "faultType",
      content: "Fault type is: ",
      value: 0,
      fieldContent: [
        {
          type: "select",
          label: "Please select type of fault",
          required: true,
          options: faultsTypes.map((item) => ({
            label: item.fault_type,
            value: item.fault_id,
          })),
        },
      ],
    },
    {
      id: "action",
      name: "action",
      content: "Action: ",
      value: "",
      dependency: true,
      fieldContent: [
        {
          type: "select",
          label: "Please select action",
          required: true,
          options: [
            { label: "Assign to", value: "assign-to" },
            { label: "Email to", value: "send-email" },
          ],
        },
      ],
    },
    {
      id: "assign-to",
      name: "assignTo",
      content: "Then assign to: ",
      value: 0,
      hidden: true,
      dependOn: "action",
      fieldContent: [
        {
          type: "select",
          label: "Assign to",
          required: true,
          options: assignTo.map((item) => ({
            label: item.name + " | " + item.email,
            value: item.id,
          })),
        },
      ],
    },
    {
      id: "send-email",
      name: "sendEmail",
      content: "Then send email to:",
      value: "",
      hidden: true,
      dependOn: "action",
      fieldContent: [
        {
          type: "select",
          label: "Send email to",
          required: true,
          options: assignTo.map((item) => ({
            label: item.name + " | " + item.email,
            value: item.id,
          })),
        },
      ],
    },
  ];
  const [plant, setPlant] = useState<number>(0);
  const [showFaultRequest, setShowFaultRequest] = useState<boolean>(false);
  const [active, setActive] = useState<number>(0);
  const [timeline, setTimeline] = useState<TimelineElement[]>(timelineElements);
  const [formData, setFormData] = useState<FormData>({
    type: 0,
    plant: 0,
    faultType: 0,
    action: "",
    assignTo: 0,
    sendEmail: 0,
  } as FormData);
  const [isSaveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = (e: {
    currentTarget: { id: any; value: number; name: string };
  }) => {
    const { id, value, name } = e.currentTarget;

    let dependencyArr: number[] = [];
    let timelineElementsTemp: any[] = [];

    timelineElementsTemp = timeline.map((element) => {
      if (element.id == id) {
        element.value = value;
        if (element?.dependency) {
          dependencyArr.push(id);
        }
      }
      return element;
    });

    timelineElementsTemp = timelineElementsTemp.map((element) => {
      if (dependencyArr.includes(element.dependOn)) {
        if (element.id == value) {
          element.hidden = false;
        } else {
          element.hidden = true;
        }
      }
      return element;
    });

    // console.log(timelineElementsTemp)

    setTimeline(timelineElementsTemp);

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (e: {
    currentTarget: { id: any; value: number; name: string };
  }) => {
    const { id, value, name } = e.currentTarget;

    setTimeline(
      timeline.map((element, index) => {
        if (element.id === id) {
          element.value = value;
        }
        return element;
      })
    );

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let isValid = true;
    for (const element of timeline) {
      if (
        !element?.hidden &&
        element.fieldContent[0].required &&
        (element.value === "" || element.value === 0)
      ) {
        // console.log(element, !element?.hidden)
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      alert("Please fill in all required fields");
      return;
    }

    await instance
      .post("/api/workflow", formData)
      .then((res) => {
        // console.log(res.data)
        setSaveSuccess(true);
        setModalOpen(true);
      })
      .catch((err) => {
        // console.log(err)
        console.log("Unable to submit workflow!");
      });

    // console.log(timeline)
    // console.log(formData)

    return;
  };

  return (
    <ModuleMain>
      <ModuleHeader header="Create New Workflow">
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <ModuleContent>
        <div className="container">
          <div className="card bg-secondary">
            <div className="card-body">
              <Row>
                <Col span={8}>
                  <Space direction="vertical" size={16}>
                    <Card title="Rule Details" style={{ width: 300 }}>
                      <Timeline
                        items={timeline
                          .filter((element) => !element.hidden)
                          .map((element, index) => ({
                            children: (
                              <div
                                style={{ cursor: "pointer" }}
                                key={element.id}
                                id={element.id}
                                className={
                                  index === active ? styles.active : ""
                                }
                                onClick={() => setActive(index)}
                              >
                                {element.content} &nbsp;
                                {element.fieldContent.map((field) => {
                                  if (field.type === "select") {
                                    const selectedOption = field.options.find(
                                      (option) => {
                                        return option.value == element.value;
                                      }
                                    );
                                    return selectedOption
                                      ? selectedOption.label
                                      : "-";
                                  } else if (field.type === "text") {
                                    return element.value;
                                  }
                                  return null;
                                })}
                              </div>
                            ),
                          }))}
                      />
                    </Card>
                  </Space>
                </Col>
                <Col span={16}>
                  {timeline
                    .filter((element) => !element.hidden)
                    .map((element, index) => {
                      if (index === active) {
                        return (
                          <>
                            <div key={element.id}>
                              {element.fieldContent.map((field) => {
                                switch (field.type) {
                                  case "select":
                                    return (
                                      <div
                                        className="form-group"
                                        key={field.label}
                                      >
                                        <label className="form-label">
                                          {field.label}{" "}
                                          {field.required && <RequiredIcon />}
                                        </label>
                                        <select
                                          id={element.id}
                                          name={element.name}
                                          className="form-control"
                                          onChange={(e) =>
                                            handleSelectChange(e)
                                          }
                                          value={element.value}
                                        >
                                          <option value="">
                                            -- Select Type --
                                          </option>
                                          {field.options.map((option) => {
                                            return (
                                              <option
                                                value={option.value}
                                                key={option.value}
                                                data-depend={option?.depend}
                                              >
                                                {option.label}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>
                                    );
                                    break;

                                  case "text":
                                    return (
                                      <div
                                        className="form-group"
                                        key={field.label}
                                      >
                                        <label className="form-label">
                                          {field.label}{" "}
                                          {field.required && <RequiredIcon />}
                                        </label>
                                        <input
                                          id={element.id}
                                          name={element.name}
                                          type="text"
                                          placeholder="Enter Email Address"
                                          className="form-control"
                                          onChange={(e) => handleTextChange(e)}
                                        />
                                      </div>
                                    );
                                    break;
                                }
                              })}
                            </div>
                            {active > 0 && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setActive(--index)}
                              >
                                Back
                              </button>
                            )}
                            &nbsp; &nbsp;
                            {active <
                              timeline.filter((element) => !element.hidden)
                                .length -
                                1 && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setActive(++index)}
                              >
                                Next
                              </button>
                            )}
                            {active ==
                              timeline.filter((element) => !element.hidden)
                                .length -
                                1 && (
                              <button
                                className="btn btn-primary btn-sm flex"
                                onClick={handleSubmit}
                              >
                                Submit Workflow
                              </button>
                            )}
                          </>
                        );
                      }
                    })}
                </Col>
              </Row>
              <Divider type="vertical" />
            </div>
          </div>
        </div>
      </ModuleContent>
      <ModuleSimplePopup
        modalOpenState={isSaveSuccess}
        setModalOpenState={setSaveSuccess}
        title="Success"
        text={
          // "ID " + deleteModalID +
          "Workflow created successfully!"
        }
        icon={1}
        shouldCloseOnOverlayClick={true}
        buttons={
          <button
            onClick={() => {
              setSaveSuccess(false);
              setModalOpen(false);
              router.back();
            }}
            className="btn btn-primary"
          >
            Ok
          </button>
        }
      />
    </ModuleMain>
  );
};

export default WorkflowNew;

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };
  // API to get plants, fault types and assigned users
  const plants = await instance.get<CMMSPlant[]>(`/api/getPlants`, headers);
  const faults = await instance.get<CMMSFaultTypes[]>(
    `/api/fault/types`,
    headers
  );
  const users = await instance.get<CMMSUser[]>(
    `/api/getAssignedUsers/` + context.req?.user?.allocated_plants.join(","),
    headers
  );

  if (plants.status !== 200) throw Error("Error getting plants");
  if (faults.status !== 200) throw Error("Error getting fault types");
  if (users.status !== 200) throw Error("Error getting assigned users");

  let props: Props = {
    plants: plants.data,
    faultsTypes: faults.data,
    assignTo: users.data,
  };

  return {
    props: props,
  };
};
