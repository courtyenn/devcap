const Slack = require('./slack.js')
const BOT_TOKEN = process.env.BOT_TOKEN

exports.main = (event, context, callback) => {
  if (event.body) {
    let body = JSON.parse(event.body)
    if (body){
      console.log('google calendar event', body)
      const name = body.summary
      if(!!name.matches(/cancellation|onboarding|cancelation/gmi)){
        const botSlack = Slack(BOT_TOKEN)
        botSlack.notifyMembers(body, (err, data) => {
          if(err) callback(err, {statusCode: 500, body: 'Something went wrong!'})
          callback(err, {statusCode: 200, body: 'Success!'})
        })
      }
      else {
        callback(null, {statusCode: 200, body: 'Success!'})
      }
    }
    else {
      callback('Incorrect post data')
    }
  }
}