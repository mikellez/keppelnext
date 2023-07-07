import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import "../styles/index.scss";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TopBar from "../components/TopBar/TopBar";
import Footer from "../components/Footer";
import nProgress from "nprogress";
import { StaffContextProvider } from "../components/Context/StaffContext";
import { ModuleModal, SimpleIcon } from "../components";
import ModuleSimplePopup from "../components/ModuleLayout/ModuleSimplePopup";
import TooltipBtn from "../components/TooltipBtn";
import { useIdleTimer } from "react-idle-timer";
import instance from "../types/common/axios.config";
import User from "./User/Management";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { asPath, route, pathname } = router;
  const [isTimeoutPromt, setIsTimeoutPrompt] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

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

  function onPrompt() {
    setIsTimeoutPrompt(true);
    setIsTimeout(true);
  }
  function onActive() {
    setIsTimeout(false);
    setIsTimeoutPrompt(false);
  }
  function onIdle() {
    if (isTimeout) {
      setIsTimeout(false);
      setIsTimeoutPrompt(false);
      // idleTimer.e
      sendLogout();
      setTimerStarted(false);
      idleTimer.pause();
    }
  }

  const idleTimer = useIdleTimer({
    onPrompt: onPrompt,
    onIdle: onIdle,
    onActive: onActive,
    promptBeforeIdle: 15 * 1000 * 60,
    timeout: 30 * 1000 * 60,
    // promptBeforeIdle: 5 * 1000,
    // timeout: 10 * 1000,
    crossTab: true,
    stopOnIdle: true,
  });

  useEffect(() => {
    // if (!timer) {
    //   setTimer(
    //     new IdleTimer({
    //       timeout: 15, //expire after 10 seconds
    //       onTimeout: () => {
    //         setIsTimeout(true);
    //       },
    //       onExpired: sendLogout,
    //     })
    //   );
    // }
    if (!timerStarted && !asPath.includes("/Login")) {
      idleTimer.start();
      setTimerStarted(true);
    }
  }, [asPath]);

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
