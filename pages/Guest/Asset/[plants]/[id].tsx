
import React, { useEffect, useState } from "react";
import instance from '../../../../axios.config.js';
import { useRouter } from "next/router";

import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../../components";

import {
    CMMSBaseType,
    CMMSRequestTypes,
    CMMSFaultTypes,
    CMMSUser,
} from "../../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import {RequestProps } from "../../../../components/Request/RequestContainer";
import RequestGuestContainer from "../../../../components/Request/RequestGuestContainer";

let user: boolean = false;



export default function RequestNew(props: RequestProps) {
    const router = useRouter();
    console.log(props)


    return (
        <ModuleMain>
            <ModuleHeader title="New Request" header="Create New Request">
                <Link href="/Request" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <RequestGuestContainer requestData={props}/>
            </ModuleContent>
        </ModuleMain>
    );
}

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext

) => {
    

    const headers = {
        withCredentials: true,
        headers: {
            Cookie: context.req.headers.cookie,
        },
    };
    const getRequestTypes = instance.get<CMMSRequestTypes[]>(
        `/api/request/types`,
        headers
    );
    const getFaultTypes = instance.get<CMMSFaultTypes[]>(
        `/api/fault/types`,
        headers
    );
    const getPlant = instance.get<any>(
        `/api/request/plant/${context.query.plants}`,
        headers
    );
    const getAsset = instance.get<any>(
        `/api/request/asset/${context.query.id}`,
        headers
    );

    const user: boolean = await instance
            .get<CMMSUser>(`/api/user`)
            .then((response) => {
                console.log(response.data)
                return true;
            })
            .catch((e) => {
                console.log(e)
                return false;
            })
            .finally(() => {
                return false;
            });
    console.log(user);
     


    const values = await Promise.all([
        getRequestTypes, getFaultTypes
        , getPlant, getAsset
    ]);

    const r: CMMSRequestTypes[] = values[0].data;
    const f: CMMSFaultTypes[] = values[1].data;
    const p: CMMSBaseType = values[2].data;
    const a: CMMSBaseType = values[3].data;


    interface GuestRequestProps {
        requestTypes: CMMSRequestTypes[];
        faultTypes: CMMSFaultTypes[];
        plant: any;
        asset: any;
        user: boolean;

    }

    let props: GuestRequestProps = { 
        requestTypes: r, faultTypes: f
        , plant: p, asset: a, user: user
    };

    return {
        props: props,
    };
};
