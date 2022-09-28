module.exports = {
  name: "marco",
  description: "This is a ping command!",
  execute(message, args) {
    message.channel.send("polo!");
  },
};
