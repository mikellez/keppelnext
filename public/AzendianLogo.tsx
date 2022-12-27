import React from "react";

interface SVGInfo {
    size: number;
}

export default function AzendianLogo(props: SVGInfo) {

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" width={props.size} height={props.size} shapeRendering="crispEdges">
            <rect width="7" height="7" fill="#F15A23"/>
            <g fill="white">
                <rect height="1" width="3" x="3" y="1"/>
                <rect height="1" width="4" x="2" y="3"/>
                <rect height="1" width="5" x="1" y="5"/>
            </g>
        </svg>
    );
};