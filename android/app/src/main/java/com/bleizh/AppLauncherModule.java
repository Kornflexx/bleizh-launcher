package com.bleizh;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.drawable.Drawable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.helper.Utility;

import java.io.File;
import java.util.List;

import javax.annotation.Nonnull;

class AppLauncherModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AppLauncherModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Nonnull
    @Override
    public String getName() {
        return "AppLauncher";
    }

    @ReactMethod
    public void getApplications(Promise promise) {
        try {
            PackageManager pm = this.reactContext.getPackageManager();
            List<PackageInfo> pList = pm.getInstalledPackages(0);
            WritableArray list = Arguments.createArray();
            for (int i = 0; i < pList.size(); i++) {
                PackageInfo packageInfo = pList.get(i);
                WritableMap appInfo = Arguments.createMap();

                if (!this.isSystemPackage(packageInfo)) {
                    appInfo.putString("packageName", packageInfo.packageName);
                    appInfo.putString("versionName", packageInfo.versionName);
                    appInfo.putDouble("versionCode", packageInfo.versionCode);
                    appInfo.putDouble("firstInstallTime", (packageInfo.firstInstallTime));
                    appInfo.putDouble("lastUpdateTime", (packageInfo.lastUpdateTime));
                    appInfo.putString("appName", ((String) packageInfo.applicationInfo.loadLabel(pm)).trim());

                    Drawable icon = pm.getApplicationIcon(packageInfo.applicationInfo);
                    appInfo.putString("icon", Utility.convert(icon));

                    String apkDir = packageInfo.applicationInfo.publicSourceDir;
                    appInfo.putString("apkDir", apkDir);

                    File file = new File(apkDir);
                    double size = file.length();
                    appInfo.putDouble("size", size);

                    list.pushMap(appInfo);
                }
            }
            promise.resolve(list);
        } catch (Exception ex) {
            promise.reject(ex);
        }
    }

    @ReactMethod
    public void startApplication(String packageName) {
        Intent launchIntent = this.reactContext.getPackageManager().getLaunchIntentForPackage(packageName);
        this.reactContext.startActivity(launchIntent);
    }

    private boolean isSystemPackage(PackageInfo pkgInfo) {
        return ((pkgInfo.applicationInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
    }


}