import SQLite from "react-native-sqlite-storage";
import { createSlice } from "@reduxjs/toolkit";


var success = 0;
export const db = SQLite.openDatabase({
    name: 'local.db',
    createFromLocation: '~www/local.db',
    location:'Library'
  },
  () => {
    console.log('불러오기 성공');
    success = 1;
  },
  error => {
    console.log(error);
    success = 0;
});

export interface database {
    db : number
}

export const initialState : database = {
    db : success
}


const databaseSlice = createSlice({
    name: 'fft',
    initialState: initialState,
    reducers:{
    }
})


export const databaseActions = databaseSlice.actions;
export default databaseSlice.reducer;