import axios from "axios"

const getSpotifyAccessToken = async () => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID
  const clientSecret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, 
      },
    }
  )

  return response.data.access_token
};

export default getSpotifyAccessToken
