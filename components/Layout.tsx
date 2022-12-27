import React, { PropsWithChildren } from "react";
import TopBar from "./TopBar/TopBar";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <TopBar />
            { children }
            <Footer />
        </>
    )
}