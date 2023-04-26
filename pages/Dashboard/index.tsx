import React from "react";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import ManagerDashboad from "./Manager";
import EngineerDashboad from "./Engineer";
import SpecialistDashboad from "./Specialist";
import { CMMSDashboardData } from "../../types/common/interfaces";
import { Role } from "../../types/common/enums";

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

  return await axios
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
  if (role_id === Role.Admin || role_id === Role.Manager) return <ManagerDashboad />;

  if (role_id === Role.Engineer) return <EngineerDashboad />;

  return <SpecialistDashboad />;
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

  const userInfo = await axios.get<any>(
    `http://${process.env.SERVER}:${process.env.PORT}/api/user`,
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
