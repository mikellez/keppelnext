import React, { PropsWithChildren } from "react";
import TopBar from "./TopBar/TopBar";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div>
            <TopBar />
            <div style={{display: "flex", flexDirection: "column", minHeight: "100vh"}}>
            { children }
            </div>
            <Footer />
        </div>
    )
}