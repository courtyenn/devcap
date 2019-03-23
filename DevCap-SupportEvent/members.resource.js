const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()
const moment = require('moment')
const TABLE = process.env.TABLE

module.exports.getAllDueDevs = () => {
  return new Promise((resolve, reject) => {
    const scan = {
      IndexName: 'last_customer_alignment-index',
      TableName: TABLE,
      FilterExpression : 'last_customer_alignment >= :test AND #s <> :never',
      ExpressionAttributeValues : {
        ':test' : moment().subtract(process.env.TIMER, 'days').utc().format('YYYY-MM-DD'),
        ':never': 'never'
      },
      ExpressionAttributeNames: {
        '#s': 'status'
      }
    }

    client.scan(scan, (err, data) => {
      if(!err){
        resolve(data)
      }
      else {
        reject(err)
      }
    })
  })
}