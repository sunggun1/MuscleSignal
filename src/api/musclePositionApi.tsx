import axios from 'axios';

const baseURL = 'http://ec2-3-36-19-113.ap-northeast-2.compute.amazonaws.com/musclePosition/';

export const insertMusclePositionApi = (positionName : string) => {
    const crudURL = 'create'
    axios({
        method: 'post',
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

export const deleteMusclePositionApi = (positionName: string) => {
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


// export default axios.create({
//     baseURL: 'http://474d-58-123-111-15.ngrok.io'
// });