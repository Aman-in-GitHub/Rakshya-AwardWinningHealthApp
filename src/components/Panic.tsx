import {View, Text, TouchableOpacity, Vibration} from 'react-native';
import React, {useState, useEffect} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Panic(props) {
  return (
    <SafeAreaView className="bg-[#800000] flex h-screen justify-center items-center">
      <View>
        <Text className="text-white text-[28px] font-bold text-center">
          Sending SOS Messages
        </Text>

        <Text className="text-9xl my-8 text-center">{props.count}</Text>

        <TouchableOpacity
          className="flex justify-center items-center bg-white w-32 mx-auto h-12 rounded-full"
          onPress={() => props.click()}>
          <Text className="text-2xl font-bold text-[#800000]">Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
