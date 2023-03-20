import React from "react";
import { useRouter } from "next/router";

export default function EditRequestPage() {
    const router = useRouter();
    const requestId = router.query.id;

    return (
        <h1>{requestId}</h1>
    );
};