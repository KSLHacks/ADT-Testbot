const builder = require('botbuilder')
var recipient
var amount

module.exports = function (bot) {
  bot.dialog('/sendMoney', [
    function (session, results) {
      session.send('I need some information before I can send money..')
      builder.Prompts.text(session, 'Please enter the recipient')
    },
    function (session, results) {
      // update recipient
      recipient = results.response
      builder.Prompts.number(session, 'Please enter the amount to send to ' + recipient + '.')
    },
    function (session, results) {
      // update amount
      amount = results.response
      session.send('$' + amount + ' will be sent to ' + recipient + '.')
      session.endDialog()
    }
  ])
}
