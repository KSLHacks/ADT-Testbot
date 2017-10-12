const builder = require('botbuilder')

module.exports = function (bot) {
  bot.dialog('/setName', [
    function (session, results) {
      builder.Prompts.text(session, 'Please enter your name')
    },
    function (session, results) {
      session.send('Updating your name..')
      session.send('Your name is now set to ' + results.response + '.')
      session.endDialog()
    }
  ])
}
