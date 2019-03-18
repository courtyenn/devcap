const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()
const moment = require('moment')
const TABLE = process.env.TABLE

module.exports.saveMemberResponse = ({action, user}) => {

  return new Promise((resolve, reject) => {
    console.log('slack_id', user.id)
    let params = {
      TableName: TABLE,
      Key: {slack_id: user.id},
      AttributeUpdates: {
        'status': {
          Action: 'PUT',
          Value: action
        }
      }
    };

    if(action === 'join'){
      params.AttributeUpdates['attendance_count'] = {
        Action: 'ADD',
        Value: 1
      }
      params.AttributeUpdates['last_customer_alignment'] = {
        Action: 'PUT',
        Value: moment().utc().format()
      }
    } else if(action === 'snooze'){
      params.AttributeUpdates['last_customer_alignment'] = {
        Action: 'PUT',
        Value: moment().utc().format()
      }
    }

    client.update(params, (err, data) => {
      if(err) reject(err)

      resolve(data)
    })
  })

}