const http = require('http')

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

  if (req.method === 'GET' && req.url === '/') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({
      hello: 'world',
    }))
    return res.end()
  }

  res.statusCode = 404
  return res.end()
})

server.listen(3000, () => {
  console.log(`🚀 Server ready at :3000`)
})
