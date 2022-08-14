import {  SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import AuthForm from '../components/AuthForm';
import { fetchSignin } from '../redux/slices/authSlice';


const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
        <AuthForm onSubmit={fetchSignin} screenName='Login' buttonText='Login' bottomText='New to MuscleTech? Sign up' bottomTextNavigateScreenName="Signup"/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        marginTop: 100
    },
    
});

export default LoginScreen