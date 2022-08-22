import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import musclePositionSlice from "../slices/musclePositionSlice";
import muscleSlice from "../slices/muscleSlice";

const store = configureStore({
    reducer: {
        auth : authSlice,
        musclePos: musclePositionSlice,
        muscle:muscleSlice
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store