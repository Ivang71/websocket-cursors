const http = require("http")
const express = require( "express")
const WebSocket = require( "ws")

const app = express()

const server = http.createServer(app)

const webSocketServer = new WebSocket.Server({ server })

const webSockets = {}
let i = 0
const events = {
    getYourId: 0,
    connect: 1,
    move: 2,
    exit: 3,
}

const sendEveryone = (data) =>
    webSocketServer.clients.forEach(client => client.send(JSON.stringify(data)))

webSocketServer.on('connection', (ws) => {
    const id = i++
    webSockets[id] = ws
    ws.send(JSON.stringify([events.getYourId, id]))
    sendEveryone([events.connect, id])

    // the basic scheme is [event, clientId, data]

    ws.on('message', m => {
        const d = JSON.parse(m)
        sendEveryone([d[0], id, d[1], d[2]])
    })

    ws.on('close', () => {
        delete webSockets[id]
        sendEveryone([events.exit, id])
    })
})

server.listen(9000, () => console.log("Server started"))
