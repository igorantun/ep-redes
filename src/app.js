const http = require('http')
const webSocket = require('websocket').server
const fs = require('fs')

let page, client

fs.readFile('src/index.html', (err, data) => {
  page = data
})

fs.readFile('src/client.js', (err, data) => {
  client = data
})

const server = http.createServer((req, res) => {
  console.log(`${req.method} request received at ${req.url}`)


  if (req.method === 'POST' && req.url === '/echo') {
    let body = []

    req.on('error', (err) => {
      console.error(err)
    }).on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      return res.end(body)
    })
  }

  if (req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': page.length
    })
    res.write(page)
    return res.end()
  }

  if (req.url === '/client.js') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': client.length
    })
    res.write(client)
    res.end()
  }

  res.statusCode = 404
  return res.end()
})

webSocketServer = new webSocket({
  httpServer: server,
})

const getContentOfMessage = (message) => {
  return JSON.parse(message.utf8Data)
}

webSocketServer.on('request', (req) => {
  const connection = req.accept(null, req.origin)

  console.log(`${connection.remoteAddress} connected.`)

  connection.on('message', (message) => {
    console.log(getContentOfMessage(message))
  })

  connection.on('close', () => {
    console.log(`${connection.remoteAddress} disconnected.`)
  })
})

server.listen(3000, () => {
  console.log(`🚀 Server ready at :3000`)
})
