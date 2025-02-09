package com.Touch_N_Stars.dev

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.content.FileProvider
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream

const val INSTALL_REQUEST_CODE = 1001
const val REQUEST_INSTALL_PERMISSION = 1002

@JsonClass(generateAdapter = true)
data class GitHubTag(
    val name: String,
    val zipball_url: String,
    val tarball_url: String,
    val commit: Commit
)

@JsonClass(generateAdapter = true)
data class Commit(
    val sha: String,
    val url: String
)

class UpdateChecker(private val context: Context, private val currentVersion: String) {
    private val client = OkHttpClient()
    private val moshi = Moshi.Builder().build()
    private val adapter = moshi.adapter(Array<GitHubTag>::class.java)
    private val prefs: SharedPreferences = context.getSharedPreferences("update_prefs", Context.MODE_PRIVATE)

    fun checkForUpdates() {
        Log.i("UpdateChecker", "Starting update check...")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val headRequest = Request.Builder()
                    .url("https://api.github.com/repos/Touch-N-Stars/Touch-N-Stars/tags")
                    .head()
                    .build()

                val headResponse = client.newCall(headRequest).execute()
                if (!headResponse.isSuccessful) {
                    Log.i("UpdateChecker", "API endpoint unreachable, skipping update check")
                    return@launch
                }

                val request = Request.Builder()
                    .url("https://api.github.com/repos/Touch-N-Stars/Touch-N-Stars/tags")
                    .build()

                val response = client.newCall(request).execute()
                val tags = adapter.fromJson(response.body?.string() ?: "") ?: return@launch

                val latestTag = tags.firstOrNull { it.name.startsWith("v") } ?: return@launch
                val latestVersion = latestTag.name.removePrefix("v")

                if (prefs.getString("last_installed_version", "") == latestVersion) {
                    Log.i("UpdateChecker", "Already installed latest version: $latestVersion")
                    return@launch
                }

                if (isNewerVersion(latestVersion, currentVersion)) {
                    Log.i("UpdateChecker", "New version available: $latestVersion")
                    showUpdateDialog(latestVersion)
                }
            } catch (e: Exception) {
                Log.i("UpdateChecker", "Network unavailable, skipping update check")
            }
        }
    }

    private fun isNewerVersion(newVersion: String, currentVersion: String): Boolean {
        return try {
            val cleanNewVersion = newVersion.split("-")[0]
            val cleanCurrentVersion = currentVersion.split("-")[0]
            
            val newParts = cleanNewVersion.split(".")
            val currentParts = cleanCurrentVersion.split(".")

            for (i in 0 until maxOf(newParts.size, currentParts.size)) {
                val newPart = newParts.getOrNull(i)?.toInt() ?: 0
                val currentPart = currentParts.getOrNull(i)?.toInt() ?: 0

                when {
                    newPart > currentPart -> return true
                    newPart < currentPart -> return false
                }
            }
            false
        } catch (e: Exception) {
            false
        }
    }

    private fun showUpdateDialog(newVersion: String) {
        (context as? Activity)?.runOnUiThread {
            AlertDialog.Builder(context)
                .setTitle("New Version Available")
                .setMessage("Current version: $currentVersion\nNew version: $newVersion\n\nWould you like to update now? The app will close during installation.")
                .setPositiveButton("Update") { _, _ ->
                    checkInstallPermissions()
                    showProgressDialog(newVersion)
                }
                .setNegativeButton("Later", null)
                .show()
        }
    }

    private fun checkInstallPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!context.packageManager.canRequestPackageInstalls()) {
                val intent = Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                }
                (context as Activity).startActivityForResult(intent, REQUEST_INSTALL_PERMISSION)
            }
        }
    }

    private fun showProgressDialog(version: String) {
        (context as? Activity)?.runOnUiThread {
            val progressDialog = AlertDialog.Builder(context)
                .setTitle("Updating...")
                .setMessage("Downloading update, please wait...")
                .setCancelable(false)
                .create()
            
            progressDialog.show()
            downloadAndInstallUpdate(version, progressDialog)
        }
    }

    private fun downloadAndInstallUpdate(version: String, progressDialog: AlertDialog? = null) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val cleanVersion = version.split("-")[0]
                val apkUrl = "https://github.com/Touch-N-Stars/Touch-N-Stars/releases/download/v$version/TouchNStars-$cleanVersion.apk"
                
                val request = Request.Builder()
                    .url(apkUrl)
                    .build()

                val response = client.newCall(request).execute()
                if (!response.isSuccessful) {
                    throw Exception("Failed to download APK: ${response.code}")
                }

                val body = response.body ?: throw Exception("Empty response body")
                
                val downloadDir = context.getExternalFilesDir(null) ?: throw Exception("Cannot access external storage")
                if (!downloadDir.exists()) {
                    downloadDir.mkdirs()
                }

                val file = File(downloadDir, "TouchNStars-$cleanVersion.apk")
                Log.i("UpdateChecker", "Downloading update to: ${file.absolutePath}")
                FileOutputStream(file).use { output ->
                    body.byteStream().copyTo(output)
                }
                Log.i("UpdateChecker", "Download completed successfully. File size: ${file.length()} bytes")

                withContext(Dispatchers.Main) {
                    progressDialog?.setMessage("Preparing installation...")
                    
                    val uri = FileProvider.getUriForFile(
                        context,
                        "${context.packageName}.provider", 
                        file
                    )

                    val installIntent = Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }

                    try {
                        Log.i("UpdateChecker", "Starting installation of update")
                        context.startActivity(installIntent)
                        Log.i("UpdateChecker", "Installation intent started successfully")
                        
                        prefs.edit().putString("last_installed_version", version).apply()
                        
                        (context as Activity).finishAffinity()
                        System.exit(0)
                    } catch (e: Exception) {
                        Log.e("UpdateChecker", "Installation failed: ${e.message}", e)
                        progressDialog?.dismiss()
                        showErrorDialog("Failed to install update: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showErrorDialog("Update failed: ${e.message}")
                    Log.e("UpdateChecker", "Update failed: ${e.message}", e)
                }
            }
        }
    }

    private fun showErrorDialog(message: String) {
        (context as? Activity)?.runOnUiThread {
            AlertDialog.Builder(context)
                .setTitle("Update Error")
                .setMessage(message)
                .setPositiveButton("OK", null)
                .show()
        }
    }
}