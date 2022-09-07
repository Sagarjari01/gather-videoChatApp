import * as store from './store.js'
import * as wss from './wss.js'
import * as webRTC from './webRTCHandler.js'
import * as constant from './constants.js'
import * as ui from './ui.js'
import * as recordingUtills from './recordingUtills.js'
import * as strangerUtills from './strangerUtills.js'
const socket = io('/')

// init of socket
wss.registerSocketEvents(socket);
webRTC.getLocalPreview()
// copy button implementation
const personalCodeCopyButton = document.getElementById('personal_code_copy_button')
personalCodeCopyButton.addEventListener('click',()=>{
    const copiedCode = store.getState().socketId
    navigator.clipboard && navigator.clipboard.writeText(copiedCode)
})

// personal chat button implementation
const personalChatButton = document.getElementById('personal_code_chat_button')

personalChatButton.addEventListener('click',()=>{
    console.log('chat button clicked')
    const calleeID = document.getElementById('personal_code_input').value
    const callType = constant.callType.CHAT_PERSONAL_CODE;
    webRTC.sendPreOffer(callType,calleeID)
})

// personal video button implementation
const personalVideoButton = document.getElementById('personal_code_video_button')

personalVideoButton.addEventListener('click',()=>{
    console.log('video button clicked')
    const calleeID = document.getElementById('personal_code_input').value
    const callType = constant.callType.VIDEO_PERSONAL_CODE
    webRTC.sendPreOffer(callType,calleeID)
})


// stranger
const strangerChatButton = document.getElementById('stranger_chat_button')
strangerChatButton.addEventListener('click',()=>{
// logic
    strangerUtills.getStrangerSocketIdAndConnect(constant.callType.CHAT_STRANGER)
})
const strangerVideoButton = document.getElementById('stranger_video_button')
strangerVideoButton.addEventListener('click',()=>{
    // logic
    strangerUtills.getStrangerSocketIdAndConnect(constant.callType.VIDEO_STRANGER)
})

const checkBox = document.getElementById('allow_strangers_checkbox')
// console.log('state of checkbox',store.getState().allowConnectionsFromStrangers)
checkBox.addEventListener('click',()=>{
    const checkBoxState = store.getState().allowConnectionsFromStrangers
    ui.updateStrangerCheckBox(!checkBoxState)
    store.setAllowConnectionsFromStrangers(!checkBoxState)
    strangerUtills.changeStrangerConnectionStatus(!checkBoxState)
    
})

// create event listener for video buttons

const micButton = document.getElementById('mic_button')
micButton.addEventListener('click',()=>{
    const localStream = store.getState().localStream
    const micEnabled = localStream.getAudioTracks()[0].enabled
    localStream.getAudioTracks()[0].enabled = !micEnabled
    ui.updateMicButton(micEnabled)
})

const cameraButton = document.getElementById('camera_button')
cameraButton.addEventListener('click',()=>{
    const localStream = store.getState().localStream
    const videoEnabled = localStream.getVideoTracks()[0].enabled
    localStream.getVideoTracks()[0].enabled = !videoEnabled
    ui.updateCameraButton(videoEnabled)
})

const switchForScreenSharingButton = document.getElementById('screen_sharing_button')
switchForScreenSharingButton.addEventListener('click',()=>{
    const screenSharingActive = store.getState().screenSharingActive
    webRTC.switchBetweenCameraAndScreenSharing(screenSharingActive)
})

// message input

const newMessageInput = document.getElementById('new_message_input')
newMessageInput.addEventListener('keydown',(event)=>{
    const message = event.target.value;
    if(event.key=='Enter'){
        webRTC.sendMessageUsingDataChannel(message)
        ui.appendMessage(message,true)
        newMessageInput.value = ""
    }
})

const sendMessageButton = document.getElementById('send_message_button')
sendMessageButton.addEventListener('click',()=>{
    const message = newMessageInput.value
    webRTC.sendMessageUsingDataChannel(message)
    ui.appendMessage(message,true)
    newMessageInput.value = ""
})


//start recording

const startRecordingButton = document.getElementById('start_recording_button')
startRecordingButton.addEventListener('click',()=>{
    recordingUtills.startRecording()
    ui.showRecordingPanel()
})

const stopRecordingButton = document.getElementById('stop_recording_button')
stopRecordingButton.addEventListener('click',()=>{
    recordingUtills.stopRecording()
    ui.resetRecordingButtons()
})

const pauseRecordingButton = document.getElementById('pause_recording_button')
pauseRecordingButton.addEventListener('click',()=>{
    recordingUtills.pauseRecording()
    ui.switchPauseAndResumeButton(true)
})
const resumeRecordingButton = document.getElementById('resume_recording_button')
resumeRecordingButton.addEventListener('click',()=>{
    recordingUtills.resumeRecording()
    ui.switchPauseAndResumeButton()
})

// hang up

const hangUpVideoButton = document.getElementById('hang_up_button')
hangUpVideoButton.addEventListener('click',()=>{
    webRTC.handleHangUp();
})

const hangUpChatButton = document.getElementById('finish_chat_call_button')
hangUpChatButton.addEventListener('click',()=>{
    webRTC.handleHangUp();
})
