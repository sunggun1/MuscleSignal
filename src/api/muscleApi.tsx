import axios from 'axios';
import { muscleProp } from '../redux/slices/muscleSlice';
const baseURL = 'http://ec2-3-36-19-113.ap-northeast-2.compute.amazonaws.com/muscle/';


export const getMuscleApi = ( musclePositionId : number) => {
    const crudURL = `${musclePositionId}`
    axios({
        method: 'post',
        url: baseURL+crudURL,
        headers: {}, 
    })
    .then(response=>{
        console.log(response);
    })
    .catch(error=>{
        console.log(error);
    });
}

export const insertMuscleApi = ( muscleArrays : muscleProp[], positionName : string) => {
    const crudURL = 'create'
    axios({
        method: 'post',
        url: baseURL+crudURL,
        headers: {},
        data: {
             muscleArrays,
             positionName
        }
    })
    .then(response=>{
        console.log(response);
    })
    .catch(error=>{
        console.log(error);
    });
}

export const deleteMuscleApi = (positionName: string) => {
    const crudURL = `delete`

    axios({
        method: 'delete',
        url: baseURL+crudURL,
        headers: {}, 
        data: {
            positionName
        }
    })
    .then(response=>{
        console.log(response);
    })
    .catch(error=>{
        console.log(error);
    });
}