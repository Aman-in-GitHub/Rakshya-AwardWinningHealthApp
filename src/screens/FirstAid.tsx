import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  NativeModules,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useRoute} from '@react-navigation/native';

const {MyTTSModule, MySpeechRecognizer} = NativeModules;

import Snackbar from 'react-native-snackbar';

import Icon from 'react-native-vector-icons/Feather';

import emergencyData from '../../data';

export default function FirstAid({navigation}) {
  const route = useRoute();
  const queryIs = route.params.queryIs;
  const darkMode = route.params.mode;
  const [query, setQuery] = useState(queryIs);
  const [results, setResults] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [found, setFound] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(darkMode);
  const [firstAid, setFirstAid] = useState('');

  const tapCounter = useRef(0);

  function readOutLoud(text) {
    setIsReading(prev => !prev);
    if (!isReading) {
      MyTTSModule.speak(text)
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      MyTTSModule.stopSpeech();
    }
  }

  useEffect(() => {
    if (query === '') {
      setResults([]);
      setFound(true);
      setIsReading(false);
      MyTTSModule.stopSpeech();
      setFirstAid('');
    }
  }, [query]);

  useEffect(() => {
    handleSearch();
    return () => {
      MyTTSModule.stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      let aid = '';
      results.map(item => {
        aid += item.firstAid;
      });
      setFirstAid(aid);
    }
  }, [results]);

  function handleVoiceRecognition() {
    if (isReading) {
      setIsReading(false);
      MyTTSModule.stopSpeech();
    }

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
        if (lowerCaseText.startsWith('help')) {
          const queryWithoutSearch = recognizedText.substring(5);

          navigation.replace('FirstAid', {
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
        } else if (
          lowerCaseText === 'start' ||
          lowerCaseText === 'speak' ||
          lowerCaseText === 'start speaking'
        ) {
          readOutLoud(firstAid);
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
      const searchResults = emergencyData.filter(emergency =>
        queryKeywords.some(keyword =>
          emergency.name
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
        setFirstAid('');
      }
    } else {
      setResults([]);
      setFirstAid('');
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
            First Aid
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (firstAid) {
                readOutLoud(firstAid);
              }
            }}>
            {isReading ? (
              <Icon
                name="volume-x"
                size={28}
                color={isDarkMode ? '#FF4263' : '#800000'}
              />
            ) : (
              <Icon
                name="volume-2"
                size={28}
                color={isDarkMode ? '#FF4263' : '#800000'}
              />
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      <View className="mx-3">
        <View
          className="flex h-[55px] rounded-sm flex-row items-center my-3"
          style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
          <TextInput
            className="text-[12px] px-3 text-lg  w-[88%]"
            placeholder="What's your emergency?"
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
            keyExtractor={item => item.emergency}
            showsVerticalScrollIndicator={false}
            style={{marginBottom: 155}}
            renderItem={({item}) => {
              const parts = item.firstAid.split('\n\n');

              const firstBlock = parts[0];

              const restOfText = parts.slice(1).join('\n\n');

              return (
                <View>
                  <Text
                    className="mb-4 text-[25px] font-bold text-center border-b-[3px] pb-2"
                    style={{
                      color: isDarkMode ? 'white' : 'black',
                      borderColor: isDarkMode ? '#FF4263' : '#800000',
                    }}>
                    {firstBlock}
                  </Text>

                  <Text
                    className="text-lg"
                    style={{color: isDarkMode ? 'white' : 'black'}}>
                    {restOfText}
                  </Text>
                </View>
              );
            }}
          />
        ) : (
          <View className="absolute top-[350%] left-[15%]">
            <Text
              className="text-2xl font-bold text-center"
              style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
              No First Aid found :(
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
