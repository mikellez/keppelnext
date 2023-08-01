import React, { useState, useEffect, useRef } from "react";
import { SlArrowDown } from "react-icons/sl";
import DropdownOption from "./DropdownOption";
import styles from "../../styles/Dropdown.module.css";
import instance from "../../types/common/axios.config";
import useComponentVisible from "./useComponentVisible";
import { useRouter } from "next/router";
import { useCurrentUser } from "../SWR";
import { useDispatch, useSelector } from "react-redux";
import { selectImpersonationState, setImpersonationState } from "../../redux/impersonationSlice";

export default function DropdownMenu() {
  const impersonationState = useSelector(selectImpersonationState);
  //const impersonationState = JSON.parse(localStorage.getItem('impersonationState'));
  const dispatch = useDispatch();

  const { ref, isComponentVisible, setIsComponentVisible } =
    useComponentVisible(false);

  const [isDropdowned, setIsDropdowned] = useState(false);

  const sendLogout = (): void => {
    instance.get("/api/user/logouthistory").then((response) => {
      instance
        .post("/api/logout")
        .then((response) => {
          // console.log("success", response);
          localStorage.removeItem("staff");
          window.location.href = "/";
        })
        .catch((e) => {
          // console.log("error", e);
          alert("logout fail");
        });
    });
  };

  const logOut = (): boolean => {
    sendLogout();
    return false;
  };

  const toggleDropdown = (): void => {
    if (isComponentVisible) setIsComponentVisible(false);
    else setIsComponentVisible(true);
  };

  const router = useRouter();
  const user = useCurrentUser();

  async function revertImpersonation() {
    try {
      let res = await instance.post(`/api/admin/revert`);
      // console.log(res);

      if(res.status == 200){ 
        window.location.href = '/Dashboard';
        // Dispatch to notify the store your intention to change the state
        dispatch(setImpersonationState(false));
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div ref={ref}>
      <button className={styles.dropdownButton} onClick={toggleDropdown}>
        <SlArrowDown
          size={28}
          style={{ color: "#707070", marginLeft: "1.5em", marginRight: "1em" }}
        />
      </button>
      {isComponentVisible && (
        <div className={styles.dropdownMenuContainer}>
          {impersonationState &&(
            <DropdownOption onClick={revertImpersonation}>
              Revert to Admin
            </DropdownOption>)}
          <DropdownOption onClick={() => router.push("/Settings")}>
            Settings
          </DropdownOption>
          <DropdownOption onClick={logOut}>Logout</DropdownOption>
        </div>
      )}
    </div>
  );
}
