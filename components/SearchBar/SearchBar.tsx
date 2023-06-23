import { AiOutlineSearch } from "react-icons/ai";
import styles from "./SearchBar.module.css";
import { MouseEventHandler, ChangeEventHandler, forwardRef } from "react";
import Search from "antd/es/transfer/search";

interface SearchBarProps {
    // search: string,
    // onChange: ChangeEventHandler<HTMLInputElement>,
    onSubmit: MouseEventHandler
}

const SearchBar = forwardRef((props: SearchBarProps, ref: any) => {
    return (
        <div className={styles.searchBarContainer}>
            <input 
                // value={props.search}
                type="text" 
                className={styles.searchBarInput} 
                // onChange={props.onChange} 
                ref={ref}
            />
            <button 
                className={styles.searchBarButton} 
                onClick={props.onSubmit}
            >
                <AiOutlineSearch size={25} color="white" />

            </button>
        </div>
    )
})

SearchBar.displayName = "SearchBar";
export default SearchBar