
const express = require("express")
const app = express();
const http = require('http')
const server = http.createServer(app);

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })

const port = process.env.PORT;
app.use(express.static("public"))

let connectedPeers = [];
let connectedPeersStrangers = []

const io = require('socket.io')(server)

io.on('connection',(socket)=>{ // on connection any client can be connected with it. it is waiting for user to connect
    connectedPeers.push(socket.id)

    console.log(connectedPeers)

    socket.on('pre-offer',(data)=>{
        const {callType,calleeID} = data
        const isConnected = connectedPeers.find((connectedPeer)=>connectedPeer===calleeID)
        if(isConnected){
            const data={
                callerId:socket.id,
                callType
            }
            io.to(calleeID).emit('pre-offer',data) // from here we go to wss.js
        }else{
            const data = {preOfferAnswer : "CALLEE_NOT_FOUND"}
            io.to(socket.id).emit('pre-offer-answer',data)
        }
    })

    socket.on('pre-offer-answer',(data)=>{
        const {callerId} = data
        console.log('pre offer answer came')
        io.to(callerId).emit('pre-offer-answer',data)
    })

    socket.on('webRTC-signaling',(data)=>{
        const {connectedUserId} = data
        const isConnected = connectedPeers.find((connectedPeer)=>connectedPeer===connectedUserId)
        if(isConnected){
            io.to(connectedUserId).emit('webRTC-signaling',data)
        }
    })

    socket.on('user-hanged-up',(data)=>{
        const {connectedUserSocketId} = data
        const isConnected = connectedPeers.find((connectedPeer)=>connectedPeer===connectedUserSocketId)
        if(isConnected){
            io.to(connectedUserSocketId).emit('user-hanged-up')
        }
    })

    socket.on('stranger-connection-status',(data)=>{
        const {status} = data
        if(status){
            connectedPeersStrangers.push(socket.id)
        }else{
            const newConnectedPeersStrangers = connectedPeersStrangers.filter((peerSocketId)=>peerSocketId!==socket.id)
            connectedPeersStrangers = newConnectedPeersStrangers
        }
        console.log("this is diffrent",connectedPeersStrangers)
    })

    socket.on('get-stranger-socket-id',()=>{
        let randomSocketId;
        const filterConnectedPeers = connectedPeersStrangers.filter((connectedPeer)=>connectedPeer!==socket.id)
        if(filterConnectedPeers.length > 0){
            randomSocketId = filterConnectedPeers[Math.floor(Math.random()*filterConnectedPeers.length)]
        }else{
            randomSocketId = null
        }
        const data ={
            randomSocketId
        }
        io.to(socket.id).emit('stranger-socket-id',data)
    })

    socket.on('disconnect',()=>{
        const newConnectedPeers = connectedPeers.filter((currId)=>currId!==socket.id)
        connectedPeers = newConnectedPeers
        const newConnectedPeersStrangers = connectedPeersStrangers.filter((currId)=>currId!==socket.id)
        connectedPeersStrangers = newConnectedPeersStrangers
        // console.log(connectedPeers)
    })
    
})

app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/public/index.html");
})

server.listen(port,()=>{
    console.log(`App is running on http://localhost:${port}`)
})