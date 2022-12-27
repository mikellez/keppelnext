import React, { PropsWithChildren } from "react";
import TopBar from "./TopBar/TopBar";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <TopBar />
            <body style={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
                { children }
            </body>
            <Footer />
        </>
    )
}