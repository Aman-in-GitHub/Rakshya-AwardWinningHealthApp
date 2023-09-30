import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  NativeModules,
  Vibration,
  Linking,
  StatusBar,
  Keyboard,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import Panic from '../components/Panic';

import HospitalList from '../components/HospitalList';

import Geolocation from 'react-native-geolocation-service';

import NetInfo from '@react-native-community/netinfo';

import ShakeDetectionModule from '../../ShakeDetectionModule';

import Snackbar from 'react-native-snackbar';

import Icon from 'react-native-vector-icons/Feather';

const {MyTTSModule, MySpeechRecognizer, MySms} = NativeModules;

import AsyncStorage from '@react-native-async-storage/async-storage';

import Clipboard from '@react-native-clipboard/clipboard';

import hospital from '../../medic/hospital';

import medical from '../../medic/medical';

let nearHospitals = '';

const HomePage = ({navigation}) => {
  const [query, setQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hospitals, setHospitals] = useState(null);
  const [name, setName] = useState('User');
  const [isPanic, setIsPanic] = useState(false);
  const [panicCount, setPanicCount] = useState(5);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [showMedic, setShowMedic] = useState('hospital');
  const [shouldSpeak, setShouldSpeak] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const scaleValue = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      startPulseAnimation();
    });
  };

  useEffect(() => {
    startPulseAnimation();
  }, []);

  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const tapCounter = useRef(0);

  useEffect(() => {
    getStoredThemePreference();
  }, []);

  useEffect(() => {
    ShakeDetectionModule.startShakeDetection();

    ShakeDetectionModule.addShakeListener(handleShake);
  }, []);

  useEffect(() => {
    if (isPanic) {
      if (showMedic == 'medical') {
        setShowMedic('hospital');
      }

      const vibarting = setInterval(() => {
        Vibration.vibrate(1000);
      }, 1000);

      const panicTimer = setInterval(() => {
        setPanicCount(prevCount => prevCount - 1);

        if (panicCount === 0) {
          clearInterval(panicTimer);
          setIsPanic(false);
          setPanicCount(5);
          makeEmergencyCall();
        }
      }, 1000);

      return () => {
        clearInterval(panicTimer);
        clearInterval(vibarting);
      };
    }
  }, [isPanic, panicCount]);

  const greet = useMemo(() => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    let greeting;

    if (currentHour < 12) {
      greeting = 'Good Morning';
    } else if (currentHour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }
    return greeting;
  }, []);

  useEffect(() => {
    async function getNameOf() {
      const nameOf = await AsyncStorage.getItem('NAME');
      if (nameOf.includes(' ')) {
        const [fname, lname] = nameOf.split(' ');
        setName(fname);
      } else {
        setName(nameOf);
      }
    }

    getNameOf();

    async function getNumbersOf() {
      const numberOf = await AsyncStorage.getItem('NUMBERS');
      setPhoneNumbers(JSON.parse(numberOf));
    }

    getNumbersOf();
  }, []);

  useEffect(() => {
    return () => {
      MyTTSModule.stopSpeech();
    };
  }, []);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        handleGetLocation();
      } else {
        retrieveLocationFromLocalStorage();
      }
    });
  }, []);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
      },
      error => {
        console.error('Location error:', error);
      },
      {enableHighAccuracy: true, timeout: 5000, maximumAge: 10000},
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    const check = showMedic == 'hospital' ? hospital : medical;

    const currentTime = getCurrentTime();

    const hospitalsWithDistances = check
      .map(item => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          item.latitude,
          item.longitude,
        );

        return {...item, distance};
      })
      .filter(item => {
        if (item.time == 'Open 24 hours') return true;

        const timeParts = item.time.split('-');

        const [openTime, openAmPm] = timeParts[0].split(' ');
        const [closeTime, closeAmPm] = timeParts[1].split(' ');

        const [openHoursStr, openMinutesStr] = openTime
          .split(':')
          .map(str => str.trim());
        const [closeHoursStr, closeMinutesStr] = closeTime
          .split(':')
          .map(str => str.trim());

        const openHours = parseInt(openHoursStr, 10);
        const openMinutes = openMinutesStr ? parseInt(openMinutesStr, 10) : 0;
        const closeHours = parseInt(closeHoursStr, 10);
        const closeMinutes = closeMinutesStr
          ? parseInt(closeMinutesStr, 10)
          : 0;

        let openTimeInMinutes = openHours * 60 + openMinutes;
        let closeTimeInMinutes = closeHours * 60 + closeMinutes;

        if (openAmPm === 'p.m.') {
          openTimeInMinutes += 12 * 60;
        }
        if (closeAmPm === 'p.m.') {
          closeTimeInMinutes += 12 * 60;
        }

        const currentTimeInMinutes =
          currentTime.hours * 60 + currentTime.minutes;

        return (
          currentTimeInMinutes >= openTimeInMinutes &&
          currentTimeInMinutes <= closeTimeInMinutes
        );
      })
      .sort((a, b) => a.distance - b.distance);

    const nearestHospitals = hospitalsWithDistances.slice(0, 5);

    setHospitals(nearestHospitals);
  }, [currentLocation, showMedic]);

  useEffect(() => {
    async function setMode() {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }

    setMode();
  }, [isDarkMode]);

  useEffect(() => {
    if (shouldSpeak) {
      setIsMicOn(false);
      if (hospitals) {
        const facilityType = showMedic === 'hospital' ? 'Hospital' : 'Medical';

        nearHospitals = `${facilityType}s near you are `;

        for (let i = 0; i < hospitals.length; i++) {
          if (hospitals[i].name) {
            const position =
              i === 0
                ? 'First'
                : i === 1
                ? 'Second'
                : i === 2
                ? 'Third'
                : i === 3
                ? 'Fourth'
                : 'and Fifth';

            nearHospitals += `${position} ${facilityType}: ${
              hospitals[i].name
            } which is ${hospitals[i].distance.toFixed(
              2,
            )} kilometers away from you `;
          }
        }
      } else {
        nearHospitals = `There are no ${
          showMedic === 'hospital' ? 'hospitals' : 'medicals'
        } near you! Try turning your location on.`;
      }

      MyTTSModule.speak(nearHospitals);
      setShouldSpeak(false);
    }
  }, [shouldSpeak, showMedic, hospitals]);

  const animatedStyle = {
    transform: [{scale: scaleValue}],
  };

  function makePhoneCall(num) {
    Linking.openURL(`tel:${num}`);
  }

  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return {hours, minutes};
  }

  const handleShake = isPanicActivated => {
    if (isPanicActivated) {
      setIsPanic(true);
      navigation.navigate('InitialRoute');
    }
  };

  const storeThemePreference = async isDarkMode => {
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error storing theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    await storeThemePreference(newIsDarkMode);
  };

  const getStoredThemePreference = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('isDarkMode');
      if (storedTheme !== null) {
        setIsDarkMode(JSON.parse(storedTheme));
      }
    } catch (error) {
      console.error('Error retrieving theme preference:', error);
    }
  };

  const handleGetLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({latitude, longitude});
          const locationMessage = `${latitude}, ${longitude}`;
          resolve(locationMessage);
        },
        error => {
          console.error('Location error:', error);
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    });
  };

  const retrieveLocationFromLocalStorage = async () => {
    try {
      const storedLocationJSON = await AsyncStorage.getItem('storedLocation');
      if (storedLocationJSON) {
        const storedLocation = JSON.parse(storedLocationJSON);
        setCurrentLocation(storedLocation);
        console.log(storedLocationJSON);
      } else {
        console.log('No stored location found.');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving stored location:', error);
      return null;
    }
  };

  const makeEmergencyCall = async () => {
    try {
      let locationMessage = '';
      if (currentLocation) {
        locationMessage = `SOS\nHelp! I am in danger\nMy Current Location is: https://www.google.com/maps/dir/?api=1&destination=${currentLocation.latitude},${currentLocation.longitude}`;
      } else {
        locationMessage = await handleGetLocation();
      }

      if (locationMessage) {
        const promises = phoneNumbers.map(async phoneNumber => {
          const response = await MySms.sendSOS(phoneNumber, locationMessage);
          console.log(response);
        });
        await Promise.all(promises);
        console.log(phoneNumbers, locationMessage);
      } else {
        console.error('Location message not available');
      }

      try {
        makePhoneCall(hospitals[0].phoneNumber);
      } catch (error) {
        makePhoneCall('102');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  function handleDoubleTap() {
    if (Keyboard) {
      Keyboard.dismiss();
    }

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

  function handleClick() {
    if (query == '') {
      Snackbar.show({
        text: `Please enter your emergency`,
        duration: Snackbar.LENGTH_SHORT,
        textColor: 'white',
        backgroundColor: isDarkMode ? '#FF4263' : '#800000',
      });
      return;
    }
    navigation.navigate('FirstAid', {
      queryIs: query,
      mode: isDarkMode,
    });
  }

  function handleVoiceRecognition() {
    MyTTSModule.stopSpeech();

    setTimeout(() => {
      Vibration.vibrate(200);

      setIsMicOn(true);
    }, 400);

    MySpeechRecognizer.startVoiceRecognition((error, recognizedText) => {
      if (error) {
        Snackbar.show({
          text: `Sorry :( Couldn't hear that`,
          duration: Snackbar.LENGTH_SHORT,
          textColor: 'white',
          backgroundColor: isDarkMode ? '#FF4263' : '#800000',
        });

        setIsMicOn(false);
      } else {
        const lowerCaseText = recognizedText.toString().toLowerCase();
        if (lowerCaseText.startsWith('help')) {
          const queryWithoutSearch = recognizedText.substring(5);

          setQuery(queryWithoutSearch);
          setIsMicOn(false);

          navigation.navigate('FirstAid', {
            queryIs: queryWithoutSearch,
            mode: isDarkMode,
          });
        } else if (lowerCaseText === 'turn on dark mode') {
          setIsMicOn(false);

          setIsDarkMode(true);
        } else if (lowerCaseText === 'turn on light mode') {
          setIsMicOn(false);

          setIsDarkMode(false);
        } else if (
          hospitals &&
          (lowerCaseText === 'what are hospitals near me' ||
            lowerCaseText === 'hospitals near me' ||
            lowerCaseText === 'what hospitals are near me' ||
            lowerCaseText === 'which hospitals are near me')
        ) {
          if (showMedic == 'medical') {
            setShowMedic('hospital');
          }
          setShouldSpeak(true);
        } else if (
          hospitals &&
          (lowerCaseText === 'what are medicals near me' ||
            lowerCaseText === 'medicals near me' ||
            lowerCaseText === 'what medicals are near me' ||
            lowerCaseText === 'which medicals are near me')
        ) {
          if (showMedic == 'hospital') {
            setShowMedic('medical');
          }
          setShouldSpeak(true);
        } else if (
          lowerCaseText === 'how to give a cpr' ||
          lowerCaseText === 'how to give cpr' ||
          lowerCaseText === 'cpr' ||
          lowerCaseText === 'how do i give a cpr'
        ) {
          setIsMicOn(false);

          navigation.navigate('CPR', {
            mode: isDarkMode,
          });
        } else if (
          lowerCaseText === 'how to apply stitches' ||
          lowerCaseText === 'how do i apply stitches' ||
          lowerCaseText === 'stitches'
        ) {
          setIsMicOn(false);

          navigation.navigate('Stitches', {
            mode: isDarkMode,
          });
        } else if (
          lowerCaseText === 'how to stop stitches' ||
          lowerCaseText === 'how do i stop choking' ||
          lowerCaseText === 'choking'
        ) {
          setIsMicOn(false);

          navigation.navigate('Choking', {
            mode: isDarkMode,
          });
        } else if (
          lowerCaseText === 'how to stop bleeding' ||
          lowerCaseText === 'how do i stop bleeding' ||
          lowerCaseText === 'bleeding'
        ) {
          setIsMicOn(false);

          navigation.navigate('Bleeding', {
            mode: isDarkMode,
          });
        } else if (
          lowerCaseText === 'show hospitals near me' ||
          lowerCaseText === 'show hospitals'
        ) {
          setIsMicOn(false);

          if (showMedic == 'hospital') return;
          setShowMedic('hospital');
        } else if (
          lowerCaseText === 'show medicals near me' ||
          lowerCaseText === 'show medicals'
        ) {
          setIsMicOn(false);

          if (showMedic == 'medical') return;
          setShowMedic('medical');
        } else if (
          lowerCaseText === 'call police' ||
          lowerCaseText === 'call the police'
        ) {
          setIsMicOn(false);
          makePhoneCall('100');
        } else if (
          lowerCaseText === 'call ambulance' ||
          lowerCaseText === 'call a ambulance' ||
          lowerCaseText === 'call an ambulance' ||
          lowerCaseText === 'call the ambulance'
        ) {
          setIsMicOn(false);
          makePhoneCall('102');
        } else if (
          lowerCaseText === 'call fire brigade' ||
          lowerCaseText === 'call a fire brigade' ||
          lowerCaseText === 'call the fire brigade'
        ) {
          setIsMicOn(false);
          makePhoneCall('101');
        } else if (
          lowerCaseText === 'what is my location' ||
          lowerCaseText === 'where am i'
        ) {
          setIsMicOn(false);
          MyTTSModule.speak(
            `Your current location is ${currentLocation.latitude} latitude, ${currentLocation.longitude} longitude`,
          );
        } else {
          Snackbar.show({
            text: `Sorry :( Couldn't decode that`,
            duration: Snackbar.LENGTH_SHORT,
            textColor: 'white',
            backgroundColor: isDarkMode ? '#FF4263' : '#800000',
          });
          setIsMicOn(false);
        }
      }
    });
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    // Haversine formula

    const R = 6371;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance;
  }

  const handleTap = () => {
    const QUICK_TAP_DELAY = 400;
    const REQUIRED_TAPS = 5;

    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTimeRef.current;

    if (timeSinceLastTap <= QUICK_TAP_DELAY) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }

    lastTapTimeRef.current = currentTime;

    if (tapCountRef.current === REQUIRED_TAPS) {
      if (showMedic == 'medical') {
        setShowMedic('hospital');
      }

      setIsPanic(true);

      tapCountRef.current = 0;
    }
  };

  function cancelPanic() {
    setIsPanic(false);
    setPanicCount(5);
  }

  async function copyToClipboard() {
    if (!currentLocation) return;
    Clipboard.setString(
      `https://www.google.com/maps/search/?api=1&query=${currentLocation.latitude},${currentLocation.longitude}`,
    );

    const loc = `Your current location is: ` + (await Clipboard.getString());
    Snackbar.show({
      text: loc,
      numberOfLines: 2,
      duration: Snackbar.LENGTH_LONG,
      textColor: 'white',
      backgroundColor: isDarkMode ? '#FF4263' : '#800000',
    });
  }

  return (
    <SafeAreaView
      style={{
        height: '100%',
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
      }}>
      {isPanic ? <Panic count={panicCount} click={cancelPanic} /> : null}
      {isPanic ? (
        <StatusBar backgroundColor="#800000" barStyle="light-content" />
      ) : (
        <StatusBar
          backgroundColor={isDarkMode ? '#232323' : '#F4F4F4'}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
      )}
      <View
        className="flex flex-row items-center justify-between h-16 px-4"
        style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
        <View>
          <Image
            source={require('../../assets/logo.png')}
            className="w-[50px]"
            style={{objectFit: 'contain'}}
          />
        </View>
        <TouchableOpacity
          className="absolute right-20"
          onPress={copyToClipboard}>
          <Icon
            name="map-pin"
            size={29}
            color={isDarkMode ? '#FF4263' : '#800000'}
          />
        </TouchableOpacity>
        {isDarkMode ? (
          <TouchableOpacity onPress={toggleTheme}>
            <Icon
              name="sun"
              size={33}
              color={isDarkMode ? '#FF4263' : '#800000'}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleTheme}>
            <Icon
              name="moon"
              size={33}
              color={isDarkMode ? '#FF4263' : '#800000'}
            />
          </TouchableOpacity>
        )}
      </View>
      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View className="mx-3">
          <View className="my-3">
            <Text
              className="text-4xl"
              style={{color: isDarkMode ? 'white' : 'black'}}>
              {greet}
            </Text>
            <Text
              className="text-5xl font-semibold "
              style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
              {name}
            </Text>
          </View>
          <View
            className="flex h-[55px] rounded-sm flex-row items-center"
            style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
            <TextInput
              className="text-[12px] px-3 text-lg  w-[88%]"
              placeholder="What's your emergency?"
              placeholderTextColor={'#875353'}
              value={query}
              onChangeText={text => setQuery(text)}
              style={{color: isDarkMode ? '#ffffff' : '#000000'}}
            />
            <TouchableOpacity onPress={handleClick}>
              <Icon
                name="search"
                size={30}
                color={isDarkMode ? '#FF4263' : '#800000'}
              />
            </TouchableOpacity>
          </View>

          <View className="mt-3 mb-2 text-[12px]">
            <Text style={{color: isDarkMode ? 'white' : 'black'}}>
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>Q</Text>
              uick{' '}
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>A</Text>
              ction
            </Text>
          </View>
          <View className="flex flex-row flex-wrap mb-3">
            <TouchableOpacity
              className="flex justify-center items-center h-28 w-28 absolute top-[28%] left-[33%] z-50 rounded-full"
              style={{
                backgroundColor: isDarkMode ? '#232323' : '#F4F4F4',
                borderWidth: 3,
                borderColor: isDarkMode ? '#FF4263' : '#800000',
              }}
              onPress={handleTap}>
              <Text
                className="text-center text-[25px] font-bold"
                style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
                Panic
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('CPR', {
                  mode: isDarkMode,
                });
              }}
              className="flex items-center justify-center w-40 h-32 mb-5 mr-5 rounded-sm"
              style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
              <Text
                className="text-2xl text-center"
                style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
                CPR
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Stitches', {
                  mode: isDarkMode,
                });
              }}
              className="flex items-center justify-center w-40 h-32 rounded-sm"
              style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
              <Text
                className="text-2xl text-center"
                style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
                Stitches
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Choking', {
                  mode: isDarkMode,
                });
              }}
              className="flex items-center justify-center w-40 h-32 mr-5 rounded-sm"
              style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
              <Text
                className="text-2xl text-center"
                style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
                Choking
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Bleeding', {
                  mode: isDarkMode,
                });
              }}
              className="flex items-center justify-center w-40 h-32 rounded-sm"
              style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
              <Text
                className="text-2xl text-center"
                style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
                Bleeding
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View className="flex flex-row items-center justify-between">
        <View className="mb-2 text-[12px] mx-3">
          <TouchableOpacity
            onPress={() => {
              if (showMedic == 'hospital') return;
              setShowMedic('hospital');
            }}>
            <Text
              style={{
                color: isDarkMode ? 'white' : 'black',
                borderBottomColor: isDarkMode
                  ? showMedic == 'hospital'
                    ? '#FF4263'
                    : 'transparent'
                  : showMedic == 'hospital'
                  ? '#800000'
                  : 'transparent',
                borderBottomWidth: 3,
                paddingBottom: 1,
                opacity: showMedic == 'hospital' ? 1 : 0.5,
              }}
              className="text-[14px] font-bold">
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>H</Text>
              ospitals{' '}
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>N</Text>
              ear{' '}
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>Y</Text>
              ou
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mx-3 mb-2">
          <TouchableOpacity
            onPress={() => {
              if (showMedic == 'medical') return;
              setShowMedic('medical');
            }}>
            <Text
              style={{
                color: isDarkMode ? 'white' : 'black',
                borderBottomColor: isDarkMode
                  ? showMedic == 'medical'
                    ? '#FF4263'
                    : 'transparent'
                  : showMedic == 'medical'
                  ? '#800000'
                  : 'transparent',
                borderBottomWidth: 3,
                paddingBottom: 1,
                opacity: showMedic == 'medical' ? 1 : 0.5,
              }}
              className="text-[14px] font-bold">
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>M</Text>
              edicals{' '}
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>N</Text>
              ear{' '}
              <Text style={{color: isDarkMode ? '#FF4263' : '#800000'}}>Y</Text>
              ou
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mx-3">
        <HospitalList
          hospitals={hospitals}
          isDarkMode={isDarkMode}
          makePhoneCall={makePhoneCall}
        />
      </View>
      {isMicOn ? (
        <View className="absolute bottom-10 left-[40%]">
          <Animated.View
            style={[
              styles.pulse,
              animatedStyle,
              {backgroundColor: isDarkMode ? '#FF4263' : '#800000'},
            ]}>
            <View>
              <Icon name="mic" size={35} color={'white'} />
            </View>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pulse: {
    width: 80,
    height: 80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1000000,
  },
});

export default HomePage;
