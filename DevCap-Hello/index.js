const axios = require('axios')

const Slack = require('./slack')
const memberDb = require('./members.resource')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const DOMAIN = process.env.DOMAIN
const REDIRECT_URI = `${DOMAIN}/hello`

let ACCESS_TOKEN;

exports.main = (event, context, callback) => {
  const code = event.queryStringParameters.code
  try {
    axios(`https://slack.com/api/oauth.access?code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}`).then(resp => {

      ACCESS_TOKEN = resp.data.access_token

      if(!ACCESS_TOKEN)console.log('No access token')

      const mySlack = Slack(ACCESS_TOKEN)
      mySlack.getMemberListFromChannel().subscribe(member => {
        memberDb.saveMember(member, (err, data) => {
          if(err)throw err
          let response = {
            statusCode: 200,
            body: 'Thank you for choosing DevCap!'
          };
          callback(err, response)
        })
      }, e => {
        console.log(e)
        callback(e, null)
      })
    })

  } catch(e){
    throw e;
  }
}
