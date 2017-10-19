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
//   'endpointURL': 'https://metrics.customer.com',
//   'endpointMethod': 'POST'
//   'botVersion': 'v3'
//   // any other config settings to be passed
//   // data from DLC passed through
// }

// bot = ApplyTelemetryMiddleware(bot, ConfigObject, function)

bot.use({
  botbuilder: function (session, next) {
    console.log('Got botbuilder middelware: ', session)

    bot.once('send', (event) => {
      console.log('message to send:', event)
      event.test = 'TEST'
      // Create payload object: ConfigObject, session.message.analytics, session, message
      var body = {
        botName: event.address.bot.name,
        botChannel: event.address.channelId,
        userMessage: session.message.text,
        userMessageLength: session.message.text.length,
        userMessageTimestamp: session.message.timestamp,
        botResponse: event.text,
        botResponseTimestamp: event.timestamp,
        botResponseLength: event.text.length,
        botResponseLatency: (session.message.localTimestamp - event.localTimestamp) // (user message received - bot response)
        // The active Dialog and step (For waterfall dialogs)
        // Intent recognized in the user message + entities - When applicable
        // Optional - Text Analytics data: Sentiment score, language, key phrases. Ideally hooking up text analytics with Adobe Analytics should be plug 'n' play - via the Experience Cloud SDK Configuration?

        // Identified question - When the bot uses QnA maker and QnA maker have matched a question in it's database.
        // Custom data - The SDK should provide a "hook" for the bot developer to augment Analytics data with it's own data elements.
        // Errors - When the bot receives an utterance and does not know what to do with it.
        // Launch events - I want to know how frequently users launch the bot and start new chat sessions so I can observe adoption and return use
      }
      console.log('>>>>>>>>> body:', body)
      // call function
      // /////////////////

      // The user message - Cleaned, capped at 255 characters. (Cleaning = Remove CRLF, extra spaces, etc)
      // body.userMessage = body.userMessage.trim()
      // if (body.userMessage.length > 255) { body.userMessage = body.userMessage.substring(0, 255) }

      // The bot version - Managed by the bot developer
        // body.version: ConfigObject.botVersion
      // if (typeof ConfigObject.botVersion === 'undefined') { body.botVersion = ConfigObject.botVersion }

      // Passed through the DLC
      // The user location - IP address (If known), or any other location data available
      // Browser - For web channel / direct line when coming through a browser
      // Host page URL - For web channel / direct line when coming through a browser
        // body.userLocation: session.userData.Telemetry.location (passed in from DLC into session.userData bag)
        // body.browser:
        // body.hostPageUrl:

      // /////////////////
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
