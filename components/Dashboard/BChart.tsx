import React, { useEffect, useState } from "react";
import { CMMSDashboardData } from "../../types/common/interfaces";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";

interface ChartProps {
    data: CMMSDashboardData[];
    title: String;
    colors: String[];
  }


export default function BChart(props: ChartProps) {
    const [chartData, setChartData] = useState<any>({name: props.title});

    useEffect(() => {
        setChartData({name: props.title});
        props.data.map((data) => {
            setChartData(chartData => {return {...chartData, [data.name] : data.value}}) 
        });
    }, [props.data])

  return (
    <div>
        <BarChart
        width={500}
        height={100}
        data={[chartData]}
        layout={"vertical"}
        margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5
        }}
        >
        <YAxis type="category" dataKey="name" hide/>
        <XAxis type="number" hide />
        
        <Tooltip />
        {Object.keys(chartData).map((key: string, index: number): any => {
                if(key != "name"){
                    const bars = [];
                    bars.push(<Bar dataKey={key} stackId="a" fill={props.colors[index-1]} />);
                    return bars;
                }
            })}
        </BarChart>
    </div>
  );
}
