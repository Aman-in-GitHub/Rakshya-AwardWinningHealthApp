import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import Snackbar from 'react-native-snackbar';

const array = [];

export default function Starter3({navigation}) {
  const [name, setName] = useState('');
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [number3, setNumber3] = useState('');
  const [permissionsEnabled, setPermissionsEnabled] = useState('no');

  useEffect(() => {
    requestPermissions();
  }, []);

  async function requestPermissions() {
    try {
      const permissionsToRequest = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.CALL_PHONE,
        PERMISSIONS.ANDROID.SEND_SMS,
      ];

      for (const permission of permissionsToRequest) {
        const req = await request(permission);
      }

      const results = await Promise.all([
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION),
        request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION),
        request(PERMISSIONS.ANDROID.RECORD_AUDIO),
        request(PERMISSIONS.ANDROID.CALL_PHONE),
        request(PERMISSIONS.ANDROID.SEND_SMS),
      ]);

      const allPermissionsGranted = results.every(
        result => result === RESULTS.GRANTED,
      );

      if (allPermissionsGranted) {
        setPermissionsEnabled('yes');
      } else {
        setPermissionsEnabled('no');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setPermissionsEnabled('no');
    }
  }

  async function handleNumbers() {
    array.push(number1, number2, number3);

    await AsyncStorage.setItem('NUMBERS', JSON.stringify(array));
  }

  async function requestPermissionsAndContinue() {
    if (name.trim() === '' || !number1 || !number2 || !number3) {
      Snackbar.show({
        text: `Enter all the details to proceed`,
        duration: Snackbar.LENGTH_LONG,
        textColor: 'white',
        backgroundColor: '#FF4263',
      });
    } else if (number1.length < 8 || number2.length < 8 || number3.length < 8) {
      Snackbar.show({
        text: `Enter a valid contact`,
        duration: Snackbar.LENGTH_LONG,
        textColor: 'white',
        backgroundColor: '#FF4263',
      });
    } else if (permissionsEnabled === 'no') {
      Snackbar.show({
        text: `Enable all the permissions to proceed`,
        duration: Snackbar.LENGTH_LONG,
        textColor: 'white',
        backgroundColor: '#FF4263',
      });
      requestPermissions();
    } else {
      await AsyncStorage.setItem('NAME', name);

      handleNumbers();

      navigation.reset({
        index: 0,
        routes: [{name: 'HomePage'}],
      });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{flex: 1, backgroundColor: '#800000'}}>
        <Text className="mt-5 mb-5 text-5xl font-bold text-center text-white">
          Details
        </Text>
        <View className="mx-2">
          <TextInput
            placeholder="Enter your name"
            style={{
              borderBottomWidth: 2,
              borderBottomColor: 'white',
            }}
            className="px-3 mb-3 text-xl"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Enter emergency contact"
            style={{
              borderBottomWidth: 2,
              borderBottomColor: 'white',
            }}
            className="px-3 mb-3 text-xl"
            keyboardType="numeric"
            value={number1}
            onChangeText={setNumber1}
          />
          <TextInput
            placeholder="Enter emergency contact"
            style={{
              borderBottomWidth: 2,
              borderBottomColor: 'white',
            }}
            className="px-3 mb-3 text-xl"
            keyboardType="numeric"
            value={number2}
            onChangeText={setNumber2}
          />
          <TextInput
            placeholder="Enter emergency contact"
            style={{
              borderBottomWidth: 2,
              borderBottomColor: 'white',
            }}
            className="px-3 mb-3 text-xl"
            keyboardType="numeric"
            value={number3}
            onChangeText={setNumber3}
          />
          <View className="mx-1 mt-10">
            <Text className="text-lg">
              Note: The numbers you provide will be messaged your current
              location with an SOS message when you activate the panic button.
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-end justify-between mx-7 mt-[181px]">
          <TouchableOpacity
            className=" bg-[#9e4141] rounded-sm"
            onPress={() => navigation.goBack()}>
            <Text className="px-5 py-1 text-xl text-white">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className=" bg-[#9e4141] rounded-sm"
            onPress={requestPermissionsAndContinue}>
            <Text className="px-5 py-1 text-xl text-white">Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
