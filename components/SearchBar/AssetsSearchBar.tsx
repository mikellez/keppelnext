import { AiOutlineSearch } from "react-icons/ai";
import styles from "./AssetSearchBar.module.css";
import React, {
  MouseEventHandler,
  ChangeEventHandler,
  forwardRef,
} from "react";
import Search from "antd/es/transfer/search";

interface SearchBarProps {
  // search: string,
  // onChange: ChangeEventHandler<HTMLInputElement>,
  onSubmit: MouseEventHandler;
  onChange?: Function;
}

const AssetSearchBar = forwardRef((props: SearchBarProps, ref: any) => {
  function handleChange() {
    if (props.onChange) {
      // console.log("running change");
      return props.onChange();
    } else {
      return () => {};
    }
  }
  return (
    <div className={styles.assetSearchBarContainer}>
      <input
        // value={props.search}
        type="text"
        className={styles.assetSearchBarInput}
        // onChange={props.onChange}
        ref={ref}
        onChange={handleChange}
      />
      <button className={styles.assetSearchBarButton} onClick={props.onSubmit}>
        <AiOutlineSearch size={25} color="white" />
      </button>
    </div>
  );
});

AssetSearchBar.displayName = "SearchBar";
export default AssetSearchBar;
