
export const getIncomingDialog = (callType,acceptCallHandler,rejectCallHandler) =>{
    const dialog = document.createElement('div')
    const dialog_wrapper = document.createElement('div')
    dialog_wrapper.classList.add("dialog_wrapper")

    const dialog_content = document.createElement('div')
    dialog_content.classList.add('dialog_content')
    

    const dialog_title = document.createElement('p')
    dialog_title.classList.add('dialog_title')
    dialog_title.innerHTML = `Incoming ${callType} call`
    dialog_content.appendChild(dialog_title)

    const dialog_image_container = document.createElement('div')
    dialog_image_container.classList.add('dialog_image_container') 
    dialog_content.appendChild(dialog_image_container)
    
    const person_image = document.createElement('img')
    person_image.src='../utils/images/dialogAvatar.png'
    dialog_image_container.appendChild(person_image)
    
    const dialog_button_container = document.createElement('div')
    dialog_button_container.classList.add('dialog_button_container')
    dialog_content.appendChild(dialog_button_container)

    const  accept_button = document.createElement('button')
    accept_button.classList.add('dialog_accept_call_button')
    const acceptImage = document.createElement('img')
    acceptImage.classList.add('dialog_button_image')
    acceptImage.src = '../utils/images/acceptCall.png'
    accept_button.appendChild(acceptImage)
    dialog_button_container.appendChild(accept_button)

    const  reject_button = document.createElement('button')
    reject_button.classList.add('dialog_reject_call_button')
    const rejectImage = document.createElement('img')
    rejectImage.classList.add('dialog_button_image')
    rejectImage.src = '../utils/images/rejectCall.png'
    reject_button.appendChild(rejectImage)
    dialog_button_container.appendChild(reject_button)

    dialog_wrapper.appendChild(dialog_content)

    dialog.appendChild(dialog_wrapper)

    accept_button.addEventListener('click',()=>{
        acceptCallHandler()
    })
    reject_button.addEventListener('click',()=>{
        rejectCallHandler()
    })
    return dialog
}

export const getCallingDialog = (callRejectionHandler) =>{
    const dialog = document.createElement('div')
    const dialog_wrapper = document.createElement('div')
    dialog_wrapper.classList.add("dialog_wrapper")

    const dialog_content = document.createElement('div')
    dialog_content.classList.add('dialog_content')

    const dialog_title = document.createElement('p')
    dialog_title.classList.add('dialog_title')
    dialog_title.innerHTML = `Calling`
    dialog_content.appendChild(dialog_title)

    const dialog_image_container = document.createElement('div')
    dialog_image_container.classList.add('dialog_image_container') 
    dialog_content.appendChild(dialog_image_container)
    
    const person_image = document.createElement('img')
    person_image.src='../utils/images/dialogAvatar.png'
    dialog_image_container.appendChild(person_image)
    
    const dialog_button_container = document.createElement('div')
    dialog_button_container.classList.add('dialog_button_container')
    dialog_content.appendChild(dialog_button_container)
    const  reject_button = document.createElement('button')
    reject_button.classList.add('dialog_reject_call_button')
    const rejectImage = document.createElement('img')
    rejectImage.classList.add('dialog_button_image')
    rejectImage.src = '../utils/images/rejectCall.png'
    reject_button.appendChild(rejectImage)
    dialog_button_container.appendChild(reject_button)

    dialog_wrapper.appendChild(dialog_content)

    dialog.appendChild(dialog_wrapper)

    reject_button.addEventListener('click',()=>{
        callRejectionHandler()
    })
    return dialog
}

export const getInfoDialog = (title,description) =>{
    const dialog = document.createElement('div')
    const dialog_wrapper = document.createElement('div')
    dialog_wrapper.classList.add("dialog_wrapper")

    const dialog_content = document.createElement('div')
    dialog_content.classList.add('dialog_content')

    const dialog_title = document.createElement('p')
    dialog_title.classList.add('dialog_title')
    dialog_title.innerHTML = title
    dialog_content.appendChild(dialog_title)

    const dialog_image_container = document.createElement('div')
    dialog_image_container.classList.add('dialog_image_container') 
    dialog_content.appendChild(dialog_image_container)
    
    const person_image = document.createElement('img')
    person_image.src='../utils/images/dialogAvatar.png'
    dialog_image_container.appendChild(person_image)

    const dialog_description = document.createElement('p')
    dialog_description.classList.add('dialog_description')
    dialog_description.innerHTML = description
    dialog_content.appendChild(dialog_description)

    dialog_wrapper.appendChild(dialog_content)

    dialog.appendChild(dialog_wrapper)
    return dialog
}

// elements for message container

export const leftMessage = (message) =>{
    const messageContainer = document.createElement('div')
    messageContainer.classList.add('message_left_container')
    const messageParagraph = document.createElement('p')
    messageParagraph.classList.add('message_left_paragraph')
    messageParagraph.innerHTML = message
    messageContainer.appendChild(messageParagraph)

    return messageContainer
}

export const rightMessage = (message) =>{
    const messageContainer = document.createElement('div')
    messageContainer.classList.add('message_right_container')
    const messageParagraph = document.createElement('p')
    messageParagraph.classList.add('message_right_paragraph')
    messageParagraph.innerHTML = message
    messageContainer.appendChild(messageParagraph)

    return messageContainer
}