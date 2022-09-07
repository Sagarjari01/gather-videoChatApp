import * as constants from './constants.js'
import * as elements from './elements.js'

export const updatePesonalCode = (code)=>{
    let personalCodeParagraph = document.getElementById('personal_code_paragraph')
    personalCodeParagraph.innerHTML = code
}

export const updateLocalVideo = (Stream) =>{
    const localVideo = document.getElementById('local_video')
    localVideo.srcObject = Stream

    localVideo.addEventListener('loadedmetadata',()=>{
        localVideo.play()
    })
}

export const updateRemoteVideo = (stream)=>{
    const remoteVideo = document.getElementById('remote_video')
    remoteVideo.srcObject = stream
}

export const showIncomingCallDialog = (callType,acceptCallHandler,rejectCallHandler) =>{
    const callTypeInfo = callType===constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video"
    console.log(callTypeInfo)
    const IncomingCallDialog =  elements.getIncomingDialog(callTypeInfo,acceptCallHandler,rejectCallHandler);

    //removing all previous dialog and appending incoming call dialog
    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove())
    dialog.appendChild(IncomingCallDialog)
}

export const showCallingDialog = (callRejectionHandler) =>{

    const CallingDialog = elements.getCallingDialog(callRejectionHandler)

    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove())
    dialog.appendChild(CallingDialog)

}

export const removeAllDialogs = () =>{
    const dialog = document.getElementById('dialog')
    dialog.querySelectorAll('*').forEach((dialog)=>dialog.remove())
}

export const showNoUserAvailable = () =>{
    const infoDialog = elements.getInfoDialog('No Stranger Available','please try again later')
    if(infoDialog){
        const dialog = document.getElementById('dialog')
        dialog.appendChild(infoDialog)
        setTimeout(()=>{
            removeAllDialogs()
        },[4000])
    }
}

export const showInfoDialog = (preOfferAnswer) =>{
    let infoDialog  = null;
    if(preOfferAnswer===constants.preOfferAnswer.CALLEE_NOT_FOUND){
        infoDialog = elements.getInfoDialog('User Not Found','Please check personal code')
    }

    if(preOfferAnswer===constants.preOfferAnswer.CALL_UNAVAILABLE){
        infoDialog = elements.getInfoDialog('Call Unavailable','User is busy on another call')
    }

    if(preOfferAnswer===constants.preOfferAnswer.CALL_REJECTED){
        infoDialog = elements.getInfoDialog('Call Rejected','User refused to connect')
    }

    if(infoDialog){
        const dialog = document.getElementById('dialog')
        dialog.appendChild(infoDialog)
        setTimeout(()=>{
            removeAllDialogs()
        },[4000])
    }
}

export const showElements = (callType) =>{
    if(callType===constants.callType.CHAT_PERSONAL_CODE || callType===constants.callType.CHAT_STRANGER){
        showChatCallElements(); 
    }

    if(callType === constants.callType.VIDEO_PERSONAL_CODE || callType===constants.callType.VIDEO_STRANGER){
        showVidoCallElements();
    }
}

const showChatCallElements = () =>{
    
    const finishCallButtonContainer= document.getElementById('finish_chat_button_container')
    showElement(finishCallButtonContainer)

    const newMessageContainer = document.getElementById('new_message')
    showElement(newMessageContainer)

    disableDashboard()
}

const showVidoCallElements = () =>{
    const callButtons = document.getElementById('call_buttons')
    showElement(callButtons)

    const placeholder = document.getElementById("video_placeholder");
    hideElement(placeholder);

    const remoteVideo = document.getElementById('remote_video')
    showElement(remoteVideo)

    const newMessageContainer = document.getElementById('new_message')
    showElement(newMessageContainer)

    disableDashboard()
}

export const showVideoCallButtons = () =>{
    const personalVideoButton = document.getElementById('personal_code_video_button')
    const strangerVideoButton = document.getElementById('stranger_video_button')
    showElement(personalVideoButton)
    showElement(strangerVideoButton)
}

const micOn = './utils/images/mic.png'
const micOff = './utils/images/micOff.png'
export const updateMicButton = (micActive) =>{
    let micButtonImage = document.getElementById('mic_button_image')
    micButtonImage.src = micActive? micOff : micOn
}

const cameraOn = './utils/images/camera.png'
const cameraOff = './utils/images/cameraOff.png'
export const updateCameraButton = (videoActive) =>{
    let cameraButton = document.getElementById('camera_button_image')
    cameraButton.src = videoActive?cameraOff:cameraOn
}

// ui messages
export const appendMessage = (message,right=false) =>{
    const messageContainer = document.getElementById('messages_container')
    messageContainer.classList.add('messages_container')
    const messageSide = right ? elements.rightMessage(message) : elements.leftMessage(message)
    messageContainer.appendChild(messageSide)
    
}

// clear message
export const clearMessage = () =>{
    const messageContainer = document.getElementById('messages_container')
    messageContainer.querySelectorAll("*").forEach((data)=>data.remove())
}

export const showRecordingPanel = () =>{
    const recordingButton = document.getElementById('video_recording_buttons')
    showElement(recordingButton)

    const startRecordingButton = document.getElementById('start_recording_button')
    hideElement(startRecordingButton)
}

export const resetRecordingButtons = () =>{
    const startRecordingButton = document.getElementById('start_recording_button')
    showElement(startRecordingButton)

    const recordingButton = document.getElementById('video_recording_buttons')
    hideElement(recordingButton)
}

export const switchPauseAndResumeButton = (isPaused = false)=>{
    const pauseButton = document.getElementById('pause_recording_button')
    const resumeButton = document.getElementById('resume_recording_button')

    if(isPaused){
        hideElement(pauseButton)
        showElement(resumeButton)
    }else{
        hideElement(resumeButton)
        showElement(pauseButton)
    }
}

export const updateUIAfterHangUp = (callType) =>{
    enableDashboard()
    if(callType===constants.callType.VIDEO_PERSONAL_CODE ||
        callType === constants.callType.VIDEO_STRANGER){
            console.log('called here 1')
        const callButtons = document.getElementById('call_buttons')
        hideElement(callButtons)
        }else{
            const chatButtons = document.getElementById('finish_chat_button_container')
            hideElement(chatButtons)
        }
    const newMessageInput = document.getElementById('new_message')
    hideElement(newMessageInput)
    clearMessage()
    updateMicButton(false)
    updateCameraButton(false)

    // hide remote video and show placeHolder
    const placeHolder = document.getElementById('video_placeholder')
    showElement(placeHolder)
    const remoteVideo = document.getElementById('remote_video')
    hideElement(remoteVideo)
    

    removeAllDialogs()
}
// change status of checkbox
export const updateStrangerCheckBox =(allowConnections) =>{
    const checkImage = document.getElementById('allow_strangers_checkbox_image')

    allowConnections ? showElement(checkImage):hideElement(checkImage)
}


//ui helpers

const enableDashboard = () =>{
    const dashboardBlocker = document.getElementById('dashboard_blur')
    if(!dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.add('display_none')
    }
}
const disableDashboard = () =>{
    const dashboardBlocker = document.getElementById('dashboard_blur')
    if(dashboardBlocker.classList.contains('display_none')){
        dashboardBlocker.classList.remove('display_none')
    }
}

const hideElement = (element) =>{
    if(!element.classList.contains('display_none')){
        element.classList.add('display_none')
    }
}

const showElement = (element) =>{
    if(element.classList.contains('display_none')){
        element.classList.remove('display_none')
    }
}













