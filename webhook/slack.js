const Rx = require('rxjs')
const Rx2 = require('rxjs/operators')
const RxHR = require('@akanass/rx-http-request').RxHR
const moment = require('moment')

module.exports = (authToken) => {
  const getChannel = (channelName) => {
    return RxHR.get(`https://slack.com/api/conversations.list?token=${authToken}`)
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('channels'))
    .pipe(Rx2.mergeAll()) // flattens array
    .pipe(Rx2.find(c => c.name === channelName))
  }

  const getMembers = (channel) => {
    return RxHR.get(`https://slack.com/api/conversations.members?token=${authToken}&channel=${channel}`)
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('members'))
  }

  const getMemberInfo = (memberId) => {
    return RxHR.get(`https://slack.com/api/users.profile.get?token=${authToken}&user=${memberId}&include_labels=false`)
    // .pipe(Rx2.tap(resp => console.log(resp)))
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('profile'))
  }

  return {
    getMemberListFromChannel: () => {
      return getChannel('development')
      .pipe(Rx2.switchMap(channel => getMembers(channel.id)
        .pipe(Rx2.mergeAll())
        .pipe(Rx2.mergeMap(id => {
          return getMemberInfo(id).pipe(Rx2.mergeScan((acc, profile) => {
            return Rx.of({
              slack_id: id,
              full_name: profile.real_name,
              last_customer_alignment: moment().subtract(process.env.TIMER, 'days').utc().format(),
              attendance_count: 0,
              status: 'none'
            })
          }, {}))
        }))
      ))
    },
    notifyMembersWithMessage: ({start, creator, summary}) => {
      return RxHR.post(`https://slack.com/api/chat.postMessage`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: test({start, creator, summary}),
        json: true,
      })
    },
  }

}


let test = ({start, creator, summary}) => ({
    "channel": "UFN9XP2UU",
    "text": `Hello, _Courtney_! Our records show you haven't been in a Customer Support meeting for _X_ days. ${creator.displayName} just created a meeting called ${summary} on ${start.dateTime_pretty}. Would you like to join it?`,
    "attachments": [
        {
            "text": `Join ${summary}?`,
            "fallback": "You are unable to choose a game",
            "callback_id": "join",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "join",
                    "text": "Count me in!",
                    "type": "button",
                    "value": "yes"
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
            ]
        }
    ]
})