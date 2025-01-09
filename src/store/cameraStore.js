import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCameraStore = defineStore('cameraStore', () => {
  // Reaktive Variablen
  const exposureTime = ref(2)
  const remainingExposureTime = ref(0)
  const progress = ref(0)
  const imageData = ref(null) // Hier liegt später das Base64-Bild
  const loading = ref(false)
  const isExposure = ref(false)
  const isLoadingImage = ref(false)
  const isLooping = ref(false)
  const isAbort = ref(false)
  const showInfo = ref(false)
  const gain = ref(0)
  const offset = ref(0)
  const coolingTemp = ref(-10)
  const coolingTime = ref(10)
  const warmingTime = ref(10)
  const buttonCoolerOn = ref(false)
  let exposureCountdownTimer = null

  /**
   * Hilfsfunktion, um kurz zu warten
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Startet den Belichtungs-Countdown
   */
  function startExposureCountdown(totalTime) {
    // Hier gleich Promise zurückgeben, damit wir drauf warten können
    return new Promise((resolve, reject) => {
      exposureCountdownTimer = setInterval(() => {
        // Abbruch?
        if (!isExposure.value) {
          clearInterval(exposureCountdownTimer)
          reject(new Error('Belichtung wurde abgebrochen.'))
          return
        }

        remainingExposureTime.value--
        progress.value =
          ((totalTime - remainingExposureTime.value) / totalTime) * 100

        if (remainingExposureTime.value <= 0) {
          clearInterval(exposureCountdownTimer)
          progress.value = 100
          resolve() // Countdown fertig
        }
      }, 1000)
    })
  }

  /**
   * Startet die Aufnahme + Countdown + Bildabruf
   */
  async function capturePhoto(apiService, exposureTime, gain) {
    if (exposureTime <= 0) {
      alert('Bitte geben Sie eine gültige Belichtungszeit ein.')
      return
    }
    loading.value = true
    isExposure.value = true
    isLoadingImage.value = false
    isAbort.value = false
    remainingExposureTime.value = exposureTime
    progress.value = 0
    //console.log(gain);

    try {
      // Starte Aufnahme via API
      const capturePromise = apiService.startCapture(exposureTime, gain)

      // Countdown laufen lassen
      await startExposureCountdown(exposureTime)

      // Warte, bis API-Aufnahme fertig ist
      await capturePromise

      // Jetzt Bild holen
      isExposure.value = false
      isLoadingImage.value = true

      let attempts = 0
      const maxAttempts = 15
      let image = null

      while (!image && attempts < maxAttempts && !isAbort.value) {
        try {
          const result = await apiService.getCaptureResult()
          image = result?.Response?.Image
          if (image) {
            imageData.value = `data:image/jpeg;base64,${image}`
            break
          }
        } catch (error) {
          console.error('Fehler beim Abrufen des Bildes:', error.message)
        }
        attempts++
        await wait(1000)
      }

      // Wenn bis hier kein Bild und kein Abbruch
      if (!image && !isAbort.value) {
        alert('Bild wurde nicht rechtzeitig bereitgestellt.')
      }
    } catch (error) {
      console.error('Fehler bei der Aufnahme:', error.message)
      alert('Fehler bei der Aufnahme. Siehe Konsole.')
    } finally {
      loading.value = false
      isLoadingImage.value = false
      // Dauerschleife?
      if (isLooping.value) {
        capturePhoto(apiService, exposureTime, gain)
      }
    }
  }

  /**
   * Bricht die Belichtung ab
   */
  async function abortExposure(apiService) {
    try {
      console.log('Abbruch der Belichtung gestartet...')
      await apiService.cameraAction('abort-exposure')
      clearInterval(exposureCountdownTimer)

      isAbort.value = true
      isExposure.value = false
      isLoadingImage.value = false
      isLooping.value = false
      remainingExposureTime.value = 0
      progress.value = 0

      console.log('Belichtung erfolgreich abgebrochen.')
    } catch (error) {
      console.error('Fehler beim Abbrechen der Belichtung:', error)
      alert(
        'Abbrechen fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler')
      )
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    exposureTime,
    remainingExposureTime,
    progress,
    imageData,
    loading,
    isExposure,
    isLoadingImage,
    isLooping,
    isAbort,
    showInfo,
    gain,
    offset,
    coolingTemp,
    coolingTime,
    warmingTime,
    buttonCoolerOn,

    // Actions
    capturePhoto,
    abortExposure
  }
})
