import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

export function useSocket() {
  const [connected, setConnected] = useState(false)
  const socket = useMemo(() => io(import.meta.env.VITE_API_SOCKET_URL || 'http://localhost:8080'), [])

  useEffect(() => {
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    return () => {
      socket.disconnect()
    }
  }, [socket])

  return { socket, connected }
}
