import {
  Text,
  View,
  Image,
  ScrollView,
  NativeModules,
  TouchableOpacity,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useRoute} from '@react-navigation/native';

import Icon from 'react-native-vector-icons/Feather';

import Snackbar from 'react-native-snackbar';

const {MyTTSModule, MySpeechRecognizer} = NativeModules;

export default function CPR({navigation}) {
  const route = useRoute();
  const darkMode = route.params.mode;
  const [isReading, setIsReading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(darkMode);

  const tapCounter = useRef(0);

  useEffect(() => {
    return () => {
      MyTTSModule.stopSpeech();
    };
  }, []);

  const content1 = `Step-1: Call the Emergency Services\n
If you find a person who is unresponsive, isn’t breathing, or
doesn’t have a pulse and you decide to do some form of CPR, you
should still immediately call your local emergency number before
you do anything else. CPR can revive people on occasion, but it
should be viewed as buying time until emergency personnel arrive
with appropriate equipment. If 2 or more people are available, 1
person should dial for help while the other begins CPR. If a
person is unresponsive because of suffocation (from drowning,
for example), then it's recommended to immediately begin CPR for
1 minute and then call your local emergency number. If the
victim is a child between the ages of 1 to 8 years, perform 5
cycles of chest compressions and rescue breathing before calling
emergency services if you are the only person available. This
should take roughly 2 minutes. Calling emergency services will
bring paramedics to the location. Typically, the dispatcher will
also be able to instruct you on how to perform CPR.

Step-2: Proceed to open the airway\n
If you're trained in CPR, confident of your abilities (not
rusty), and you've performed 30 chest compressions, then proceed
to open the person's airway using the head-tilt, chin-lift
technique, or the jaw-thrust if you suspect a neck/head/spine
injury. Put your palm on their forehead and gently tilt (extend)
their head back a little. Then, with your other hand, gently
lift the chin forward to open up their airway, making it easier
to give them oxygen. Take 5 to 10 seconds to check for normal
breathing. Look for chest motion, listen for breathing, and see
if you can feel the victim's breath on your cheek or ear. Note
that gasping is not considered to be normal breathing. If they
are already breathing, no breathing assistance is needed.
However, if they are still not breathing, then proceed to the
mouth-to-mouth breathing part of CPR. To perform the jaw-thrust
technique, sit above the person's head. Place one hand on each
side of the person's jaw and lift the jaw so that it is jutting
forward, as though the person has an underbite.

Step-3: Place your mouth over the victim's mouth\n
Once the person's head is tilted and their chin lifted, make
sure their mouth is free of any objects blocking their airway.
Then, use one hand to pinch the victim's nostrils closed and
cover their mouth completely with your own mouth. Form a
seal with your mouth so that no air can escape while you attempt
to give the victim a rescue breath. You should be aware that
mouth-to-mouth CPR can transfer infectious viral and bacterial
diseases between the victim and the rescuer. Before contacting
their mouth with yours, wipe away any vomit, mucus, or excess
saliva that may be present. Rescue breathing can also be
mouth-to-nose breathing if the person's mouth is seriously
injured or can't be opened.`;

  const content2 = `Step-4: Start with 2 rescue breaths\n
Once your mouth is over the other person's, forcefully breathe
into their mouth for at least 1 full second and watch their chest
to determine if it rises a little or not. If it does, give the
second breath. If it doesn't, then repeat the head-tilt, chin-lift
maneuver and try again. Don't be too timid or grossed out, because
a person's life is in your hands. Although there's carbon dioxide
in your breath when you exhale, there's still enough oxygen to
benefit a victim during CPR. Again, the purpose isn't always to
revive them or continue indefinitely, but to buy some time for
them until paramedics arrive. Approximately 30 chest compressions
and 2 rescue breaths is considered to be 1 cycle of conventional
CPR for both adults and children. If performing CPR on a child
between the ages of 1 and 8 years, you can use gentler breaths to
inflate their lungs.

Step-5: Repeat cycles as needed\n
Follow the 2 rescue breaths with another round of 30 chest
compressions and 2 more rescue breaths. Repeat as needed until the
victim becomes responsive or until emergency medical personnel can
take over. Remember that chest compressions attempt to restore
some sort of circulation, while the rescue breathing provides some
(but not much) oxygen to prevent tissues, particularly the brain,
from dying.`;

  async function readOutLoud() {
    setIsReading(prev => !prev);
    if (!isReading) {
      try {
        const result1 = await MyTTSModule.speak(content1);
        console.log(result1);

        const result2 = await MyTTSModule.speak(content2);
        console.log(result2);
      } catch (error) {
        console.error(error);
      }
    } else {
      MyTTSModule.stopSpeech();
    }
  }

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
        if (
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
          readOutLoud();
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
          className="h-16 flex items-center justify-between px-4 flex-row"
          style={{backgroundColor: isDarkMode ? '#232323' : '#F4F4F4'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="chevron-left"
              size={30}
              color={isDarkMode ? '#FF4263' : '#800000'}
            />
          </TouchableOpacity>
          <Text
            className="font-bold text-3xl"
            style={{color: isDarkMode ? '#FF4263' : '#800000'}}>
            CPR
          </Text>
          <TouchableOpacity onPress={readOutLoud}>
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
      <View>
        <ScrollView className="mx-3 py-3" showsVerticalScrollIndicator={false}>
          <View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-1: Call the Emergency Services
            </Text>
            <View className="flex justify-center h-52">
              <Image
                source={require('../../assets/CPR/1.jpg')}
                className="w-full mx-auto max-h-48"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                If you find a person who is unresponsive, isn’t breathing, or
                doesn’t have a pulse and you decide to do some form of CPR, you
                should still immediately call your local emergency number before
                you do anything else. CPR can revive people on occasion, but it
                should be viewed as buying time until emergency personnel arrive
                with appropriate equipment. If 2 or more people are available, 1
                person should dial for help while the other begins CPR. If a
                person is unresponsive because of suffocation (from drowning,
                for example), then it's recommended to immediately begin CPR for
                1 minute and then call your local emergency number. If the
                victim is a child between the ages of 1 to 8 years, perform 5
                cycles of chest compressions and rescue breathing before calling
                emergency services if you are the only person available. This
                should take roughly 2 minutes. Calling emergency services will
                bring paramedics to the location. Typically, the dispatcher will
                also be able to instruct you on how to perform CPR.
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-2: Proceed to open the airway
            </Text>
            <View className="flex justify-center h-52">
              <Image
                source={require('../../assets/CPR/2.jpg')}
                className="w-full mx-auto max-h-48"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                If you're trained in CPR, confident of your abilities (not
                rusty), and you've performed 30 chest compressions, then proceed
                to open the person's airway using the head-tilt, chin-lift
                technique, or the jaw-thrust if you suspect a neck/head/spine
                injury. Put your palm on their forehead and gently tilt (extend)
                their head back a little. Then, with your other hand, gently
                lift the chin forward to open up their airway, making it easier
                to give them oxygen. Take 5 to 10 seconds to check for normal
                breathing. Look for chest motion, listen for breathing, and see
                if you can feel the victim's breath on your cheek or ear. Note
                that gasping is not considered to be normal breathing. If they
                are already breathing, no breathing assistance is needed.
                However, if they are still not breathing, then proceed to the
                mouth-to-mouth breathing part of CPR. To perform the jaw-thrust
                technique, sit above the person's head. Place one hand on each
                side of the person's jaw and lift the jaw so that it is jutting
                forward, as though the person has an underbite.
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-3: Place your mouth over the victim's mouth
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/CPR/3.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>

            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                Once the person's head is tilted and their chin lifted, make
                sure their mouth is free of any objects blocking their airway.
                Then, use one hand to pinch the victim's nostrils closed and
                cover their mouth completely with your own mouth.[16] Form a
                seal with your mouth so that no air can escape while you attempt
                to give the victim a rescue breath. You should be aware that
                mouth-to-mouth CPR can transfer infectious viral and bacterial
                diseases between the victim and the rescuer. Before contacting
                their mouth with yours, wipe away any vomit, mucus, or excess
                saliva that may be present. Rescue breathing can also be
                mouth-to-nose breathing if the person's mouth is seriously
                injured or can't be opened.
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-4: Start with 2 rescue breaths
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/CPR/4.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              Once your mouth is over the other person's, forcefully breathe
              into their mouth for at least 1 full second and watch their chest
              to determine if it rises a little or not. If it does, give the
              second breath. If it doesn't, then repeat the head-tilt, chin-lift
              maneuver and try again. Don't be too timid or grossed out, because
              a person's life is in your hands. Although there's carbon dioxide
              in your breath when you exhale, there's still enough oxygen to
              benefit a victim during CPR. Again, the purpose isn't always to
              revive them or continue indefinitely, but to buy some time for
              them until paramedics arrive. Approximately 30 chest compressions
              and 2 rescue breaths is considered to be 1 cycle of conventional
              CPR for both adults and children. If performing CPR on a child
              between the ages of 1 and 8 years, you can use gentler breaths to
              inflate their lungs.
            </Text>
          </View>
          <View className="mt-5 mb-[90px]">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-5: Repeat cycles as needed
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/CPR/5.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              Follow the 2 rescue breaths with another round of 30 chest
              compressions and 2 more rescue breaths. Repeat as needed until the
              victim becomes responsive or until emergency medical personnel can
              take over. Remember that chest compressions attempt to restore
              some sort of circulation, while the rescue breathing provides some
              (but not much) oxygen to prevent tissues, particularly the brain,
              from dying.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
