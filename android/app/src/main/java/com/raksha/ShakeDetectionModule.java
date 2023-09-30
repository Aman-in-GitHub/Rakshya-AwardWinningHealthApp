package com.raksha;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ShakeDetectionModule extends ReactContextBaseJavaModule implements SensorEventListener {
    private ReactApplicationContext reactContext;
    private SensorManager sensorManager;
    private long firstShakeTime = 0;
    private int shakeCount = 0;
    private static final int SHAKE_THRESHOLD = 101;
    private static final int REQUIRED_SHAKES = 1;
    private static final long MAX_SHAKE_INTERVAL = 150;

    public ShakeDetectionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.sensorManager = (SensorManager) reactContext.getSystemService(Context.SENSOR_SERVICE);
        Sensor accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        sensorManager.registerListener(this, accelerometerSensor, SensorManager.SENSOR_DELAY_NORMAL);
    }

    @Override
    public String getName() {
        return "ShakeDetection";
    }

    @ReactMethod
    public void startShakeDetection() {
    }

    @ReactMethod
    public void stopShakeDetection() {
        sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            double acceleration = Math.sqrt(x * x + y * y + z * z);
            long currentTime = System.currentTimeMillis();

            if (acceleration > SHAKE_THRESHOLD) {
                if (firstShakeTime == 0) {
                    firstShakeTime = currentTime;
                } else if (currentTime - firstShakeTime <= MAX_SHAKE_INTERVAL) {
                    shakeCount++;
                    if (shakeCount >= REQUIRED_SHAKES) {
                        shakeCount = 0;
                        emitPanicActivatedEvent(true);
                        firstShakeTime = 0;
                    }
                } else {
                    firstShakeTime = currentTime;
                    shakeCount = 1;
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    private void emitPanicActivatedEvent(boolean isPanicActivated) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onPanicActivated", isPanicActivated);
    }
}
