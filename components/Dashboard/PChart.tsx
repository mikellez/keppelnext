import React from "react";
import { CMMSDashboardData } from "../../types/common/interfaces";
import { PieChart, Pie, Legend, Label, Tooltip, ResponsiveContainer } from "recharts";

interface ChartProps {
    data: CMMSDashboardData[];
};

export default function PChart(props: ChartProps) {
    return (
        <div style={{fontSize: "12px"}}>
            <ResponsiveContainer width={300} height={300}>
                <PieChart>
                    <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="square" align="center" />
                    <Tooltip />
                    <Pie data={props.data} nameKey="status" dataKey="count" fill="fill" innerRadius={50} />
                </PieChart>
            </ResponsiveContainer>  
        </div>  
    );
};