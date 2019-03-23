const moment = require('moment')
const Rx = require('rxjs')
const {pluck, map, flatMap, mergeMap, expand, tap, first, filter, catchError, forkJoin, switchMap, mergeAll} = require('rxjs/operators')
const RxHR = require('@akanass/rx-http-request').RxHR
const CHANNEL = process.env.CHANNEL

module.exports = (authToken) => {
  const getChannel = (cursor) => {
    let url = `https://slack.com/api/conversations.list?token=${authToken}${cursor ? `&cursor=${cursor}` : ''}`
    return RxHR.get(url, {json: true})
      .pipe(expand(resp => { // recursion
      if(resp){
          let cursor = resp.body.response_metadata.next_cursor
          let uri = `https://slack.com/api/conversations.list?token=${authToken}${cursor ? `&cursor=${cursor}` : ''}`
          return cursor ? RxHR.get(uri, {json: true}) : Rx.EMPTY
        }
        else {
          return Rx.EMPTY
        }
      }),
      pluck('body', 'channels'),
      flatMap(channels => {
        const filtered = channels.filter(channel => channel.name === CHANNEL)
        if(filtered.length) {
          return filtered;
        }
        return Rx.EMPTY

      }),
      first(),
    )
  }

  const getMembers = (channel) => {
    console.log('channel', channel)
    return RxHR.get(`https://slack.com/api/conversations.members?token=${authToken}&channel=${channel}`, {json: true})
    .pipe(
    pluck('body', 'members'))
  }

  const getMemberInfo = (memberId) => {
    return RxHR.get(`https://slack.com/api/users.info?token=${authToken}&user=${memberId}`, {json: true})
    .pipe(
    pluck('body', 'user'),
    )
  }

  return {
    getMemberListFromChannel: () => {
      return getChannel()
      .pipe(switchMap(channel => getMembers(channel.id)),
      flatMap(members => {
        // console.log('test', members)
        return Rx.forkJoin(members.map(m => {
          // console.log('getting ', m)
          return getMemberInfo(m)
        }))
      }),
      mergeAll(),
      filter(m => m.deleted === false),
      map(m => {
        return {
          slack_id: m.id,
          full_name: m.real_name,
          first_name: m.profile.first_name,
          last_name: m.profile.last_name,
          last_customer_alignment: moment().subtract(process.env.TIMER, 'days').utc().format(),
          attendance_count: 0,
          status: 'none'
        }
      })
      )
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