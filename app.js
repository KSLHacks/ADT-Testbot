// Require npm packages
require('dotenv').config()
const restify = require('restify')
const builder = require('botbuilder')

// =========================================================
// Bot Setup
// =========================================================

// Setup Restify Server
var server = restify.createServer()
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url)
})

// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_PASS
})

var bot = new builder.UniversalBot(connector)

// // Configuration Object
// var ConfigObject = {
//   'EndpointURL': 'https://metrics.customer.com',
//   'EndpointMethod': 'POST'
//   // any other config settings to be passed
//   // data from DLC passed through
// }

// bot = ApplyTelemetryMiddleware(bot, ConfigObject)

bot.use({
  botbuilder: function (session, next) {
    console.log('Got botbuilder middelware: ', session)

    bot.once('send', (event) => {
      console.log('message to send:', event)
      event.test = 'TEST'
      // Create payload object: ConfigObject, session.message.analytics, session, message
      // var body = {
        // TODO: populate with required data.
      // }

      // Call endpoint defined in ConfigObject
    })
    next()
  }
})

server.post('/api/messages', connector.listen())

// =========================================================
// Bots Dialogs
// =========================================================

// Require dialogs
const setNameDialog = require('./dialogs/setName')
const sendMoneyDialog = require('./dialogs/sendMoney')

setNameDialog(bot)
sendMoneyDialog(bot)

// present the user with a main menu of choices they can select from
bot.dialog('/', [
  function (session, results) {
    var style = builder.ListStyle['button']
    builder.Prompts.choice(session, 'I can do any of these, pick one!', ['Set Name', 'Send Money'], { listStyle: style })
  },
  function (session, results) {
    switch (results.response.index) {
      case 0:
        session.beginDialog('/setName')
        break
      case 1:
        session.beginDialog('/sendMoney')
        break
    }
  }
])
