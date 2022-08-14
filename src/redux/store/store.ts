import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import musclePositionSlice from "../slices/musclePositionSlice";

const store = configureStore({
    reducer: {
        auth : authSlice,
        musclePos: musclePositionSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store