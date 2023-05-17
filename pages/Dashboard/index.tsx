import React from "react";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import instance from "../../axios.config";
import ManagerDashboad from "./Manager";
import EngineerDashboad from "./Engineer";
import SpecialistDashboad from "./Specialist";
import { CMMSDashboardData } from "../../types/common/interfaces";
import DashboardContent from "./DashboardContent";

export async function fetchData(
  type: string,
  plant: number,
  field: string,
  datetype: string,
  date: string
): Promise<CMMSDashboardData[]> {
  const url = `/api/${type}/counts/${field}/${plant}/${datetype}/${date}`;
  const colors = [
    "#03C988",
    "#FFAC41",
    "#C74B50",
    "#810CA8",
    "#282A3A",
    "#FB2576",
  ];

  console.log(url)

  return await instance
    .get(url)
    .then((res) => {
      if (res) {
        return res.data.map((item: any, index: number) => {
          return {
            ...item,
            value: parseInt(item.value),
            fill: colors[index],
          };
        });
      }
    })
    .catch((err) => console.log(err));
}

export default function Dashboad({ role_id }: { role_id: number }) {
  /*if (role_id === 1 || role_id === 2) return <ManagerDashboad />;

  if (role_id === 3) return <EngineerDashboad />;

  return <SpecialistDashboad />;*/
  return <DashboardContent role_id={role_id}/>
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  console.log('cookie', context.req.headers.cookie);
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };

  const userInfo = await instance.get<any>(
    "/api/user",
    headers
  );
  console.log(userInfo.data);
  if (userInfo.status === 400) return { notFound: true };

  let props = {
    role_id: userInfo.data.role_id,
  };

  return {
    props: props,
  };
};
