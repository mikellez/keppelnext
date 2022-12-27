import React from "react";
import TopBar from "./TopBar/TopBar";
import Footer from "./Footer";
import { NextPageContext } from "next";

export default function Layout({ children }: any) {
    return (
        <>
            <TopBar />
            { children }
            <Footer />
        </>
    )
}