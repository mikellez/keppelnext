import React, { MouseEventHandler, PropsWithChildren, useState } from "react";

interface TooltipBtnProps extends PropsWithChildren {
  text?: string;
  onClick?: MouseEventHandler;
  style?: React.CSSProperties;
  toolTip?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function TooltipBtn(props: TooltipBtnProps) {
  const [isHover, setIsHover] = useState<boolean>(false);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      {props.toolTip != false && (
        <div
          style={{
            display: isHover ? "block" : "none",
            position: "absolute",
            fontSize: "0.7rem",
            backgroundColor: "#DFDFDE",
            padding: "0.3rem",
            borderRadius: "5px",
            zIndex: 10,
            textAlign: "center",
            top: 35,
            left: -15,
            width: "5rem",
            color: "#000000",
          }}
        >
          {props.text ? props.text : "Default Tooltip"}
        </div>
      )}
      <button
        className={`btn btn-primary ${props.className}`}
        style={{
          ...props.style,
          display: "flex",
          justifyContent: "center",
          // position: "relative",
        }}
        onClick={props.onClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    </div>
  );
}
