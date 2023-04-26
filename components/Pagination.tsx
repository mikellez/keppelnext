import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import PageButton from "./PageButton";
import styles from "../styles/Pagination.module.scss";

const Pagination = ({
  page,
  onClick,
  setPage,
  setReady,
  totalPages,
}: {
  page: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
  totalPages: number;
}) => {
  return (
    <div className={styles.Pagination}>
      <FiChevronsLeft
        size={25}
        className={`${styles.paginationChevron} ${
          page - 1 > 0 ? styles.active : styles.disabled
        }`}
        onClick={() => {
          setPage(1);
          setReady(false);
        }}
      />
      <span>
        {page - 1 > 0 && (
          <PageButton setPage={setPage} onClick={() => setReady(false)}>
            {page - 1}
          </PageButton>
        )}
        <PageButton active setPage={setPage} onClick={() => setReady(false)}>
          {page}
        </PageButton>

        {page + 1 <= totalPages && (
          <PageButton setPage={setPage} onClick={() => setReady(false)}>
            {page + 1}
          </PageButton>
        )}
      </span>
      <FiChevronsRight
        size={25}
        className={`${styles.paginationChevron} ${
          page < totalPages ? styles.active : styles.disabled
        }`}
        onClick={() => {
          setPage(totalPages);
          setReady(false);
        }}
      />
    </div>
  );
};

export default Pagination;
