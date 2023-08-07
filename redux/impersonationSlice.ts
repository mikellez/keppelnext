import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";

// Type for the state
export interface ImpersonationState {
    impersonationState: boolean;
  }
  
// Initial state
const initialState: ImpersonationState = {
  impersonationState: false,
};
  
  // Actual Slice
export const impersonationSlice = createSlice({
    name: "impersonation",
    initialState,

    // Function that takes current state + action as input and returns a new state 
    reducers: {
      // Action to set the impersonation status
      setImpersonationState(state, action) {
        state.impersonationState = action.payload;
      },
    },
  
    // Special reducer for hydrating the state. Special case for next-redux-wrapper
    extraReducers: {
      [HYDRATE]: (state, action) => {
        return {
          ...state,
          ...action.payload.impersonation,
        };
      },
    },
  });
  
  export const { setImpersonationState } = impersonationSlice.actions;
  
  export const selectImpersonationState = (state: AppState) => state.impersonation.impersonationState;
  
  export default impersonationSlice.reducer;