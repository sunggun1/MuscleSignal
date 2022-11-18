import { createSlice, createSelector } from "@reduxjs/toolkit";
import { Alert } from "react-native";
import { db } from "./databaseSlice";
import { RootState } from "../store/store";

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
                created DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')))`,
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
export const muscleTimeSelector = createSelector(
  muscleSelector,(muscle:Muscle)=>muscle.position.map((item2)=>{return item2.created})
);

export const musclePowerOneOrZeroSelector = createSelector(
  muscleSelector,(muscle:Muscle)=>muscle.position.map((item2)=>{return (parseInt(item2.power) > 400 ? 1 : 0)})
);

export const muscleCycleSelector = createSelector(
  musclePowerOneOrZeroSelector,(musclePowerOneOrZero : any) => {
    var l2 =[1,1,1,1,1,1,1,0] // 1 7개, 0 1개
    var count = 0;
    for(var i = 0; i< musclePowerOneOrZero.length; i++ ){
      var comparedArray = musclePowerOneOrZero.slice(i,i+l2.length)
      if(JSON.stringify(comparedArray) === JSON.stringify(l2)){
        count += 1;
      }
    }
    return count;
  }
);

export const muscleActions = muscleSlice.actions;
export default muscleSlice.reducer;
