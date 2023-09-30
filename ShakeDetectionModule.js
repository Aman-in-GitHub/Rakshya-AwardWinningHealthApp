import {NativeModules, DeviceEventEmitter} from 'react-native';

const {ShakeDetection} = NativeModules;

const addShakeListener = callback => {
  DeviceEventEmitter.addListener('onPanicActivated', isPanicActivated => {
    callback(isPanicActivated);
  });
};

export default {
  startShakeDetection: () => ShakeDetection.startShakeDetection(),
  stopShakeDetection: () => ShakeDetection.stopShakeDetection(),
  addShakeListener,
};
