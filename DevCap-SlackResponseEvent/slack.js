const axios = require('axios')
const RxHR = require('@akanass/rx-http-request').RxHR

module.exports.updateAttachment = ({channel, ts, status, originalMessage}, authToken) => {
  let text = 'Incorrect status sent'
  console.log(channel, ts, status)
  if(status === 'snooze'){
    text = 'Snoozed for 90 days :thumbs-up:'
  }
  else if (status === 'join'){
    text = `Great! Don't forget to add yourself to the event. :white_check_mark:`
  }
  else if(status === 'next'){
    text = 'On standby!'
  }
  else if(status === 'never'){
    text = 'DevCap sad :nic-sad:'
  }

  return RxHR.post(`https://slack.com/api/chat.update`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    body: {
      channel,
      ts,
      text: decodeURIComponent(originalMessage.text.replace(/\+/g, '%20')),
      attachments: [newAttachment(text, originalMessage)],
    },
    json: true,
  })
}

const newAttachment = (text, originalMessage) => {

  return {
    "callback_id": "slack",
    "color": "good",
    text,
    actions: []
  }
}
