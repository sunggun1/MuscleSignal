import { combineReducers, configureStore } from "@reduxjs/toolkit";
import databaseSlice from "../slices/databaseSlice";
import authSlice from "../slices/authSlice";
import musclePositionSlice from "../slices/musclePositionSlice";
import muscleSlice from "../slices/muscleSlice";
import fftSlice from "../slices/fftSlice";


const store = configureStore({
    reducer: {
        auth : authSlice,
        musclePos: musclePositionSlice,
        muscle:muscleSlice,
        fft: fftSlice,
        db: databaseSlice,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store