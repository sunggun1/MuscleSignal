import { createSlice,PayloadAction,createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import backendApi from "../../api/backendApi";
// import db from "../sqlite/db";
import { Alert } from "react-native";
import { ThunkAction,AnyAction,ThunkDispatch } from "@reduxjs/toolkit";
import SQLite from "react-native-sqlite-storage";
import { useDispatch } from "react-redux";

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

export const db = SQLite.openDatabase({
    name: 'local.db',
    createFromLocation: '~www/local.db',
    location:'Library'
  },
  () => {
    console.log('불러오기 성공');
  },
  error => {
    console.log(error);
});

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

// export const getAllMusclePosition = createAsyncThunk<MusclePosition,any,{state:RootState, rejectValue: MusclePosition}>('getAllMusclePosition', async (_:Event,{getState,rejectWithValue})=> {
//     const state = getState();
//     const token = state.auth.token;
//     const response : any = await backendApi.post('/musclePosition/get',{token});    
//     if(response.status == 400){
//         return rejectWithValue((await response.data))
//     }
//     return (response.data) as MusclePosition;
// });

// export const createMusclePosition = createAsyncThunk<MusclePosition,string,{state:RootState,rejectValue: MusclePosition}>('createMusclePosition', async (positionName: string,{getState,rejectWithValue}) =>{
//     const state = getState();
//     const token = state.auth.token;
//     const response : any = await backendApi.post('/musclePosition/create', {positionName,token})    
    
//     if(response.status == 400){
//         return rejectWithValue((await response.data))
//     }

//     return (response.data) as MusclePosition;
// });

// export const deleteMusclePosition = createAsyncThunk<MusclePosition,string,{state:RootState,rejectValue: MusclePosition}>('deleteMusclePosition', async (id: string,thunkAPI)=>{
//     const response : any = await backendApi.delete(`/musclePosition/delete/${id}`);
    
//     if(response.status == 400){
//         return thunkAPI.rejectWithValue((await response.data))
//     }

//     return (response.data) as MusclePosition;
// });

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
