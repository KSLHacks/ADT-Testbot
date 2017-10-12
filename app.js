// Require npm packages
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
