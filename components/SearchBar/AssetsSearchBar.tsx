import { AiOutlineSearch } from "react-icons/ai";
import styles from "./AssetSearchBar.module.css";
import { MouseEventHandler, ChangeEventHandler, forwardRef } from "react";
import Search from "antd/es/transfer/search";

interface SearchBarProps {
  // search: string,
  // onChange: ChangeEventHandler<HTMLInputElement>,
  onSubmit: MouseEventHandler;
}

const AssetSearchBar = forwardRef((props: SearchBarProps, ref: any) => {
  return (
    <div className={styles.assetSearchBarContainer}>
      <input
        // value={props.search}
        type="text"
        className={styles.assetSearchBarInput}
        // onChange={props.onChange}
        ref={ref}
      />
      <button className={styles.assetSearchBarButton} onClick={props.onSubmit}>
        <AiOutlineSearch size={25} color="white" />
      </button>
    </div>
  );
});

AssetSearchBar.displayName = "SearchBar";
export default AssetSearchBar;
