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

export default function Choking({navigation}) {
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

  const content1 = `Step-1: Assess the situation\n
Make sure the person is choking and determine whether it is a
partial or total airway obstruction. If a person is experiencing
mild choking, or partial airway obstruction, you are better off
letting him cough to remove the obstruction himself. Signs of
partial airway obstruction include the ability to speak, cry
out, cough or respond to you. The person will also usually be
able to breathe, though it may be slightly labored and the
person may grow pale in the face. In contrast, someone
experiencing a total obstruction of the airway will not be able
to speak, cry, cough or breathe. In addition, you may notice the
person making the "choking sign" (both hands clutched to the
throat) and his lips and fingernails may turn blue due to lack
of oxygen.

Step-2: Administer first-aid\n
If the person is choking severely or suffering from a total
airway obstruction and is conscious, communicate your intent to
perform first aid. It's a good idea to make sure that someone
who is conscious knows what you plan to do; this will also give
him an opportunity to let you know if your assistance is welcomed.
If you are the only person present who can help the person,
perform the first aid described below before calling emergency
services. If someone else is available, get him to call for
assistance.

Step-3: Give back blows\n
Stand behind the person and slightly off to one side. If you’re
right-handed, stand to the left and if you’re left-handed, stand
to the right. Support the person's chest with one hand and lean
the person forward so that the object blocking his airway will
exit his mouth (as opposed to going further down the throat).
Administer up to 5 forceful blows between the person’s shoulder
blades with the heel of your hand (between your palm and wrist).
Pause after each blow to see if the blockage has cleared. If
not, give up to five abdominal thrusts (see below).

Step-4: Administer abdominal thrusts\n
The Heimlich maneuver is an emergency technique that is only to be
used on adults or children older than 1 year of age. Do not use
the Heimlich maneuver on children under 1 year old Stand behind
the choking victim. Put your arms around his waist and lean him
forward. Make a fist with your hand and place it directly above the
person's navel (belly button) but below the breastbone. Put your
other hand on top of your first, then thrust both hands backwards
into their stomach with a hard, upward movement. Do this thrusting
action up to five times. Check after each thrust to see if the
blockage is gone. Stop if the victim loses consciousness.`;

  const content2 = `Step-5: Modify the Heimlich maneuver for pregnant women and people
who are obese\n
Place your hands higher than described above in the regular
Heimlich maneuver technique. Your hands should be at the base of
the breastbone, just above where the lowest ribs join. Press hard
into the chest with quick thrusts as described above. However, you
will not be able to make the same upward thrusts. Repeat until the
person stops choking and the blockage is dislodged or they fall
unconscious.

Step-6: Make sure the object is completely gone\n
Once the airway is cleared, parts of the object that caused the
person to choke can remain behind. If the person is able, ask the
victim to spit it out and breathe without difficulty. Look to see
if there is something blocking the airway. If there is, you can
also do a sweep through the person's mouth with your finger. Only
sweep if you see an object, otherwise you could push it further
back.

Step-7: Check to see if normal breathing has returned\n
Once the object is gone, most people will return to breathing
normally. If normal breathing has not returned or if the person
loses consciousness, move to the next step.

Step-8: Administer help if the person falls unconscious\n
If a choking person falls unconscious, lower him on his back onto
the floor. Then, clear the airway if possible. If you can see the
blockage, take your finger and sweep it out of the throat and out
through the mouth. Don't do a finger sweep if you don't see an
object. Be careful not to inadvertently push the obstruction
deeper into the airway.

Step-9: Consult a physician\n
If after choking, the person experiences a persistent cough, any
difficulty breathing, or a feeling that something is still stuck in
his throat, he should see a medical professional immediately.
Abdominal thrusts can also cause internal injuries and bruising.
If you used this tactic or performed CPR on another person, he
should be checked out by a physician afterwards.`;

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
            Choking
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
              Step-1: Assess the situation
            </Text>
            <View className="flex justify-center h-52">
              <Image
                source={require('../../assets/Choking/1.jpg')}
                className="w-full mx-auto max-h-48"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                Make sure the person is choking and determine whether it is a
                partial or total airway obstruction. If a person is experiencing
                mild choking, or partial airway obstruction, you are better off
                letting him cough to remove the obstruction himself. Signs of
                partial airway obstruction include the ability to speak, cry
                out, cough or respond to you. The person will also usually be
                able to breathe, though it may be slightly labored and the
                person may grow pale in the face. In contrast, someone
                experiencing a total obstruction of the airway will not be able
                to speak, cry, cough or breathe. In addition, you may notice the
                person making the "choking sign" (both hands clutched to the
                throat) and his lips and fingernails may turn blue due to lack
                of oxygen.
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-2: Administer first-aid
            </Text>
            <View className="flex justify-center h-52">
              <Image
                source={require('../../assets/Choking/2.jpg')}
                className="w-full mx-auto max-h-48"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                If the person is choking severely or suffering from a total
                airway obstruction and is conscious, communicate your intent to
                perform first aid. It's a good idea to make sure that someone
                who is conscious know what you plan to do; this will also give
                him an opportunity let you know if your assistance is welcomed.
                If you are the only person present who can help the person,
                perform the first aid described below before calling emergency
                services. If someone else is available, get him to call for
                assistance.
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-3: Give back blows
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/3.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <View>
              <Text
                style={{color: isDarkMode ? 'white' : 'black'}}
                className="text-[17px]">
                Stand behind the person and slightly off to one side. If you’re
                right-handed, stand to the left and if you’re left-handed, stand
                to the right. Support the person's chest with one hand and lean
                the person forward so that the object blocking his airway will
                exit his mouth (as opposed to going further down the throat).
                Administer up to 5 forceful blows between the person’s shoulder
                blades with the heel of your hand (between your palm and wrist).
                Pause after each blow to see if the blockage has cleared. If
                not, give up to five abdominal thrusts (see below).
              </Text>
            </View>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-4: Administer abdominal thrusts
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/4.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              The Heimlich maneuver is an emergency technique that is only to be
              used on adults or children older than 1 year of age. Do not use
              the Heimlich maneuver on children under 1 year old Stand behind
              the choking victim. Put your arms around his waist and lean him
              forward Make a fist with your hand and place it directly above the
              person's navel (belly button) but below the breastbone. Put your
              other hand on top of your first, then thrust both hands backwards
              into their stomach with a hard, upward movement. Do this thrusting
              action up to five times. Check after each thrust to see if the
              blockage is gone. Stop if the victim loses consciousness.
            </Text>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-5: Modify the Heimlich maneuver for pregnant women and people
              who are obese
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/5.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              Place your hands higher than described above in the regular
              Heimlich maneuver technique. Your hands should be at the base of
              the breast bone, just above where the lowest ribs join. Press hard
              into the chest with quick thrusts as described above. However, you
              will not be able to make the same upward thrusts. Repeat until the
              person stops choking and the blockage is dislodged or he falls
              unconscious.
            </Text>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-6: Make sure the object is completely gone
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/6.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              Once the airway is cleared, parts of the object that caused the
              person to choke can remain behind. If the person is able, ask the
              victim to spit it out and breathe without difficulty. Look to see
              if there is something blocking the airway. If there is, you can
              also do a sweep through the person's mouth with your finger. Only
              sweep if you see an object, otherwise you could push it further
              back.
            </Text>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-7: Check to see if normal breathing has returned
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/7.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              Once the object is gone, most people will return to breathing
              normally. If normal breathing has not returned or if the person
              loses consciousness, move to the next step.
            </Text>
          </View>
          <View className="mt-5">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-8: Administer help if the person falls unconscious
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/8.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              If a choking person falls unconscious, lower him on his back onto
              the floor. Then, clear the airway if possible. If you can see the
              blockage, take your finger and sweep it out of the throat and out
              through the mouth. Don't do a finger sweep if you don't see an
              object. Be careful not to inadvertently push the obstruction
              deeper into the airway.
            </Text>
          </View>
          <View className="mt-5 mb-[90px]">
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-lg font-bold">
              Step-9: Consult a physician
            </Text>
            <View className="flex justify-center h-48">
              <Image
                source={require('../../assets/Choking/9.jpg')}
                className="w-full mx-auto max-h-44"
                style={{objectFit: 'contain'}}
              />
            </View>
            <Text
              style={{color: isDarkMode ? 'white' : 'black'}}
              className="text-[17px]">
              If after choking, the person experiences a persistent cough, any
              difficulty breathing or a feeling that something is still stuck in
              his throat, he should see a medical professional immediately.
              Abdominal thrusts can also cause internal injuries and bruising.
              If you used this tactic or performed CPR on another person, he
              should be checked out by a physician afterwards.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
