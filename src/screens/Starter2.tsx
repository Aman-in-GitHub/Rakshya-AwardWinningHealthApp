import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

export default function Starter2({navigation}) {
  return (
    <View style={{flex: 1, backgroundColor: '#800000'}}>
      <Text className="mt-5 mb-8 text-5xl font-bold text-center text-white">
        Instructions
      </Text>
      <View className="mx-3">
        <Text className="text-[20px] mb-3 text-white">
          1) Allow all the permissions for this app
        </Text>
        <Text className="text-[20px] mb-3 text-white">
          2) Double tap to activate the voice control
        </Text>
        <Text className="text-[20px] mb-3 text-white">
          3) Jerk the phone once to activate panic mode
        </Text>
        <Text className="text-[14px] text-center mb-3 text-white">OR</Text>
        <Text className="text-[20px] mb-3 text-white">
          Click the panic button 5 times simultaneously to active panic mode
        </Text>
        <Text className="text-[20px] mb-3 text-white">
          4) Restart the app once after initial setup
        </Text>
        <Text className="text-[20px]">
          5) Download offline Google Maps of your area to get the directions to
          the hospitals/medicals nearby (Optional)
        </Text>
      </View>

      <View className="flex flex-row items-end justify-between mt-[80px] mx-7">
        <TouchableOpacity
          className=" bg-[#9e4141] rounded-sm"
          onPress={() => navigation.goBack()}>
          <Text className="px-5 py-1 text-xl text-white">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#9e4141] rounded-sm"
          onPress={() => navigation.navigate('Starter3')}>
          <Text className="px-5 py-1 text-xl text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
