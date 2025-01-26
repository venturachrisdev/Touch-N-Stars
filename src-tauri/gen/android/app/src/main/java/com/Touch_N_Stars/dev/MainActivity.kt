package com.Touch_N_Stars.dev

import android.content.Intent
import android.os.Bundle
import com.Touch_N_Stars.dev.BuildConfig
import android.content.pm.PackageManager
import android.util.Log

class MainActivity : TauriActivity() {
    private lateinit var updateChecker: UpdateChecker

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == INSTALL_REQUEST_CODE) {
            when (resultCode) {
                RESULT_OK -> Log.i("MainActivity", "Update installed successfully")
                RESULT_CANCELED -> Log.w("MainActivity", "Update installation canceled")
                else -> Log.e("MainActivity", "Update installation failed with code $resultCode")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            // Get current version from package info
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            val versionName = packageInfo.versionName
            
            updateChecker = UpdateChecker(this, versionName)
            updateChecker.checkForUpdates()
        } catch (e: PackageManager.NameNotFoundException) {
            // Fallback to BuildConfig if package info not available
            val currentVersion = BuildConfig.VERSION_NAME
            updateChecker = UpdateChecker(this, currentVersion)
            updateChecker.checkForUpdates()
        } catch (e: Exception) {
            Log.e("MainActivity", "Error checking for updates", e)
        }
    }
}
