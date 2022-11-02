import { createSlice,PayloadAction,createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import { db } from "./databaseSlice";

export interface musclePositionProp {
    id : number;
    positionName : string;
    created : Date;
}

export interface MusclePosition {
    musclePosition : musclePositionProp[];
    result : string | null;
}

const initialState : MusclePosition = {
    musclePosition : [],
    result : ''
}

export const musclePositionTableName = 'muscle_position';

export const createMusclePositionTable = () => {
    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT * FROM sqlite_master WHERE type='table' AND name='muscle_position'",
        [],
        function (_tx, res) {
          console.log('make musclePosition table :'+ res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql(`DROP TABLE IF EXISTS muscle_position`, []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS muscle_position(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                positionName TEXT NOT NULL,
                created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
              []
            );
            Alert.alert('musclePosition DB created');
          }
        },(error)=>{
            console.log(error);
        }
      );
    })
};

const musclePositionSlice = createSlice({
    name : 'musclePosition',
    initialState : initialState,
    reducers:{
        getAllMusclePosition:(state,action:PayloadAction<MusclePosition>) => {
            state.musclePosition = action.payload.musclePosition;
            state.result = action.payload.result;
        }
    }
});
export const musclePositionActions = musclePositionSlice.actions;
export default musclePositionSlice.reducer;
