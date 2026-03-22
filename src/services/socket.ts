class SocketService {
  socket: WebSocket | null = null

  connect(url: string) {
    this.socket = new WebSocket(url)

    this.socket.onopen = () => console.log('Connected')
    this.socket.onclose = () => console.log('Disconnected')
  }

  subscribe<T = unknown>(callback: (data: T) => void) {
    if (!this.socket) return

    this.socket.onmessage = (event) => {
      const data = JSON.parse(String(event.data)) as T
      callback(data)
    }
  }
}

export const socketService = new SocketService()
