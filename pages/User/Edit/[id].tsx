import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useCurrentUser } from "../../../components/SWR";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../../components";
import Link from "next/link";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import formStyles from "../../../styles/formStyles.module.css";
import instance from "../../../axios.config";

interface CMMSUserEdit {
    full_name: string;
    employee_id: string;
    allocated_plants: string[];
    allocatedplantids: number[];
    addplantids: number[];
    removeplantids: number[];
    password?: string;
    password_confirm?: string;

}

const getUsersData = async (id:number) => {
    const url = "/api/user/getUsersData/";
    return await instance
        .get(url + id)
        .then((res) => {
        return res.data;
        })
        .catch((err) => {
        console.log(err.response);
        return err.response.status;
        });
};

const getUsersplantData = async (id:number) => {
    const url = "/api/user/getUsersplantData/";
    return await instance
        .get(url + id)
        .then((res) => {
        return res.data;
        })
        .catch((err) => {
        console.log(err.response);
        return err.response.status;
        });
};




export default function EditUser() {
    const router = useRouter();
    const user_id: string = router.query.id as string;
    const [plantsAmmended, setPlantsAmmended]: [number[], any] = useState([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentplant, setCurrentplant] = useState<number>(0);
    const [submissionModal, setSubmissionModal] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [userDetails, setuserDetails] = useState<CMMSUserEdit>({
        full_name: "",
        employee_id: "",
        allocated_plants: [], 
        allocatedplantids: [],
        addplantids: [],
        removeplantids: [],
        password: "",
    });
    const handleForm = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
      ) => {
        setuserDetails((prevState) => {
          return { ...prevState, [e.target.name]: e.target.value };
        });
      };

      const handlePlantCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const plantId = parseInt(e.target.id);
        const isChecked = e.target.checked;
        if (isChecked) {
          // add plant to to allocatedplantids and add to addplantids only if it wasnt in removeplantids and remove from removeplantids if it was inside
          setuserDetails(prevState => ({
            ...prevState,
            allocatedplantids: [...prevState.allocatedplantids, plantId],
            addplantids: prevState.removeplantids.includes(plantId) ? prevState.addplantids : [...prevState.addplantids, plantId],
            removeplantids: prevState.removeplantids.filter(id => id !== plantId)
          }));
        } else {
              if (plantsAmmended.includes(plantId)) {
                setModalOpen(true);
                setCurrentplant(plantId);
              }
              else{
                // remove plant from allocatedplantids and addplantids and add plant to removeplantids if it was not in addplantids
              setuserDetails(prevState => ({
                ...prevState,
                allocatedplantids: prevState.allocatedplantids.filter(id => id !== plantId),
                addplantids: prevState.addplantids.filter(id => id !== plantId),
                removeplantids: prevState.addplantids.includes(plantId) ? prevState.removeplantids : [...prevState.removeplantids, plantId]
                
              }));
            }
          }
      };
      
      function submission() {
        //if no errors, submit form
        //post data
        const url = "/api/user/updateUser/";
        axios
          .post(url, {
            user_id: user_id,
            full_name: userDetails.full_name,
            employee_id: userDetails.employee_id,
            addplantids: userDetails.addplantids,
            removeplantids: userDetails.removeplantids,
            password: userDetails.password ? userDetails.password : null,
          })
          .then((res) => {
            console.log(res);
            setSubmissionModal(true);
          })
        }
      

    useEffect(() => {
        getUsersData(parseInt(user_id as string)).then((result) => {
            console.log(result);
            setuserDetails(result)
        });
        // set user details to the result of the api call

    }, []);
    useEffect(() => {
      getUsersplantData(parseInt(user_id as string)).then((result) => {
        console.log(result);
        const plantIds = result.map((obj: any) => obj.plant_id);
        console.log(plantIds)
        setPlantsAmmended(plantIds);     
      });
    }, []);
    
    useEffect(() => {
      getUsersData(parseInt(user_id as string)).then((result) => {
        const allocatedplantidsArray = result.allocatedplantids.split(",").map(Number);
        setuserDetails({
          ...result,
          allocatedplantids: allocatedplantidsArray,
          addplantids: [],
          removeplantids: []
        });
      });
    }, []);
    console.log(userDetails)

    return(
    <ModuleMain>
      <ModuleHeader title="User Edit" header="User Edit"></ModuleHeader>
      <ModuleContent includeGreyContainer grid>    

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              defaultValue={userDetails.full_name}
              onChange={handleForm}
            />
          </div>

          <div className="form-group">
            <label className="form-label"> Employee ID</label>
            <input
              type="text"
              className="form-control"
              name="employee_id"
              defaultValue={userDetails.employee_id}
              onChange={handleForm}
            />
          </div>

          <label className="form-label"> Assigned Plants</label>
          <div className="form-check"> 
          <input className="form-check-input" type="checkbox" id="2" checked={userDetails.allocatedplantids.includes(parseInt('2'))} onChange={(e) => handlePlantCheckboxChange(e)} />
            <label className="form-check-label">
                Woodlands DHCS
            </label>
            </div>

            <div className="form-check"> 
            <input className="form-check-input" type="checkbox" id="1" checked={userDetails.allocatedplantids.includes(parseInt('1'))} onChange={(e) => handlePlantCheckboxChange(e)} />
            <label className="form-check-label">
                Changi DHCS
            </label>
            </div>

            <div className="form-check"> 
            <input className="form-check-input" type="checkbox" id="3" checked={userDetails.allocatedplantids.includes(parseInt('3'))} onChange={(e) => handlePlantCheckboxChange(e)} />
            <label className="form-check-label">
                Biopolis
            </label>
            </div>

            <div className="form-check"> 
            <input className="form-check-input" type="checkbox" id="4" checked={userDetails.allocatedplantids.includes(parseInt('4'))} onChange={(e) => handlePlantCheckboxChange(e)} />
            <label className="form-check-label">
                Mediapolis
            </label>
            </div>
            
          </div>

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label"> Password Reset</label>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={handleForm}
            />
          </div>
          <div className="form-group">
            <label className="form-label"> Confirm Password Reset</label>
            <input
              type="password"
              className="form-control"
              name="password_confirm"
              onChange={handleForm}
            />
          </div>
        </div>
        <ModuleSimplePopup
          modalOpenState={modalOpen}
          setModalOpenState={setModalOpen}
          title="Are You Sure?"
          text="Checklists/Requests/Schedules have been assigned by the user from the plants you are removing."
          icon={SimpleIcon.Check}
          buttons={[
            <button
              key={1}
              className="btn"
              style={{ backgroundColor: "grey", color: "white" }}
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </button>,
            <button
            key={2}
            onClick={() => {
              setuserDetails(prevState => ({
                ...prevState,
                allocatedplantids: prevState.allocatedplantids.filter(id => id !== currentplant)
              }));
              setModalOpen(false);
              // route back to assets
            }}
            className="btn btn-primary"
            >
              Confirm
            </button>
          ]}
          onRequestClose={() => {
            setModalOpen(false);
          }}
          
        />
        <ModuleSimplePopup
        modalOpenState={passwordError}       
        setModalOpenState={setPasswordError}
        title="Error"
        text="Passwords do not match"
        icon={SimpleIcon.Exclaim}
        buttons={[
        <button
              onClick={() => {
                setPasswordError(false);
              }}
              className="btn btn-primary"
            >
              Ok
            </button>
        ]}
        />
          <ModuleSimplePopup
          modalOpenState={submissionModal}
          setModalOpenState={setSubmissionModal}
          title="Success!"
          text="Your inputs have been submitted!"
          icon={SimpleIcon.Check}
          buttons={
            <button
              onClick={() => {
                setSubmissionModal(false);
                router.push("/User/Management");
              }}
              className="btn btn-primary"
            >
              Ok
            </button>
          }
          onRequestClose={() => {
            router.push("/User/Management");
          }}
        />
      </ModuleContent>
      <ModuleFooter>
        <Link href={{ pathname: "/User/Management" }}>
          <button
            className="btn"
            style={{ backgroundColor: "grey", color: "white" }}
          >
            Back{" "}
          </button>{" "}
        </Link>
        <button
          className="btn"
          style={{ backgroundColor: "green", color: "white" }}
          //check if submission function is running
          onClick = {() => {
            if (userDetails.password == userDetails.password_confirm) {
              submission();
            }
            else {
              setPasswordError(true);
            }
          }}
        >
          Save
        </button>
      </ModuleFooter>
    </ModuleMain>

    );
}



