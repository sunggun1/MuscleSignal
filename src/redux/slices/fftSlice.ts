import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { db } from "./databaseSlice";
export interface fftProp {
    id : string;
    musclePositionId : number;
    power :string;
    created : Date;
    arrIndex: number;
    arrInsideIndex: number;
    isFrequency : number;
}

export interface fftInterface{
    array : fftProp[];
    result : string | null;
}

export const initialState : fftInterface = {
    array: [],
    result: null
}

const fftSlice = createSlice({
    name: 'fft',
    initialState: initialState,
    reducers:{
        getfft: (state, action)=>{
            state.array = action.payload.array;
            state.result = action.payload.result;
        },
        clearfft:(state) => {
            state.array = []
            state.result = null;
        }
    }
})

export const fftTableName = 'fft_table';

export const createFftTable = () => {
    db.transaction(function (txn) {
        txn.executeSql(`SELECT * FROM sqlite_master WHERE type='table' AND name='${fftTableName}'`,[],
            function (tx, res) {
                console.log('make fft table :'+ res.rows.length);
                if (res.rows.length == 0) {
                    txn.executeSql(`DROP TABLE IF EXISTS ${fftTableName}`, []);
                    txn.executeSql(
                        `CREATE TABLE IF NOT EXISTS ${fftTableName}(
                            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                            musclePositionId INTEGER NOT NULL REFERENCES muscle_position(id),
                            arrIndex INTEGER NOT NULL,
                            power REAL NOT NULL,
                            isFrequency INTEGER NOT NULL,
                            arrInsideIndex INTEGER NOT NULL,
                            created DATETIME NOT NULL DEFAULT(STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
                        )`,
                        []
                    );
                }
                
            },(error)=>{
                console.log('fft table make error');
                console.log(error);
            }
        );
    })
};



export const createFft = (musclePositionId: number,power:number,arrIndex:number,arrInsideIndex:number,isFrequency:number)=>{
    try{
        var tempMessage:string = '';
        db.transaction((tx) =>{
            tx.executeSql(`INSERT INTO ${fftTableName} (musclePositionId,arrIndex,power,arrInsideIndex,isFrequency) VALUES (?,?,?,?,?)`,[musclePositionId,arrIndex,power,arrInsideIndex,isFrequency],
            (tx1,results)=>{
                if (results.rowsAffected > 0) {
                    console.log('fft Data insert Success');
                    tempMessage = 'Data Inserted Success';
                } else {
                    console.log('Data Inserted Failed....');
                    tempMessage = 'Data Inserted Failed';
                }
            },(error: any) => {
                console.log('createFFTError')
                console.log(error);
                tempMessage = error;
            });
        })
    }catch(error:any){
        console.log('fft error');
        console.log(error);
    }
};

export const deleteFftByPosition = (musclePositionId: number) =>{
    try{
        db.transaction((tx) =>{
            tx.executeSql(`DELETE from ${fftTableName} where musclePositionId = ${musclePositionId}`,[],
            (tx,results)=>{
                if (results.rowsAffected > 0) {
                    console.log('fft delete success');
                } else {
                    console.log('fft Data deleted Failed....');
                }
            },(error: any) => {
                console.log(error);
            })
        })
    }catch(error:any){
        console.log(error);
    } 
};

export const dropFftTable = () => {
    db.transaction(function (txn) {
        txn.executeSql(`SELECT * FROM sqlite_master WHERE type='table' AND name='${fftTableName}'`,[],
            function (tx, res) {
                console.log('make fft table :'+ res.rows.length);
                if (res.rows.length == 1) {
                    console.log('drop table success');
                    txn.executeSql(`DROP TABLE IF EXISTS ${fftTableName}`, []);
                }
            },(error)=>{
                console.log('fft table drop error');
                console.log(error);
            }
        );
    })
}

export const fftSelector = (state:RootState):fftInterface => state.fft;
export const fftFrequencySelector = createSelector(fftSelector,(fft: fftInterface) =>  fft.array.length > 0 ? 
Object.values(fft.array.reduce((acc:any, item:fftProp) => {
    if (!acc[item.arrIndex]) acc[item.arrIndex] = [];
    if (item.isFrequency == 1){
        acc[item.arrIndex].push(item.power);
    }
    return acc;
}, {})) : []);

export const fftMagnitudeSelector = createSelector(fftSelector,(fft: fftInterface) =>  fft.array.length > 0 ? 
Object.values(fft.array.reduce((acc:any, item:fftProp) => {
    if (!acc[item.arrIndex]) acc[item.arrIndex] = [];
    if (item.isFrequency == 0){
        acc[item.arrIndex].push(item.power);
    }
    return acc;
}, {})) : []);

export const fftMagnitudeSumSelector = createSelector(
    fftSelector,
    (fft: fftInterface) =>  
    fft.array.length > 0 ? 
        fft.array.reduce((acc:number, item:fftProp) => {
            if (item.isFrequency == 0){
                if (parseInt(item.power) > 1000){
                    acc += parseInt(item.power);
                }
            }
            return acc;
        }, 0)
    : 0);

export const fftMagnitudeLessThanAThousandSelector = createSelector(fftSelector,(fft: fftInterface) =>  fft.array.length > 0 ? 
Object.values(fft.array.reduce((acc:any, item:fftProp) => {
    if (!acc[item.arrIndex]) acc[item.arrIndex] = [];
    if (item.isFrequency == 0){
        acc[item.arrIndex].push(parseFloat(item.power) > 1000 ? 1 : 0);
    }
    return acc;
}, {})) : []);

export const fftMagnitudePowerSelector = createSelector(fftSelector,(fft: fftInterface) =>  fft.array.length > 0 ? 
Object.values(fft.array.reduce((acc:any, item:fftProp) => {
    if (!acc[item.arrIndex]) acc[item.arrIndex] = 0;
    if (item.isFrequency == 0){
        if(parseFloat(item.power) > 1000){
            acc[item.arrIndex] += parseFloat(item.power) * 2 / (2**(item.arrInsideIndex-1)* 3.14)
        }
    }
    return acc;
}, {})) : []);


export const fftActions = fftSlice.actions;
export default fftSlice.reducer;