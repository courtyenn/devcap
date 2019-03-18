const server = require('server')
const axios = require('axios')
const morgan = require('morgan')
const { get, post, error } = server.router
const { redirect, status, send } = server.reply
const Slack = require('./slack')
const memberDb = require('./members.resource')
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const BOT_TOKEN = process.env.BOT_TOKEN
const DOMAIN = process.env.DOMAIN
const scopes = [
  'channels:read',
  'users.profile:read',
  'bot',
  'chat:write:bot',
]
let ACCESS_TOKEN;

const REDIRECT_URI = `${DOMAIN}/hello`

let logger = morgan('common')
const serverLogger = server.utils.modern(logger);

const handleError = (e) => {
  console.error(e)
}

const test = t => console.log(t)

const authorizeDevCap = get('/devcap', ctx => {
  return redirect(`https://slack.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${scopes.join(' ')}&redirect_uri=${REDIRECT_URI}`)
})

const retrieveAccessToken = get('/hello', async ctx => {
  const code = ctx.query.code
  try {
    let resp = await axios(`https://slack.com/api/oauth.access?code=${code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}`)

    ACCESS_TOKEN = resp.data.access_token
    const mySlack = Slack(ACCESS_TOKEN)
    mySlack.getMemberListFromChannel().subscribe(test, handleError)
    return status(200).send('Thank you for choosing DevCap!')
  } catch(e){
    throw new Error('Access token not found')
  }
})

const messageMe = get('/message', async ctx => {
  const botSlack = Slack(BOT_TOKEN)
  botSlack.notifyMembersWithMessage('UFN9XP2UU').subscribe(test, handleError)
  return status(200).send('message maybe sent')
  // botSlack.notifyMembersWithMessage('UG6HYSV7W')
})

const slackVerify = post('/slack', ctx => {
  return send(ctx.body.challenge)
})

const saveUserResponse = post('/join', ctx => {
  const body = JSON.parse(ctx.body.payload)
  const action = body.actions[0]
  const user = user
  memberDb.saveMemberResponse(action, user)
  return status(200)
})

const handleGoogleEvent = post('/calendar-event', ctx => {
  const {start, creator, summary} = ctx.body
  const botSlack = Slack(BOT_TOKEN)
  botSlack.notifyMembersWithMessage({start, creator, summary}).subscribe(test, handleError)
  return status(200)
})

// exports.main = () => {
  server({ port: 3000, security: { csrf: false } }, [
    serverLogger,
    get('/', ctx => send('Hello world')),
    handleGoogleEvent,
    authorizeDevCap,
    retrieveAccessToken,
    messageMe,
    slackVerify,
    saveUserResponse,
    error(ctx => status(500).send(ctx.error.message))
  ])
// }