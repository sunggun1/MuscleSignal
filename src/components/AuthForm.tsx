import { View, Text ,TextInput, StyleSheet, TouchableOpacity} from 'react-native'
import React,{useEffect, useState} from 'react'
import Spacer from './Spacer';
import { Button } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import store,{ RootState } from '../redux/store/store';
import {authActions } from '../redux/slices/authSlice'
// import {getAllMusclePosition} from '../redux/slices/musclePositionSlice';
import { useAppDispatch } from '../hook/hook';

type Props = {
    screenName : string;
    buttonText : string;
    bottomText : string;
    onSubmit: (params:any) => any;
    bottomTextNavigateScreenName : any;
};

const AuthForm = ({screenName, buttonText, bottomText, onSubmit, bottomTextNavigateScreenName}: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigation = useNavigation<any>();
    const result = useSelector((state:RootState) => state.auth.result)

    React.useEffect(() => {
        return navigation.addListener('focus', () => {
            setEmail('');
            setPassword('');
            dispatch(authActions.clearResult());
        });
    }, [navigation]);

    const startOnSubmit = async (email:string,password:string) => {
        await dispatch(onSubmit({email,password}));
    };

    React.useEffect(()=>{
        if(result == 'success')
            navigation.navigate();
    },[result]);

    return ( 
        <>
            <Spacer>
                <Text style={styles.screenName}>{screenName}</Text>
            </Spacer>
            <Spacer>
                <Text style={styles.appName}>MuscleTech</Text>
            </Spacer>
            <Spacer>
                <Text style={styles.textBoldStyle}>Email</Text>
                <TextInput 
                    style={styles.textInputStyle}
                    value={email}
                    onChangeText={setEmail}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </Spacer>
            <Spacer>
                <Text style={styles.textBoldStyle}>Password</Text>
                <TextInput 
                    value={password}
                    style={styles.textInputStyle}
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </Spacer>
            <Spacer>
                <Button title={buttonText} onPress={async ()=>{
                    await startOnSubmit(email,password);
                }}/>
            </Spacer>
            
            {result ? <Text style={styles.resultText}>result : {result}</Text> : ''}
            
            
            <Spacer>
                <TouchableOpacity onPress={()=>navigation.navigate(bottomTextNavigateScreenName)}>
                    <Text style={styles.textBorderLine}>{bottomText}</Text>
                </TouchableOpacity>
            </Spacer>
        </>
    );
};


const styles = StyleSheet.create({
    screenName:{
        alignSelf: 'center',
        fontWeight: 'bold'
    },
    appName : {
        alignSelf: 'center',
        fontWeight: 'bold',
        fontSize : 30
    },
    textInputStyle : {
        borderRadius: 15,
        borderWidth : 1,
        height : 45
    },
    textBoldStyle : {
        fontWeight: 'bold'
    },
    textBorderLine:{
        borderBottomColor: 'black',
        borderBottomWidth: 1,
    },
    resultText:{
        marginLeft: 15,
    }
});

export default AuthForm