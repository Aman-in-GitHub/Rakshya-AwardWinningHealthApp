import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Linking,
  NativeModules,
} from 'react-native';

const {MyTTSModule} = NativeModules;

import Icon from 'react-native-vector-icons/Feather';

const HospitalList = ({hospitals, isDarkMode, makePhoneCall}) => {
  const renderItem = ({item, index}) => (
    <View
      style={{
        width: 250,
        height: 167,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: index === hospitals.length - 1 ? 0 : 11.68,
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#232323' : '#F4F4F4',
      }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: isDarkMode ? 'white' : 'black',
        }}>
        {item.name}
      </Text>
      <View className="flex flex-row my-1">
        <Text
          style={{
            fontSize: 16,
            marginRight: 9,
            color: isDarkMode ? 'white' : 'black',
          }}>
          {item.distance.toFixed(2)} km away
        </Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(
              `google.navigation:q=${item.latitude},${item.longitude}`,
            );
          }}>
          <Icon
            name="map"
            size={23}
            color={isDarkMode ? '#FF4263' : '#800000'}
          />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row mb-1">
        <Text
          style={{
            fontSize: 16,
            marginRight: 9,
            color: isDarkMode ? 'white' : 'black',
          }}>
          Time: {item.time}
        </Text>
        <TouchableOpacity
          onPress={() => MyTTSModule.speak(`${item.name} is currently open.`)}>
          <Icon
            name="clock"
            size={22}
            color={isDarkMode ? '#FF4263' : '#800000'}
          />
        </TouchableOpacity>
      </View>
      <View className="flex flex-row">
        <Text
          style={{
            fontSize: 16,
            marginRight: 9,
            color: isDarkMode ? 'white' : 'black',
          }}>
          Contact: {item.phoneNumber}
        </Text>
        <TouchableOpacity onPress={() => makePhoneCall(item.phoneNumber)}>
          <Icon
            name="phone"
            size={22}
            color={isDarkMode ? '#FF4263' : '#800000'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      horizontal
      data={hospitals}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default HospitalList;
