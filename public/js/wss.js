import * as ui from './ui.js'
import * as store from './store.js'
import * as webRTC from './webRTCHandler.js'
import * as constants from './constants.js'
import * as strangerUtills from './strangerUtills.js'
let socketIO = null

export const registerSocketEvents = (socket)=>{
    socketIO = socket
    socket.on('connect',()=>{
        console.log("Connection Success with Server")
        console.log('App.js:','id',socket.id)
        store.setSocketId(socket.id);
        ui.updatePesonalCode(socket.id);
    })

    socket.on('pre-offer',(data)=>{
        webRTC.handlePreOffer(data)
    })

    socket.on('pre-offer-answer',(data)=>{
        webRTC.handlePreOfferAnswer(data)
    })

    socket.on('webRTC-signaling',(data)=>{
        switch(data.type){
            case constants.webRTCSignaling.OFFER:
                webRTC.handleWebRTCOffer(data)
                break
            case constants.webRTCSignaling.ANSWER:
                webRTC.handleWebRTCAnswer(data)
                break
            case constants.webRTCSignaling.ICE_CANDIDATE:
                webRTC.handleWebRTCCandidate(data)
                break
            default:
                return
        }
    })

    socket.on('user-hanged-up',()=>{
        webRTC.handleConnectedUserHangedUp()
    })

    socket.on('stranger-socket-id',(data)=>{
        strangerUtills.connectWithStranger(data)
    })
}

export const sendPreOffer = (data)=>{
    socketIO.emit('pre-offer',data) //from here we go to app.js // emmiting preoffer to server
}

export const sendPreOfferAnswer = (data) =>{
    socketIO.emit('pre-offer-answer',data)
}

export const sendDataUsingWebRTCSignaling = (data) =>{
    socketIO.emit('webRTC-signaling',data)
}

export const sendUserHangedUp = (data) =>{
    socketIO.emit('user-hanged-up',data)
}

export const changeStrangerConnectionStatus = (data) =>{
    socketIO.emit('stranger-connection-status',data)
}

export const getStrangerSocketId = () =>{
    socketIO.emit('get-stranger-socket-id')
} 