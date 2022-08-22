import { createSlice, createAsyncThunk,createSelector } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import backendApi from "../../api/backendApi";
import SQLite from 'react-native-sqlite-storage';
import { RootState } from "../store/store";
import { Selector } from "react-redux";

export interface muscleProp {
    id : string;
    musclePositionId : number;
    power :string;
    created : Date;
}

export interface Muscle {
    position : muscleProp[];
    result : string | null;
}

const initialState : Muscle = {
    position : [],
    result : ''
}
export const muscleTableName = 'muscle';

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


export const createMuscleTable = () => {
    db.transaction(function (txn) {
      txn.executeSql(
        `SELECT * FROM sqlite_master WHERE type='table' AND name='${muscleTableName}'`,
        [],
        function (_tx, res) {
          console.log('make muscle table :'+ res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql(`DROP TABLE IF EXISTS ${muscleTableName}`, []);
            txn.executeSql(
              `CREATE TABLE IF NOT EXISTS ${muscleTableName}(
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                musclePositionId INTEGER NOT NULL REFERENCES muscle_position(id),
                power INTEGER NOT NULL,
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

// export const getAllMuscle = createAsyncThunk<Muscle>('getAllMuscle', async ()=>{
//     const response : any = await backendApi.post('/muscle/get');
//     return await(response.data) as Muscle;
// });

// export const getOneMuscle = createAsyncThunk<Muscle>('getOneMuscle', async (id)=>{
//     const response : any = await backendApi.post(`/muscle/get/${id}`);
//     return await(response.data) as Muscle;
// });

// export const createMuscle = createAsyncThunk('createMuscle', async (positionName)=>{
//     const response : any = await backendApi.post('/muscle/create', positionName);
//     return await(response.data) as Muscle;
// });

// export const deleteMuscle = createAsyncThunk('deleteMuscle', async (id)=>{
//     const response : any = await backendApi.post(`/muscle/delete/${id}`);
//     return await(response.data) as Muscle;
// });

const muscleSlice = createSlice({
    name : 'muscleSlice',
    initialState : initialState,
    reducers: {
        getAllMuscle: (state, action)=>{
            state.position = action.payload.position;
            state.result = action.payload.result;
        }
    }
});

export const muscleSelector = (state:RootState):Muscle => state.muscle;
export const musclePowerSelector = createSelector(
  muscleSelector,(muscle:Muscle)=>muscle.position.map((item2)=>{return item2.power})
);

export const muscleActions = muscleSlice.actions;
export default muscleSlice.reducer;
