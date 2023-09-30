import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  NativeModules,
  StatusBar,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useRoute} from '@react-navigation/native';

const {MyTTSModule, MySpeechRecognizer} = NativeModules;

import Snackbar from 'react-native-snackbar';

import Icon from 'react-native-vector-icons/Feather';

import doctorData from '../../doctor';

export default function Doctor({navigation}) {
  const route = useRoute();
  const queryIs = route.params.queryIs;
  const darkMode = route.params.mode;
  const [query, setQuery] = useState(queryIs);
  const [results, setResults] = useState([]);
  const [found, setFound] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(darkMode);

  const tapCounter = useRef(0);

  useEffect(() => {
    if (query === '') {
      setFound(true);
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    handleSearch();
    return () => {
      MyTTSModule.stopSpeech();
    };
  }, []);

  function handleVoiceRecognition() {
    MySpeechRecognizer.startVoiceRecognition((error, recognizedText) => {
      if (error) {
        Snackbar.show({
          text: `Sorry :( Couldn't hear that`,
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'white',
          backgroundColor: isDarkMode ? '#FF4263' : '#800000',
        });
      } else {
        const lowerCaseText = recognizedText.toString().toLowerCase();
        if (lowerCaseText.startsWith('doctor for')) {
          const queryWithoutSearch = recognizedText.substring(11);

          navigation.replace('Doctor', {
            queryIs: queryWithoutSearch,
            mode: isDarkMode,
          });
        } else if (
          lowerCaseText === 'go back' ||
          lowerCaseText === 'go home' ||
          lowerCaseText === 'go to home' ||
          lowerCaseText === 'go to home page' ||
          lowerCaseText === 'go to homepage'
        ) {
          navigation.goBack();
        } else {
          Snackbar.show({
            text: `Sorry :( Couldn't decode that`,
            duration: Snackbar.LENGTH_SHORT,
            textColor: 'white',
            backgroundColor: isDarkMode ? '#FF4263' : '#800000',
          });
        }
      }
    });
  }

  const handleSearch = () => {
    if (query) {
      const queryKeywords = query
        .toLowerCase()
        .split(' ')
        .map(keyword => keyword.trim());
      const searchResults = doctorData.filter(need =>
        queryKeywords.some(keyword =>
          need.name
            .toLowerCase()
            .split(',')
            .some(nameKeyword => nameKeyword.trim() === keyword.toLowerCase()),
        ),
      );

      if (searchResults.length > 0) {
        setFound(true);
        setResults(searchResults);
      } else {
        setFound(false);
      }
    } else {
      setResults([]);
    }
  };

  function handleDoubleTap() {
    const now = new Date().getTime();
    const DOUBLE_PRESS_DELAY = 300;
    if (
      tapCounter.current === 0 ||
      now - tapCounter.current > DOUBLE_PRESS_DELAY
    ) {
      tapCounter.current = now;
    } else if (
      tapCounter.current &&
      now - tapCounter.current <= DOUBLE_PRESS_DELAY
    ) {
      tapCounter.current = 0;
      handleVoiceRecognition();
    }
  }

  function makePhoneCall(num) {
    Linking.openURL(`tel:${num}`);
  }

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: isDarkMode ? '#121212' : '#ffffff'}}>
      <StatusBar
        backgroundColor={isDarkMode ? '#232323' : '#F4F4F4'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View
          className="flex flex-row items-center justify-between h-16 px-4"
          style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="chevron-left"
              size={30}
              color={isDarkMode ? '#FF4263' : '#800000'}
            />
          </TouchableOpacity>
          <Text
            className="text-3xl font-bold"
            style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
            Doctors
          </Text>
          <View></View>
        </View>
      </TouchableWithoutFeedback>

      <View className="mx-3">
        <View
          className="flex h-[55px] rounded-sm flex-row items-center my-3"
          style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
          <TextInput
            className="text-[12px] px-3 text-lg  w-[88%]"
            placeholder="What doctor do you want?"
            placeholderTextColor={'#875353'}
            value={query}
            onChangeText={text => setQuery(text)}
            style={{color: isDarkMode ? '#ffffff' : '#000000'}}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon
              name="search"
              size={30}
              color={isDarkMode ? '#FF4263' : '#800000'}
            />
          </TouchableOpacity>
        </View>

        {found ? (
          <FlatList
            data={results}
            keyExtractor={item => item.contact}
            showsVerticalScrollIndicator={false}
            style={{marginBottom: 143}}
            renderItem={({item, index}) => {
              return (
                <>
                  <View
                    style={{
                      height: index === 0 ? 'full' : 0,
                    }}>
                    <Text
                      className="text-3xl text-center font-bold border-b-[3px] mb-3"
                      style={{
                        color: isDarkMode ? '#FF4263' : '#800000',
                        borderColor: isDarkMode ? '#FF4263' : '#800000',
                      }}>
                      {results[0].need}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: isDarkMode ? '#232323' : '#F4F4F4',
                      marginBottom: 13,
                    }}
                    className="flex flex-col px-8 py-4">
                    <View className="flex flex-row items-center">
                      <Icon
                        name="user"
                        size={25}
                        color={isDarkMode ? '#FF4263' : '#800000'}
                      />
                      <Text
                        style={{
                          color: isDarkMode ? 'white' : 'black',
                        }}
                        className="mb-1 ml-2 text-2xl">
                        {item.info}
                      </Text>
                    </View>

                    <View className="flex flex-row items-center">
                      <Icon
                        name="briefcase"
                        size={25}
                        color={isDarkMode ? '#FF4263' : '#800000'}
                      />
                      <Text
                        style={{
                          color: isDarkMode ? 'white' : 'black',
                        }}
                        className="mb-1 ml-3 text-2xl">
                        {item.post}
                      </Text>
                    </View>

                    <View className="flex flex-row items-center">
                      <TouchableOpacity
                        onPress={() => makePhoneCall(item.contact)}>
                        <Icon
                          name="phone"
                          size={24}
                          color={isDarkMode ? '#FF4263' : '#800000'}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          color: isDarkMode ? 'white' : 'black',
                        }}
                        className="mb-1 ml-3 text-2xl">
                        {item.contact}
                      </Text>
                    </View>
                  </View>
                </>
              );
            }}
          />
        ) : (
          <View className="absolute top-[350%] left-[15%]">
            <Text
              className="text-2xl font-bold text-center"
              style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
              No Doctors found :(
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
