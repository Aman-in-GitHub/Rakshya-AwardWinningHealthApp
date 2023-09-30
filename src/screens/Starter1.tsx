import {View, Text, TouchableOpacity, StatusBar, Image} from 'react-native';
import React from 'react';

export default function Starter1({navigation}) {
  return (
    <>
      <StatusBar backgroundColor="#800000" />
      <View className="flex relative items-center justify-center h-screen bg-[#800000]">
        <View className="absolute top-[10%]">
          <Image
            source={require('../../assets/logoHome.png')}
            className="w-[280px] border-2"
            style={{objectFit: 'contain'}}
          />
        </View>
        <View className="absolute top-[60%]">
          <Text className="text-5xl text-center text-white">Rakshya</Text>
          <Text
            style={{fontFamily: 'cursive', fontWeight: 'bold'}}
            className="text-xl text-white">
            Because Google is not a Doctor
          </Text>
        </View>

        <TouchableOpacity
          className="absolute bg-[#9e4141] rounded-sm bottom-12 right-7"
          onPress={() => navigation.navigate('Starter2')}>
          <Text className="px-5 py-1 text-xl text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
