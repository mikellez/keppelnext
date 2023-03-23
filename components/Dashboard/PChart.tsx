import React from "react";
import { CMMSDashboardData } from "../../types/common/interfaces";
import {
  PieChart,
  Pie,
  Legend,
  Label,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: CMMSDashboardData[];
}

export default function PChart(props: ChartProps) {
  //   console.log(props.data);
  return (
    <div style={{ fontSize: "12px", paddingBottom: "5px" }}>
      <ResponsiveContainer width={400} height={300}>
        <PieChart>
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={10}
            iconType="square"
            className=""
            width={400}
          />
          <Tooltip />
          <Pie
            data={props.data}
            nameKey="name"
            dataKey="value"
            fill="fill"
            innerRadius={50}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
