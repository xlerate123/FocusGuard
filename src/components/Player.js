import {useParams,Link} from "react-router-dom"
import { useState,useEffect } from "react"
import { motion } from "framer-motion"
import '../player.css'

const Player = () => {
  const { trackId } = useParams()
  const [isLoaded, setIsLoaded] = useState(false)
  const [text, setText] = useState("");
  const fullText = "Now Playing"

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 150)
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 1000)
  }, [])


    return (
      <div style={{textAlign:"center",padding: "20px"}}>
        
      <motion.h1
        style={{color:"gray"}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {text}
      </motion.h1>
      {isLoaded ?(
        <div style={{
          position: "relative",
          paddingTop: "56.25%", 
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
      <iframe
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none"
        }}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0&autoplay=1`}
        title="Spotify Player"
        width="800"
        height="500"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe></div>):(<p>Loading Song...</p>
      )}
      <div style={{ marginTop: "20px" }}>
      <Link 
          to="/" 
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "white",
            textDecoration: "none",
            borderRadius: "20px"
          }}
        >
          ⬅ Detect Another Mood
        </Link>
      </div>
      </div>
    )
  }

export default Player  