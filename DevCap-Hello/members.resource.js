const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient()

module.exports.saveMember = (member, callback) => {
  client.put({
      TableName: process.env.TABLE_NAME,
      Item: member
  }, callback)
}