import { useState, useEffect, useCallback } from 'react'

export function useSensors() {
  const [compass, setCompass] = useState(null)
  const [tilt, setTilt] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)

  const handleOrientation = useCallback((e) => {
    // alpha: z-axis rotation 0-360 (compass heading on absolute events)
    // beta:  x-axis tilt -180 to 180 (front/back)
    // gamma: y-axis tilt -90 to 90  (left/right)
    setCompass({
      heading: e.alpha != null ? Math.round((360 - e.alpha + 360) % 360) : null,
      beta: e.beta != null ? Math.round(e.beta) : null,
      gamma: e.gamma != null ? Math.round(e.gamma) : null,
      absolute: e.absolute || false
    })
  }, [])

  const handleMotion = useCallback((e) => {
    const acc = e.accelerationIncludingGravity
    if (!acc) return
    setTilt({
      x: acc.x != null ? Math.round(acc.x * 10) / 10 : null,
      y: acc.y != null ? Math.round(acc.y * 10) / 10 : null,
      z: acc.z != null ? Math.round(acc.z * 10) / 10 : null
    })
  }, [])

  const startListening = useCallback(() => {
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation)
    } else if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation)
    }
    if ('ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }
  }, [handleOrientation, handleMotion])

  const requestPermissions = useCallback(async () => {
    try {
      const orientPerm = await DeviceOrientationEvent.requestPermission()
      const motionPerm = await DeviceMotionEvent.requestPermission()
      if (orientPerm === 'granted' && motionPerm === 'granted') {
        setPermissionGranted(true)
        startListening()
      }
    } catch (e) {
      console.error('Sensor permission denied:', e)
    }
  }, [startListening])

  useEffect(() => {
    // iOS 13+ requires explicit permission request
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      setNeedsPermission(true)
    } else {
      startListening()
      setPermissionGranted(true)
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation)
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [startListening, handleOrientation, handleMotion])

  const getDirectionLabel = (heading) => {
    if (heading == null) return '?'
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
    return dirs[Math.round(heading / 45)]
  }

  const getTiltLabel = (tiltData) => {
    if (!tiltData || tiltData.z == null) return 'Unknown'
    if (tiltData.z > 8) return 'Pointing Down ↓'
    if (tiltData.z < -8) return 'Pointing Up ↑'
    return 'Horizontal ↔'
  }

  return { compass, tilt, permissionGranted, needsPermission, requestPermissions, getDirectionLabel, getTiltLabel }
}
