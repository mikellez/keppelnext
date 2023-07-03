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
// import IdleTimer from "../components/IdleTimer";
import { useIdleTimer } from "react-idle-timer";
import instance from "../types/common/axios.config";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { asPath, route, pathname } = router;
  const [isTimeout, setIsTimeout] = useState(false);

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
    setIsTimeout(true);
  }
  function onActive() {
    setIsTimeout(false);
  }
  function onIdle() {
    if (isTimeout) {
      sendLogout();
      setIsTimeout(true);
    }
  }

  const idleTimer = useIdleTimer({
    onPrompt: onPrompt,
    onIdle: onIdle,
    onActive: onActive,
    promptTimeout: 30 * 1000 * 60,
    timeout: 30 * 1000 * 60,
    crossTab: true,
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
    if (!isTimeout) {
      idleTimer.start();
    }
  }, []);

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
        modalOpenState={isTimeout}
        setModalOpenState={setIsTimeout}
        text="You will be redirected back to the login page"
        title="Your session has expired"
        icon={SimpleIcon.Exclaim}
        buttons={[
          <TooltipBtn key={1} toolTip={false} onClick={sendLogout}>
            Ok
          </TooltipBtn>,
        ]}
      />
    </>
  );
}
