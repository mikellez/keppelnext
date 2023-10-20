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


interface ChartProps {
    data: CMMSDashboardData[];
    title: String;
    colors: String[];
  }


export default function BChart(props: ChartProps) {
    const [chartData, setChartData] = useState<any>({});

    /* //  If need to create custom tooltip:
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip" style={{ display: "inline-block"}}>
            <p className="label" style={{ paddingLeft: 10}}>{`${label}`}</p>
            <div style={{ display: "inline-flex"}}>
              {payload.map((pld) => (
                <div style={{ display: "inline-block", paddingLeft: 10 }}>
                  <div>{pld.dataKey}</div>
                  <div style={{ color: pld.fill }}>{pld.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    };*/

    useEffect(() => {
        //setChartData({name: props.title});
        props.data.map((data) => {
            setChartData(chartData => {return {...chartData, [data.name] : data.value}}) 
        });
    }, [props.data])

  return (
    <div style={{display:"block"}}>
        <h5>{props.title}</h5>
        <BarChart
        width={300}
        height={50}
        data={[chartData]}
        layout={"vertical"}
        margin={{
            top: 0,
            right: 30,
            left: 0,
            bottom: 0
        }}
        >
        <YAxis type="category" dataKey="name" hide/>
        <XAxis type="number" hide />
        
        <Tooltip  />
        {Object.keys(chartData).map((key: string, index: number): any => {
                if(key != "name"){
                    const bars = [];
                    bars.push(<Bar dataKey={key} stackId="a" fill={props.colors[index]} />);
                    return bars;
                }
            })}
        <Legend/>
        </BarChart>
    </div>
  );
}
