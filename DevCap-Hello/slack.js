const moment = require('moment')
const Rx = require('rxjs')
const Rx2 = require('rxjs/operators')
const RxHR = require('@akanass/rx-http-request').RxHR
const CHANNEL = process.env.CHANNEL

module.exports = (authToken) => {
  const getChannel = () => {
    return RxHR.get(`https://slack.com/api/conversations.list?token=${authToken}`)
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('channels'))
    .pipe(Rx2.mergeAll()) // flattens array d
    .pipe(Rx2.find(c => c.name === CHANNEL))
  }

  const getMembers = (channel) => {
    return RxHR.get(`https://slack.com/api/conversations.members?token=${authToken}&channel=${channel}`)
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('members'))
  }

  const getMemberInfo = (memberId) => {
    return RxHR.get(`https://slack.com/api/users.profile.get?token=${authToken}&user=${memberId}&include_labels=false`)
    .pipe(Rx2.map(resp => JSON.parse(resp.body)))
    .pipe(Rx2.pluck('profile'))
  }

  return {
    getMemberListFromChannel: () => {
      return getChannel(CHANNEL)
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
        }))))
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