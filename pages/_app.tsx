import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import "../styles/index.scss";
import type { AppProps } from "next/app";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import TopBar from "../components/TopBar/TopBar";
import Footer from "../components/Footer";
import nProgress from "nprogress";
import { StaffContextProvider } from "../components/Context/StaffContext";
import { AdminContextProvider } from "../components/Context/AdminContext";
import { ModuleModal, SimpleIcon } from "../components";
import ModuleSimplePopup from "../components/ModuleLayout/ModuleSimplePopup";
import TooltipBtn from "../components/TooltipBtn";
import { useIdleTimer } from "react-idle-timer";
import type { IIdleTimer } from "react-idle-timer";
import instance from "../types/common/axios.config";
import User from "./User/Management";
import {wrapper} from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const PROMPT_BEFORE_IDLE_DURATION = 15 * 60 * 1000; // 15 minutes

export default function App({ Component, pageProps, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const router = useRouter();
  const { asPath, route, pathname } = router;
  const [isTimeoutPromt, setIsTimeoutPrompt] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const idleTimer = useRef(null);
  // const [timerStarted, setTimerStarted] = useState(false);

  let inactivityTimer: any = null;

  const handleUserActivity = () => {
    setIsTimeout(false);
    setIsTimeoutPrompt(false);
    //console.log("User did something", new Date().toLocaleTimeString());
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      setIsTimeoutPrompt(true);
      // Perform actions when user inactivity timeout occurs
    }, TIMEOUT_DURATION - PROMPT_BEFORE_IDLE_DURATION);
  };

  useEffect(() => {
    // Attach event listeners to detect user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    // Start the initial inactivity timer
    inactivityTimer = setTimeout(() => {
      //console.log("User inactive", new Date().toLocaleTimeString());
      // Perform actions when user inactivity timeout occurs
      setIsTimeoutPrompt(true);
      setIsTimeout(true);
      
    }, TIMEOUT_DURATION - PROMPT_BEFORE_IDLE_DURATION);

    return () => {
      // Clean up event listeners and clear the timeout when the component unmounts
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(inactivityTimer);
    };
  }, [isTimeout, isTimeoutPromt]);

  useEffect(() => {
    if (isTimeout && !asPath.includes("/Login")) {
      sendLogout();
    }
  }, [isTimeout]);

  const sendLogout = (): void => {
    instance
      .post("/api/logout")
      .then((response: any) => {
        // console.log("success", response);
        localStorage.removeItem("staff");
        window.location.href = "/";
      })
      .catch((e: any) => {
        // console.log("error", e);
        alert("logout fail");
      });
  };

  function _onPrompt(event?: Event, idleTimer?: IIdleTimer) {
    if (!asPath.includes("/Login")) {
      setIsTimeoutPrompt(true);
      setIsTimeout(true);
    }
  }
  function _onActive(event?: Event, idleTimer?: IIdleTimer) {
    if (!asPath.includes("/Login")) {
      setIsTimeout(false);
      idleTimer!.reset();
    }
  }
  function _onIdle(event?: Event, idleTimer?: IIdleTimer) {
    if (!asPath.includes("/Login")) {
      if (isTimeout) {
        sendLogout();
      }
    }
  }

  // if (!asPath.includes("/Login")) {
  /*const timer = useIdleTimer({
    ref: idleTimer,
    syncTimers: 1,
    // ref: idleTimer,
    onPrompt: _onPrompt,
    onIdle: _onIdle,
    onActive: _onActive,
    onAction: _onActive,
    promptBeforeIdle: 15 * 1000 * 60,
    timeout: 30 * 1000 * 60,
    // promptBeforeIdle: 5 * 1000,
    // timeout: 10 * 1000,
    crossTab: true,
    stopOnIdle: true,
  });*/
  // }

  // useEffect(() => {
  //   if (!isTimeout) {
  //     sendLogout();
  //   } else {
  //     setIsTimeout(true);
  //   }
  // }, []);

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");

    const handleRouteStart = () => nProgress.start();
    const handleRouteDone = () => nProgress.done();

    router.events.on("routeChangeStart", handleRouteStart);
    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("routeChangeError", handleRouteDone);

    return () => {
      // unmounting
      router.events.off("routeChangeStart", handleRouteStart);
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("routeChangeError", handleRouteDone);
    };
  }, [router.events]);

  if (
    asPath.includes("/Login") ||
    pathname === "/404" ||
    pathname === "/500" ||
    pathname === "/403" ||
    asPath.includes("/Guest/")
  )
    return (
      <div>
        <Component {...pageProps} />
      </div>
    );

  return (
    <>
      <div>
        <Provider store={store}>
        <PersistGate persistor={store.__persistor}>
          <AdminContextProvider>
            <TopBar />
            <div
              style={
                {
                  position: "relative",
                  minHeight: "calc(100vh - 4rem)",
                }
                // minheight -4rem due to top bar height of 4 rem
              }
            >
              <div style={{ paddingBottom: "12rem" }}>
                  <StaffContextProvider>
                    <Component {...pageProps} />
                  </StaffContextProvider>
              </div>
              <Footer />
            </div>
          </AdminContextProvider>
        </PersistGate>
        </Provider>
      </div>
      <ModuleSimplePopup
        modalOpenState={isTimeoutPromt}
        setModalOpenState={setIsTimeoutPrompt}
        text="You will be redirected back to the Login page if you remain Idle"
        title="Your session will expire soon"
        icon={SimpleIcon.Exclaim}
        buttons={[
          <TooltipBtn
            key={1}
            toolTip={false}
            onClick={() => setIsTimeoutPrompt(false)}
          >
            Ok
          </TooltipBtn>,
        ]}
      />
    </>
  );
}

