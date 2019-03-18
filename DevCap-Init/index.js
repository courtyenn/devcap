const CLIENT_ID = process.env.CLIENT_ID
const DOMAIN = process.env.DOMAIN
const REDIRECT_URI = `${DOMAIN}/hello`

const scopes = [
  'channels:read',
  'users.profile:read',
  'bot',
  'chat:write:bot',
]

exports.main = (event, context, callback) => {
  callback(null, {statusCode: 302, headers: {'Location': `https://slack.com/oauth/authorize?client_id=${CLIENT_ID}&scope=${scopes.join(' ')}&redirect_uri=${REDIRECT_URI}`}});
}