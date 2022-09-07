import * as wss from './wss.js'
import * as webRTC from './webRTCHandler.js'
import * as ui from './ui.js'
let strangerCallType
export const changeStrangerConnectionStatus = (status) =>{
    const data = {status}
    wss.changeStrangerConnectionStatus(data)
}

export const getStrangerSocketIdAndConnect = (callType) =>{
    strangerCallType = callType
    wss.getStrangerSocketId()
}   

export const connectWithStranger = (data) =>{
    // console.log(data.randomSocketId)
    if(data.randomSocketId){
        webRTC.sendPreOffer(strangerCallType,data.randomSocketId)
    }else{
        // send not available
        ui.showNoUserAvailable()
    }
}