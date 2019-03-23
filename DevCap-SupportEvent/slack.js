const moment = require('moment')
const RxHR = require('@akanass/rx-http-request').RxHR
const membersDb = require('./members.resource')

module.exports = (authToken) => {
  return {
    notifyMembers: (body, callback) => {

      membersDb.getAllDueDevs().then(resp => {
        resp.Items.forEach(member => {
          console.log('member!', member)
          RxHR.post(`https://slack.com/api/chat.postMessage`, {
            headers: {
              Authorization: `Bearer ${authToken}`
            },
            body: createMessage(body, member),
            json: true,
          }).subscribe(data => {
            callback(null, true)
          }, err => {
            console.log('boo!', err)
            callback(err)
          })
        })
      }).catch(callback)
    },
  }

}


let createMessage = ({start, creator, summary, htmlLink}, {full_name, last_customer_alignment, slack_id, status}) => {
  let text = `Hello, ${full_name}!\n\n
  Our records show you haven't been in a Customer Success meeting ${moment(last_customer_alignment).toNow()}.
  ${creator.displayName} just created a meeting called, ${summary}, for ${start.dateTime_pretty}. <${htmlLink}|Navigate to Calendar Event> \n
  Would you like to join?`
  if(status === 'none'){
    text = `Greetings ${full_name}! I am DevCap bot. :wave: \nI was created to help encourage alignment between Dev and CS (Customer Success). So, if you don't mind, I will be reminding you ~90 days to join and listen in on CS meetings regularly. I monitor their calendar (so you don't have to!) and if anything interesting comes up, I will update you! But only if it has been awhile. :)
    \n\nA meeting was created by ${creator.displayName}. Join them for ${summary} on ${start.dateTime_pretty}. <${htmlLink}|Navigate to Calendar Event>
    \nThank you! And up and to the right! :chart_with_upwards_trend:`
  }
  else if(status === 'join'){
    text = `Hey ${full_name}! Thanks for being an engaged member of the Canopian family!
    Guess what? A CS meeting was just created! Come and join ${creator.displayName} for ${summary} on ${start.dateTime_pretty}. \n<${htmlLink}|Navigate to Calendar Event>\nThank you! And up and to the right! :chart_with_upwards_trend:`
  }

    return {
      channel: slack_id,
      text,
      attachments: [
        {
            "text": `Join ${summary}?`,
            "fallback": 'Join a CS meeting',
            "callback_id": "slack",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "join",
                    "text": "Count me in!",
                    "type": "button",
                    "value": "join"
                },
                {
                  "name": "join",
                  "text": "Next time!",
                  "style": "success",
                  "type": "button",
                  "value": "next"
                },
                {
                  "name": "join",
                  "text": "Snooze for 90 days",
                  "type": "button",
                  "value": "snooze"
                },
                {
                  "name": "join",
                  "text": "Opt out of this",
                  "style": "danger",
                  "type": "button",
                  "value": "never",
                   "confirm": {
                        "title": "Are you sure?",
                        "text": "Opting out of this means you will never be notified of any Customer Success events through DevCap.",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                },
            ]
        }
    ]
    }
}