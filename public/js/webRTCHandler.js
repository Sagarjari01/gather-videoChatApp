import * as wss from './wss.js'
import * as constants from './constants.js'
import * as ui from './ui.js'
import * as store from './store.js'
let connectedUserDetails
let peerConnection
let dataChannel
const constraints = {
    video: 'true',
    audio: 'true'
}

const configuration ={
    iceServers:[
        {
            urls: "stun:stun.1.google.com:13902"
        }
    ]
}
export const getLocalPreview = () =>{

    navigator.mediaDevices.getUserMedia(constraints)
    .then((stream)=>{
        ui.updateLocalVideo(stream)
        store.setCallState(constants.callState.CALL_AVAILABLE)
        store.setLocalStream(stream)
        ui.showVideoCallButtons()
    }).catch(err=>{
        console.log('error occured while trying to get access to camera')
        console.log(err)
    })

}



export const createPeerConnection = () =>{
    peerConnection = new RTCPeerConnection(configuration)

    dataChannel = peerConnection.createDataChannel('chat')

    peerConnection.ondatachannel=(event)=>{
        const dataChannel = event.channel
        // ready to recive message
        
        dataChannel.onopen=()=>{
            console.log("peer connection ready to recive message")
        }

        dataChannel.onmessage = (event) =>{ // reciveing message send to datachannel
            console.log('message came from data channel')
            // console.log(event)
            const message = JSON.parse(event.data)
            ui.appendMessage(message)
            console.log(message)
        }
    }

    peerConnection.onicecandidate = (event) =>{
        console.log('getting ice candidate from stun server')
        if(event.candidate){
            // send our ice candidates to other peers
            wss.sendDataUsingWebRTCSignaling({
                connectedUserId:connectedUserDetails.socketId,
                type:constants.webRTCSignaling.ICE_CANDIDATE,
                candidate:event.candidate
            })
        }
    }

    peerConnection.onconnectionstatechange = (event)=>{
        if(peerConnection.connectionState === 'connected'){
            console.log('successfully connected with other peer')
        }
    }

    // receving tracks
    const remoteStream = new MediaStream()
    
    store.setRemoteStream(remoteStream)
    ui.updateRemoteVideo(remoteStream)

    peerConnection.ontrack = (event)=>{
        remoteStream.addTrack(event.track)
    }

    // adding our stream to peer connection

    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE || 
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){
        const localStream = store.getState().localStream

        for(const track of localStream.getTracks())
        peerConnection.addTrack(track,localStream)
    }

}

// logic for message sending

export const sendMessageUsingDataChannel = (message) =>{
    const stringMessage = JSON.stringify(message)
    dataChannel.send(stringMessage)
}

export const sendPreOffer = (callType,calleeID) =>{ // for caller
    connectedUserDetails = {
        callType,
        socketId:calleeID
    }
    if(callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.VIDEO_PERSONAL_CODE){
        const data = {
            callType,
            calleeID
        }
        ui.showCallingDialog(callRejectionHandler);
        store.setCallState(constants.callState.CALL_UNAVAILABLE)
        wss.sendPreOffer(data);
    }

    if(callType==constants.callType.CHAT_STRANGER || callType==constants.callType.VIDEO_STRANGER){
        const data = {
            callType,
            calleeID
        }
        store.setCallState(constants.callState.CALL_UNAVAILABLE)
        wss.sendPreOffer(data)
    }
}

export const handlePreOffer = (data) =>{ // for callee
    const {callerId,callType} = data;

    if(!checkCallPossibility()){
        return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE,callerId)
    }
    // changes after done


    connectedUserDetails = {
        socketId:callerId,
        callType
    }
    store.setCallState(constants.callState.CALL_UNAVAILABLE)
    if(callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.VIDEO_PERSONAL_CODE ){
        ui.showIncomingCallDialog(callType,acceptCallHandler,rejectCallHandler)
    }
    if(callType==constants.callType.CHAT_STRANGER || callType==constants.callType.VIDEO_STRANGER){
        createPeerConnection()
        sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
        ui.showElements(connectedUserDetails.callType)
    }
}

const acceptCallHandler = () =>{
    console.log("call accepted")
    createPeerConnection()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showElements(connectedUserDetails.callType)
}

const rejectCallHandler = () =>{
    console.log("call rejected")
    setIncomingCallSAvailable()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)
}

const callRejectionHandler = () =>{
    // console.log("call rejection on caller side")
    const data ={
        connectedUserSocketId:connectedUserDetails.socketId
    }    
    closePeerConnectionAndResetState()
    wss.sendUserHangedUp(data)
}

const sendPreOfferAnswer = (preOfferAnswer,socketId=null) =>{
    const callerId = socketId?socketId:connectedUserDetails.socketId
    const data = {
        callerId:callerId,
        preOfferAnswer
    }
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data)
}


export const handlePreOfferAnswer = (data) =>{
    const {preOfferAnswer} = data
    ui.removeAllDialogs()

    if(preOfferAnswer===constants.preOfferAnswer.CALLEE_NOT_FOUND){
        setIncomingCallSAvailable()
        ui.showInfoDialog(preOfferAnswer)
        // callee not found
    }

    if(preOfferAnswer===constants.preOfferAnswer.CALL_UNAVAILABLE){
        setIncomingCallSAvailable()
        ui.showInfoDialog(preOfferAnswer)
        // call unavailable
    }

    if(preOfferAnswer===constants.preOfferAnswer.CALL_REJECTED){
        setIncomingCallSAvailable()
        ui.showInfoDialog(preOfferAnswer)
        // call rejected
    }

    if(preOfferAnswer===constants.preOfferAnswer.CALL_ACCEPTED){
        ui.showElements(connectedUserDetails.callType)
        createPeerConnection()
        sendWebRTCOffer()
    }
}

const sendWebRTCOffer = async () =>{ //caller side // this is for exchanging sdp data
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    wss.sendDataUsingWebRTCSignaling({
        connectedUserId:connectedUserDetails.socketId,
        type:constants.webRTCSignaling.OFFER,
        offer:offer
    })

}

export const handleWebRTCOffer = async (data) =>{
    await peerConnection.setRemoteDescription(data.offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    wss.sendDataUsingWebRTCSignaling({
        connectedUserId:connectedUserDetails.socketId,
        type:constants.webRTCSignaling.ANSWER,
        answer:answer
    })
}

export const handleWebRTCAnswer = async (data) =>{
    console.log('handling webRTC answer')
    await peerConnection.setRemoteDescription(data.answer)
}

export const handleWebRTCCandidate = async (data) =>{
    // console.log("Called here")
    // console.log("IceCandidate: ",data)
    try{
        await peerConnection.addIceCandidate(data.candidate)
    }catch(err){
        console.log('error occured while trying to add recived ice candidate',err)
    }
}

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive)=>{
    if(screenSharingActive){
        const localStream = store.getState().localStream;
        const senders = peerConnection.getSenders()
        const sender=senders.find((sender)=>sender.track.kind===localStream.getVideoTracks()[0].kind)
        if(sender){
            sender.replaceTrack(localStream.getVideoTracks()[0])
        }
        // stop screen sharing
        store.getState().screenSharingStream.getTracks().forEach((track)=>track.stop())
        store.setScreenSharingActive(!screenSharingActive)
        ui.updateLocalVideo(localStream)

    }else{
        console.log('switching for screen sharing')
        try{
            let screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
                video:true
            })
            store.setScreenSharingStream(screenSharingStream)

            // replace track which sender is sending
            const senders = peerConnection.getSenders()
            const sender=senders.find((sender)=>sender.track.kind===screenSharingStream.getVideoTracks()[0].kind)
            if(sender){
                sender.replaceTrack(screenSharingStream.getVideoTracks()[0])
            }
            store.setScreenSharingActive(!screenSharingActive)
            ui.updateLocalVideo(screenSharingStream)
        }catch(err){
            console.error('error occured while trying to get screen sharing stream',err)
        }
    }
}

export const handleHangUp =() =>{
    console.log('finishing the call')
    const data ={
        connectedUserSocketId:connectedUserDetails.socketId
    }
    wss.sendUserHangedUp(data)
    closePeerConnectionAndResetState()
}

export const handleConnectedUserHangedUp =() =>{
    console.log('connected User Hanged Up')
    closePeerConnectionAndResetState()
}

const closePeerConnectionAndResetState = () =>{
    if(peerConnection){
        peerConnection.close()
        peerConnection = null
    }

    if(connectedUserDetails.callType===constants.callType.VIDEO_PERSONAL_CODE ||
        connectedUserDetails.callType === constants.callType.VIDEO_STRANGER){
            store.getState().localStream.getVideoTracks()[0].enabled = true
            store.getState().localStream.getAudioTracks()[0].enabled = true
        }
    
    ui.updateUIAfterHangUp(connectedUserDetails.callType)
    setIncomingCallSAvailable()
    connectedUserDetails = null

}

const checkCallPossibility = (callType) =>{
    const callState = store.getState().callState
    if(callState===constants.callState.CALL_AVAILABLE){
        return true
    }
    if((callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.VIDEO_PERSONAL_CODE) && 
    callState===constants.callState.CALL_AVAILABLE_ONLY_CHAT){
        return false
    }

    return false
}

const setIncomingCallSAvailable = () =>{
    const localStream = store.getState().localStream
    if(localStream){
        store.setCallState(constants.callState.CALL_AVAILABLE)
    }else{
        store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT)
    }
}