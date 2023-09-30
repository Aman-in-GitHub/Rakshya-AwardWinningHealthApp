import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import registerBackgroundService from '../BackgroundTask';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './screens/SplashScreen';
import Starter1 from './screens/Starter1';
import Starter2 from './screens/Starter2';
import Starter3 from './screens/Starter3';
import HomePage from './screens/HomePage';
import CPR from './screens/CPR';
import Stitches from './screens/Stitches';
import Choking from './screens/Choking';
import Bleeding from './screens/Bleeding';
import FirstAid from './screens/FirstAid';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isSigned, setIsSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkIsSigned() {
      const name = await AsyncStorage.getItem('NAME');

      if (name) {
        setIsSigned(true);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 750);
    }

    checkIsSigned();
  }, []);

  useEffect(() => {
    registerBackgroundService();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InitialRoute">
        <Stack.Screen
          name="InitialRoute"
          component={isLoading ? SplashScreen : isSigned ? HomePage : Starter1}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Starter1"
          component={Starter1}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Starter2"
          component={Starter2}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Starter3"
          component={Starter3}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={({navigation}) => ({
            headerShown: false,
            gestureEnabled: false,
            animation: 'none',
            stackPresentation: 'push',
            replaceAnimation: 'pop',
          })}
        />
        <Stack.Screen
          name="CPR"
          component={CPR}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Stitches"
          component={Stitches}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Choking"
          component={Choking}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Bleeding"
          component={Bleeding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="FirstAid"
          component={FirstAid}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
