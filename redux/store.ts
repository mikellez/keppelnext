import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import { impersonationSlice } from "./impersonationSlice";
import { createWrapper } from "next-redux-wrapper";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

// Store -- source of truth for the application's state. Can make use of this to implement state persistence.

// Add future reducers here
const rootReducer = combineReducers({
  [impersonationSlice.name]: impersonationSlice.reducer,
});

const makeConfiguredStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: true,
  });

export const makeStore = () => {
  const isServer = typeof window === "undefined";
  // We only want it on the client side
  if (isServer) {
    return makeConfiguredStore();
  } else {
    // To create
    const persistConfig = {
      key: "impersonation",
      storage,
    };
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    let store: any = configureStore({
      reducer: persistedReducer,
      devTools: process.env.NODE_ENV !== "production",
    });
    store.__persistor = persistStore(store); 
    return store;
  }
};


export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);