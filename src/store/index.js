import { configureStore } from "@reduxjs/toolkit";
import { locationsReducer } from "@/store/locationSlice";

export const store = configureStore({
  reducer: {
    locations: locationsReducer,
  },
});
