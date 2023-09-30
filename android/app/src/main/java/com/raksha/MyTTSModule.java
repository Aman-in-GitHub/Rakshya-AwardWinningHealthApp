package com.raksha;

import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class MyTTSModule extends ReactContextBaseJavaModule {

    private TextToSpeech textToSpeech;

    public MyTTSModule(ReactApplicationContext reactContext) {
        super(reactContext);
        textToSpeech = new TextToSpeech(reactContext, status -> {
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech.setLanguage(Locale.US);
            }
        });
    }

    @Override
    public String getName() {
        return "MyTTSModule";
    }

    @ReactMethod
    public void speak(String text, final Promise promise) {
        HashMap<String, String> params = new HashMap<>();
        params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "uniqueId");

        float speechRate = 1.4f; 
        textToSpeech.setSpeechRate(speechRate);

        int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, params);
        if (result == TextToSpeech.SUCCESS) {
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                }

                @Override
                public void onDone(String utteranceId) {
                    promise.resolve("Speech completed");
                }

                @Override
                public void onError(String utteranceId) {
                    promise.reject("TTS_ERROR", "Error during speech");
                }

                @ReactMethod
                public void stopSpeech() {
                    if (textToSpeech != null) {
                        textToSpeech.stop();
                    }
                }
            });
        } else {
            promise.reject("TTS_ERROR", "TextToSpeech initialization failed");
        }
    }

    @ReactMethod
    public void stopSpeech() {
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
    }
}
