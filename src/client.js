const ws = new WebSocket('ws://localhost:3000')

const status = document.getElementById('status')

const wsTest = () => {
  ws.send(JSON.stringify({
    message: 'test',
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data)
}

ws.onopen = () => {
  console.log('connected')
  status.innerText = 'Connected'
}

ws.onclose = () => {
  console.log('disconnected')
  status.innerText = 'Disconnected'
}
