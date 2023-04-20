import { Pagination } from "@table-library/react-table-library/types/pagination";
import styles from "../styles/PageButton.module.css";
import { RequestItem } from "../pages/Request";
import { ChecklistItem } from "../pages/Checklist";
import { logbookData } from "../pages/Logbook";

const PageButton = ({
  setPage,
  children,
  active,
  onClick
}: {
  active?: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      type="button"
      style={{
        marginRight: "0.1rem",
        marginLeft: "0.1rem",
      }}
      onClick={(e) => {
        if(onClick) onClick(e);
        setPage(children as number)
      }}
      className={`btn btn-primary ${active ? "" : styles.nonActiveBtns}`}
    >
      {children}
    </button>
  );
};

export default PageButton;
