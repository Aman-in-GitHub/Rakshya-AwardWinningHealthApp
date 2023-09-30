package com.raksha;

import android.content.Intent;
import android.os.Bundle;
import java.util.ArrayList;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.os.Handler;
import android.os.Looper;

public class MySpeechRecognizer extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public MySpeechRecognizer(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "MySpeechRecognizer";
    }

    @ReactMethod
    public void startVoiceRecognition(final Callback callback) {
        Handler mainHandler = new Handler(Looper.getMainLooper());

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                final SpeechRecognizer speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                speechRecognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {
                    }

                    @Override
                    public void onBeginningOfSpeech() {
                    }

                    @Override
                    public void onRmsChanged(float rmsdB) {
                    }

                    @Override
                    public void onBufferReceived(byte[] buffer) {
                    }

                    @Override
                    public void onEndOfSpeech() {
                    }

                    @Override
                    public void onError(int error) {
                        callback.invoke("Recognition error: " + error, null);
                        speechRecognizer.destroy();
                    }

                    @Override
                    public void onResults(Bundle results) {
                        ArrayList<String> voiceResults = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (voiceResults != null && voiceResults.size() > 0) {
                            String recognizedText = voiceResults.get(0);
                            callback.invoke(null, recognizedText);
                        } else {
                            callback.invoke("No recognition results", null);
                        }
                        speechRecognizer.destroy();
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {
                    }

                    @Override
                    public void onEvent(int eventType, Bundle params) {
                    }
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                speechRecognizer.startListening(intent);
            }
        });
    }
}
