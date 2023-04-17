import { Pagination } from "@table-library/react-table-library/types/pagination";
import styles from "../styles/PageButton.module.css";
import { RequestItem } from "../pages/Request";
import { ChecklistItem } from "../pages/Checklist";
import { logbookData } from "../pages/Logbook";

const PageButton = ({
  pagination,
  children,
}: {
  pagination:
    | Pagination<RequestItem>
    | Pagination<ChecklistItem>
    | Pagination<logbookData>;
  children: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      style={{
        marginRight: "0.1rem",
        marginLeft: "0.1rem",
      }}
      onClick={() => pagination.fns.onSetPage((children as number) - 1)}
      className={`btn btn-primary ${
        pagination.state.page === (children as number) - 1
          ? ""
          : styles.nonActiveBtns
      }`}
    >
      {children}
    </button>
  );
};

export default PageButton;
