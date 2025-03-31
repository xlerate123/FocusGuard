import { useRef, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Webcam from "react-webcam"
import { motion } from "framer-motion"
import axios from "axios"
import * as faceapi from 'face-api.js'
import getSpotifyAccessToken from "./AccessToken"

const MoodDetector = () => {
  const webcamRef = useRef(null)
  const [mood, setMood] = useState(null)
  const [error, setError] = useState(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const navigate = useNavigate()
  const modelsLoaded = useRef(false)
  const moodDetected = useRef(false)

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true)
        console.log('Loading models...')
        
        const MODEL_URL = '/models'
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ])
        
        console.log('Models loaded successfully')
        modelsLoaded.current = true
        setIsModelLoading(false)
      } catch (err) {
        console.error('Error loading models:', err)
        setError("Failed to load face detection models")
        setIsModelLoading(false)
      }
    }

    loadModels()
  }, [])

  useEffect(() => {
    if (!webcamRef.current?.video || !modelsLoaded.current || isModelLoading || moodDetected.current) return

    const detectMood = async () => {
      try {
        const video = webcamRef.current.video
        console.log('Detecting expressions...')
        
        const detections = await faceapi
          .detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
          )
          .withFaceLandmarks()
          .withFaceExpressions()

        if (detections) {
          console.log('Detected expressions:', detections.expressions)
          const { happy, sad, neutral, angry, disgusted, fearful, surprised } = detections.expressions
          
          const emotions = { 
            happy, 
            sad, 
            neutral, 
            angry, 
            disgusted, 
            fearful, 
            surprised 
          }
          
          const dominantMood = Object.entries(emotions).reduce((a, b) => 
            a[1] > b[1] ? a : b
          )[0]

          const moodMap = {
            happy: "😃 Happy",
            sad: "😢 Sad",
            neutral: "😐 Neutral",
            angry: "😠 Angry",
            disgusted: "🤢 Disgusted",
            fearful: "😨 Fearful",
            surprised: "😲 Surprised"
          }

          const detectedMood = moodMap[dominantMood]
          if (detectedMood) {
            moodDetected.current = true
            setMood(detectedMood)
          }
        } else {
          console.log('No face detected')
        }
      } catch (err) {
        console.error("Error in mood detection:", err)
      }
    }

    const interval = setInterval(detectMood, 1000)

    return () => clearInterval(interval)
  }, [isModelLoading])

  useEffect(() => {
    const fetchSong = async () => {
      if (!mood) return

      const moodPlaylist = {
        "😃 Happy": "0jrlHA5UmxRxJjoykf7qRY",
        "😢 Sad": "4bRQf8bwAIVgCb6Lcoursx",
        "😐 Neutral": "0k0WKMaoZs46MFTYHwZku5",
        "😠 Angry": "0k0WKMaoZs46MFTYHwZku5",
        "🤢 Disgusted": "4bRQf8bwAIVgCb6Lcoursx",
        "😨 Fearful": "0jrlHA5UmxRxJjoykf7qRY",
        "😲 Surprised": "0k0WKMaoZs46MFTYHwZku5"
      }

      const playlistId = moodPlaylist[mood] || moodPlaylist["😐 Neutral"]

      try {
        const accessToken = await getSpotifyAccessToken()
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        const tracks = response.data.items
        if (tracks.length > 0) {
          const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
          navigate(`/player/${randomTrack.track.id}`)
        }
      } catch (error) {
        setError("Error fetching songs from Spotify")
        console.error("Error fetching songs from Spotify", error)
      }
    }

    if (mood) {
      fetchSong()
    }
  }, [mood, navigate])

  if (error) {
    return <div>Error: {error}</div>
  }

  const moodVariants = {
    happy: { scale: 1.2},
    sad: { scale: 0.9},
    neutral: { scale: 1 },
    surprised: { rotate: [0, 5, -5, 0]},
  }

  const moodColors = {
    "😃 Happy": "#FFD700", // Yellow
    "😢 Sad": "#3498db", // Blue
    "😐 Neutral": "#95a5a6", // Grey
    "😲 Surprised": "#ff5733", // Orange
  }

  return (
    <motion.div
      style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "beige" }}
      animate={{ backgroundColor: moodColors[mood] || "#ffffff" }}
      transition={{ duration: 0.5 }}
    >
    <div style={{ textAlign: "center"}}>
      <Webcam 
        ref={webcamRef} 
        style={{ width: "400px", height: "350px" }}
        mirrored={true}
      />
      <motion.h2
        animate={moodVariants[mood?.split(" ")[1]?.toLowerCase()] || {}}
        transition={{ duration: 0.5 }}
      >
        Mood: {mood || "Detecting..."}
      </motion.h2>
    </div>
    </motion.div>
  )
}

export default MoodDetector