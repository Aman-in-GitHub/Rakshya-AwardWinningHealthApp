package com.raksha;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MySms extends ReactContextBaseJavaModule {

    public MySms(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "MySms";
    }

    @ReactMethod
    public void sendSOS(String phoneNumber, String message, final Promise promise) {
        if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED) {

            try {
                SmsManager smsManager = SmsManager.getDefault();
                smsManager.sendTextMessage(phoneNumber, null, message, null, null);

                promise.resolve("SOS message sent");
            } catch (Exception e) {
                promise.reject("Error sending SOS message", e.getMessage());
            }
        } else {
            promise.reject("Permission denied", "Please grant SEND_SMS permission.");
        }
    }
}
