const {init, listCalendars, watchChannel, listEvents} = require('./googleauth.js');
const {google} = require('googleapis')
const uuidv1 = require('uuid/v1')

init(subscribeToCalendar)


function subscribeToCalendar(auth){
  // listCalendars(auth)
  // listEvents(auth)
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.watch({
    auth: auth,
        resource: {
            id: uuidv1(),
            type: 'web_hook',
            address: 'https://3697683e.ngrok.io'
         },
        calendarId: 'courtneythuy@gmail.com'

    }, (err, response) => {
        if (err) {
          throw err
        } else {
          console.log(response)

        }
    });

}