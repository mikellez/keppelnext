import Tooltip from "rc-tooltip";

interface CellTooltipProps {
    CellContents: string | JSX.Element | null;
  }

export default function CellTooltip(props : CellTooltipProps) {

    return (
        <Tooltip
            overlayInnerStyle={{ fontSize: "0.7rem" }}
            placement="bottom"
            trigger={["hover"]}
            overlay={<span>{props.CellContents}</span>}
        >
            {<div>{props.CellContents}</div>}
        </Tooltip>
    );
  }