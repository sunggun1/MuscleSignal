import {  SafeAreaView, StyleSheet } from 'react-native'
import React from 'react'
import AuthForm from '../components/AuthForm';

import { fetchSignup } from '../redux/slices/authSlice';

const SignupScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
        <AuthForm onSubmit={fetchSignup} screenName='Signup' buttonText='Signup' bottomText='Already have an account? Log in' bottomTextNavigateScreenName="Login"/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        marginTop: 100
    } 
});

export default SignupScreen;