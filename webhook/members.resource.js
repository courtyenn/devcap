module.exports.saveMemberResponse = (action, user) => {
  switch(action.value){
    case 'next':
      console.log('Next time', user.id, user.name)
    break;
    case 'join':
    console.log('YES', user.id, user.name)
    break;
    case 'snooze':
    console.log('snooze', user.id, user.name)
    break;
    //save to dynamo
  }
}

module.exports.saveMember = () => {

}