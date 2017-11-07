// Require npm packages
require('dotenv').config()
const ApplyAdobeTelemetryMiddleware = require('AnalyticsBotSDK')
// const cognitiveServices = require('botbuilder-cognitiveservices')
const builder = require('botbuilder')
const restify = require('restify')

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

// Setup LUIS connection
var model = 'https://eastus2.api.cognitive.microsoft.com/luis/v2.0/apps/' + process.env.LUIS_ID + '?subscription-key=' + process.env.LUIS_KEY + '&verbose=true'
var luisRecognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({recognizers: [luisRecognizer]})

// Setup QnA connection
// var qnaRecognizer = new cognitiveServices.QnAMakerRecognizer({
//   knowledgeBaseId: process.env.QnA_ID,
//   subscriptionKey: process.env.QnA_KEY
// })

// =========================================================
// Middleware: botbuilder-telemetry
// =========================================================
// REQUIRED Configuration Object
// REQUIRED for Adobe
var configObject = {
  'botVersion': 'v3',
  'luisRecognizer': luisRecognizer,
  // 'qnaRecognizer': qnaRecognizer,
  'orgId': '33C1401053CF76370A490D4C@AdobeOrg',
  'analyticsServer': 'https://hackathon.sc.omtrdc.net',
  'rsid': 'geo1xxpnwbotsdkdev',
  'pageName': 'sc.omtrdc.net'
}

// REQUIRED function: API/Endpoint/DB Connection calls
// OPTIONAL for Adobe
function dataHandleFunction (body, session, messages, configObject) {
  console.log('>>>> Body', body)
}

// OPTIONAL function: add/mutate and compute data before sending to endpoint
// OPTIONAL for Adobe
// function dataMutationFunction (body, session, event, ConfigObject) { }

// bot = ApplyTelemetryMiddleware(bot, configObject, dataHandleFunction, dataMutationFunction)
bot = ApplyAdobeTelemetryMiddleware(bot, configObject, dataHandleFunction)

// =========================================================
// Bots Dialogs
// =========================================================

// Require dialogs
const setNameDialog = require('./dialogs/setName')
const sendMoneyDialog = require('./dialogs/sendMoney')

setNameDialog(bot)
sendMoneyDialog(bot)

bot.dialog('/', dialog)

dialog.matches('greeting', [
  function (session, results) {
    session.conversationData = {
      'telemetry': {
        'brower': 'Microsoft Edge',
        'IPaddress': '192.168.1.1',
        'HostUrl': 'https://www.test.com'
      }
    }
    session.save()
    session.send('Hello! I am your friendly bot.')
  }
])

dialog.matches('mainMenu', [
  function (session, results) {
    session.beginDialog('/mainMenu')
  }
])

// present the user with a main menu of choices they can select from
bot.dialog('/mainMenu', [
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

dialog.matches('None', [
  function (session, results) {
    session.send('NONE intent')
  }
])
