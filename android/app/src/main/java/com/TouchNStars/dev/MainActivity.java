package com.TouchNStars.dev;

import android.os.Bundle;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Config;
import com.capawesome.capacitorandroidedgetoedgesupport.EdgeToEdge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Keep screen awake and wake up device
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        // ✅ EdgeToEdge Plugin aufrufen
        try {
            // Farben aus `capacitor.config.json` laden
            String statusBarColor = Config.getString("plugins.CustomConfig.EdgeToEdge.statusBarColor", "#1F2937");
            String navigationBarColor = Config.getString("plugins.CustomConfig.EdgeToEdge.navigationBarColor", "#1F2937");

            // Setze Statusbar- und Navigationsleisten-Farbe
            EdgeToEdge.setBackgroundColor(statusBarColor);
            EdgeToEdge.setNavigationBarColor(navigationBarColor);

            Log.i("MainActivity", "✅ EdgeToEdge Farben gesetzt: StatusBar=" + statusBarColor + ", NavigationBar=" + navigationBarColor);

        } catch (Exception e) {
            Log.e("MainActivity", "❌ Fehler beim Setzen der EdgeToEdge-Farben", e);
        }

        try {
            String versionName = getPackageManager()
                .getPackageInfo(getPackageName(), 0)
                .versionName;
                
            new UpdateChecker(this).checkForUpdate(versionName);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == UpdateChecker.INSTALL_REQUEST_CODE) {
            switch (resultCode) {
                case RESULT_OK:
                    Log.i("MainActivity", "Update installed successfully");
                    break;
                case RESULT_CANCELED:
                    Log.w("MainActivity", "Update installation canceled");
                    break;
                default:
                    Log.e("MainActivity", "Update installation failed with code " + resultCode);
            }
        }
    }
}
