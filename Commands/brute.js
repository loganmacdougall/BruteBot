const Brute = require("../Classes/Brute");
const brute = new Brute();
const bruteHelpString = {
  desc: "Brute Bot: Brute force any website!\n",
  url: "$brute url {url}: sets the url of brute bot",
  data: "$brute data {data}: set default form data",
  field:
    "$brute field {field}: set the field which is to be changed (password field in data)",
  rules:
    "$brute rules {ruleset}: sets the rules to be applied on the wordlist [p(erm)d, c(omb)d, u(upper), l(ower), b(oth)]",
  info: "$brute info: returns all data currently set",
  wordlist: `$brute wordlist {Type/File/URL} {...words/file.txt/URL to text file}: Sets/Displays the wordlist\n
$brute wordlist display: will display the current wordlist`,
  try: "$brute try {password}: will try the password specified",
  run: "$brute run: Will start brute forcing passwords",
  stop: "$brute stop: Will stop brute force if it is running",
  status:
    "$brute status: Will tell you how far long the brute forcing has come",
};

module.exports = {
  name: "brute",
  description: "Brute force any website!",
  execute(message, args) {
    if (args.length === 0) {
      message.channel.send(Object.values(bruteHelpString).join("\n"));
      return;
    }

    const command = args.shift().toLowerCase();

    if (
      ["info", "rules", "run", "stop", "status"].every((c) => c !== command)
    ) {
      if (showHelpIfNullArgs(args, command, message)) return;
    }

    if (command == "url") {
      displayResult(brute.set_url(args[0]), command, message);
    } else if (command === "data") {
      displayResult(brute.set_data(args.join("")), command, message);
    } else if (command === "field") {
      displayResult(brute.set_field(args[0] || ""), command, message);
    } else if (command === "rules") {
      displayResult(brute.set_ruleset(args[0]), command, message);
    } else if (command === "wordlist") {
      wordlistCommand = args.shift().toLowerCase();
      displayResult(
        brute.wordlist_controller(wordlistCommand, args, message),
        command,
        message
      );
    } else if (command === "try") {
      displayResult(brute.try_password(args[0], message), command, message);
    } else if (command === "run") {
      displayResult(brute.run(message), command, message);
    } else if (command === "stop") {
      displayResult(brute.stop(message), command, message);
    } else if (command === "status") {
      displayResult(brute.status(message), command, message);
    } else if (command === "info") {
      message.channel.send(brute.info());
    } else {
      message.channel.send(Object.values(bruteHelpString).join("\n"));
    }
  },
};

function displayResult(value, command, message) {
  if (typeof value === "string") {
    if (value.length > 0) message.channel.send(value);
  } else if (command in bruteHelpString) {
    message.channel.send(bruteHelpString[command]);
  } else {
    message.channel.send(Object.values(bruteHelpString).join("\n"));
  }
}

function showHelpIfNullArgs(args, command, message) {
  if (!(command in bruteHelpString)) {
    message.channel.send(Object.values(bruteHelpString).join("\n"));
    return true;
  }
  if (args.length === 0) {
    message.channel.send(bruteHelpString[command]);
    return true;
  }
  return false;
}
