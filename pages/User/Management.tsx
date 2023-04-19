import React, { useState, useEffect } from "react";
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CMMSEmployee } from "../../types/common/interfaces";
import axios from "axios";

const getUser = async () => {
  const url = "/api/user/getUsers";
  return await axios
    .get(url)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
};

export default function User() {
  useEffect(() => {
    getUser().then((res) => {
      setData(res);
    });
  }, []);

  const [data, setData] = useState<CMMSEmployee[]>([]);
  const [columnSizes, setColumnSizes] = useState<string>(
    "6em 20% calc(80% - 12em) 6em;"
  );

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  " +
        columnSizes +
        "",
      HeaderRow: `
        background-color: #eaf5fd;
      `,
    },
  ]);

  const columns = [
    {
      HeaderCell: "Employee ID",
      Cell: ({ item }: { item: CMMSEmployee }) => (
        <Cell>{item.employee_id}</Cell>
      ),
    },
    {
      HeaderCell: "Name",
      Cell: ({ item }: { item: CMMSEmployee }) => (
        <Cell>{item.full_name}</Cell>
      ),
    },
    {
      HeaderCell: "Role",
      Cell: ({ item }: { item: CMMSEmployee }) => (
        <Cell>{item.role_name}</Cell>
      ),
    },
  ];

  return (
    <Table data={{ nodes: data }} columns={columns} theme={theme}>
      <Header>
        <HeaderRow>
          <HeaderCell>Employee ID</HeaderCell>
          <HeaderCell>Name</HeaderCell>
          <HeaderCell>Role</HeaderCell>
        </HeaderRow>
      </Header>
      <Body>
        {data.map((d) => (
          <Row key={d.id} item={d}>
            <Cell>{d.employee_id}</Cell>
            <Cell>{d.full_name}</Cell>
            <Cell>{d.role_name}</Cell>
          </Row>
        ))}
      </Body>
    </Table>
  );
}
