/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store/store';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MusclePositionScreen from './src/screens/MusclePositionScreen';
import MuscleDetailScreen from './src/screens/MuscleDetailScreen';
import {RouteProp} from '@react-navigation/native'

type RootStackParamList = {
  Login: undefined;
  Signup : undefined;
  MusclePosition : undefined;
  MuscleDetail : {
    positionName : string;
    musclePositionId : string;
  }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootRouteProps<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;

const App = () => {
  return(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='MusclePosition'>
          {/* <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }}/> */}
          <Stack.Screen name="MusclePosition" component={MusclePositionScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>  
    </Provider>
  );
};

export default App;
