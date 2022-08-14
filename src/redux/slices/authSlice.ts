import { createSlice,PayloadAction,createAsyncThunk } from "@reduxjs/toolkit";
import backendApi from "../../api/backendApi";


interface AuthState {
    token : string | null,
    result : string | null
}

const initialState : AuthState = {
    token : '',
    result : '',
}

interface singinProps {
    email : string;
    password : string;
}

export const fetchSignup = createAsyncThunk<AuthState,singinProps,{rejectValue: AuthState}>('signup', async (userData, thunkApi)=>{
    const response : any = await backendApi.post('/user/create',userData);
    
    if(response.status == 400){
        return thunkApi.rejectWithValue((await response.data as AuthState))
    }

    return await(response.data) as AuthState;
});

export const fetchSignin = createAsyncThunk<AuthState,singinProps,{rejectValue: AuthState}>('signin', async (userData, thunkApi)=>{
    const response : any = await backendApi.post('/user/login',userData);
    
    if(response.status == 400){
        return thunkApi.rejectWithValue((await response.data as AuthState))
    }

    return await(response.data) as AuthState;
});

const authSlice = createSlice({
    name : 'auth',
    initialState : initialState,
    reducers: {
        clearResult:(state) => {
            state.result = ''
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSignin.pending, (state)=>{
            state.result = ''
        })
        builder.addCase(fetchSignin.fulfilled,(state,action: PayloadAction<AuthState>) => {
            state.token = action.payload.token;
            state.result = action.payload.result;
        })
        builder.addCase(fetchSignin.rejected,(state,action)=>{
            if(action.payload){
                state.token = '';
                state.result = action.payload.result;
            }else{
                state.token = '';
                state.result = action.error as string;
            }
        })
        builder.addCase(fetchSignup.pending, (state)=>{
            state.result = ''
        })
        builder.addCase(fetchSignup.fulfilled,(state,action: PayloadAction<AuthState>) => {
            state.token = action.payload.token;
            state.result = action.payload.result;
        })
        builder.addCase(fetchSignup.rejected,(state,action)=>{
            if(action.payload){
                state.token = '';
                state.result = action.payload.result;
            }else{
                state.token = '';
                state.result = action.error as string;
            }
        })
    }
});

export const selectResult = (state:AuthState)=>{state.result};
export const authActions = authSlice.actions;
export default authSlice.reducer;