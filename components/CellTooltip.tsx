import Tooltip from "rc-tooltip";
import 'rc-tooltip/assets/bootstrap_white.css'; // Sets the current style of the tooltip, can change this if need to customize

interface CellTooltipProps {
    // Content to show in cell
    CellContents: string | JSX.Element | number | null;
    // optional prop in case tooltip needs to show value that is different from the cell contents
    ToolTipContents? : string | JSX.Element | number | null;
  }
/**
 * Using the rc-tooltip library https://www.npmjs.com/package/rc-tooltip
 * 
 * This custom component is used for showing a cell value with a corresponsing tooltip
 * for a particular table. 
 * */

export default function CellTooltip(props : CellTooltipProps) {

    return (
        <Tooltip
            overlayInnerStyle={{ fontSize: "0.7rem" }}
            placement="bottom"
            trigger={["hover"]}
            overlay={<span>{props.ToolTipContents ? props.ToolTipContents : props.CellContents}</span>}
        >
            {<div>{props.CellContents}</div>}
        </Tooltip>
    );
  }