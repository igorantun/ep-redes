const http = require('http')

http.createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/echo') {
    let body = []

    request.on('error', (err) => {
      console.error(err)
    }).on('data', (chunk) => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      response.end(body)
    })
  } else if (request.method === 'GET' && request.url === '/') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json')
    response.write(JSON.stringify({
      hello: 'world',
    }))
    response.end()
  } else {
    response.statusCode = 404
    response.end()
  }
}).listen(3000)
