const memberDb = require('./members.resource')
const Slack = require('./slack')
const BOT_TOKEN = process.env.BOT_TOKEN

exports.main = (event, context, callback) => {
  const body = decodeURIComponent(event.body)
  const payload = JSON.parse(body.replace('payload=', ''))
  Slack.updateAttachment({channel: payload.channel.id, ts: payload.message_ts, status: payload.actions[0].value, originalMessage: payload.original_message}, BOT_TOKEN)
  .subscribe(data => {
    callback(null, {statusCode: 200})
  }, err => {
    callback(null, {statusCode: 200})
  })
  memberDb.saveMemberResponse({action: payload.actions[0].value, user: payload.user})

}