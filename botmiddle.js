module.exports = function applyMiddleware (bot, middlewareArray) {
  const next = bot.dialog.bind(bot)

  const monkeypatchingDialog = function (name, waterfallFuncs) {
    // middlewareArray[0]()
    next(name, waterfallFuncs)
  }

  // monkeypatchingDialog.addDialogTrigger = next.addDialogTrigger.bind(bot)

  bot.dialog = next // monkeypatchingDialog

  return bot
}
