package com.binarybrains.snowsentinel;

import android.Manifest;
import android.telephony.SmsManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;

/**
 * SmsSenderPlugin — sends an SMS directly via Android's SmsManager, without
 * opening the Messages app or requiring a final user tap there.
 *
 * This exists only for SnowSentinel's SOS feature on Android. There is no
 * iOS or web equivalent: Apple does not permit any app to send SMS silently
 * under any circumstance, so this plugin is intentionally Android-only. The
 * web/TypeScript layer (lib/nativeSms.ts) checks the platform first and
 * falls back to an sms: compose-and-confirm link everywhere else.
 */
@CapacitorPlugin(
    name = "SmsSender",
    permissions = { @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms") }
)
public class SmsSenderPlugin extends Plugin {

    @PluginMethod
    public void sendSms(PluginCall call) {
        String number = call.getString("number");
        String message = call.getString("message");

        if (number == null || number.isEmpty() || message == null || message.isEmpty()) {
            call.reject("number and message are required");
            return;
        }

        if (getPermissionState("sms") != PermissionState.GRANTED) {
            saveCall(call);
            requestPermissionForAlias("sms", call, "smsPermissionCallback");
            return;
        }

        doSendSms(call);
    }

    @PermissionCallback
    private void smsPermissionCallback(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED) {
            doSendSms(call);
        } else {
            call.reject("SMS permission was not granted");
        }
    }

    private void doSendSms(PluginCall call) {
        String number = call.getString("number");
        String message = call.getString("message");
        try {
            SmsManager smsManager = SmsManager.getDefault();
            ArrayList<String> parts = smsManager.divideMessage(message);
            smsManager.sendMultipartTextMessage(number, null, parts, null, null);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to send SMS: " + e.getMessage(), e);
        }
    }
}
