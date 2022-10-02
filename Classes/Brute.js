const axios = require("axios");
const fetch = require("node-fetch");

class BruteRuleset {
  ruleset = "";
  constructor(ruleset) {
    this.ruleset = ruleset;
  }

  generateList(wordlist) {
    if (!this.ruleset) return wordlist;
    let list = wordlist;
    let templist = [];
    let mode = "n";
    for (const i of this.ruleset.toLowerCase()) {
      switch (i) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          if (mode === "p") {
            templist = templist.concat(perm(list, parseInt(i)));
          } else if (mode === "c") {
            templist = templist.concat(comb(list, parseInt(i)));
          } else if (mode === "n") {
            return "A mode must be selected (p/c) before entering a number";
          } else return;
          continue;
        default:
          break;
      }

      if (templist.length > 0) {
        list = templist;
        templist = [];
      }

      switch (i) {
        case "b":
          list = list.map((x) => [x, x.toLowerCase(), x.toUpperCase()]).flat();
          break;
        case "u":
          list = list.map((x) => [x, x.toUpperCase()]).flat();
          break;
        case "l":
          list = list.map((x) => [x, x.toLowerCase()]).flat();
          break;
        case "p":
          mode = "p";
          break;
        case "c":
          mode = "c";
          break;
        default:
          return "There's no rule associated with " + i;
      }
    }

    if (templist.length > 0) {
      list = templist;
      templist = [];
    }

    return list;
  }
}

class BruteListController {
  index = -1;
  time = 0;
  list = [];

  constructor(list) {
    this.list = list;
    this.time = Date.now();
  }

  next() {
    this.index++;
    return this.list[this.index];
  }

  status() {
    let ci = this.index;
    let d, s, m, h, r;
    let theStatus = ci + 1 + " / " + this.list.length + "\n";
    theStatus += "password: `" + this.list[ci] + "`\n";
    theStatus += "duration: ";
    d = Date.now() - this.time;
    s = Math.floor((d / 1000) % 60)
      .toString()
      .padStart(2, "0");
    m = Math.floor((d / 60000) % 60)
      .toString()
      .padStart(2, "0");
    h = Math.floor(d / 3600000)
      .toString()
      .padStart(2, "0");
    theStatus += h + ":" + m + ":" + s + "\n";
    theStatus += "remaining: ";
    r = (d * this.list.length) / (ci + 1) - d;
    s = Math.floor((r / 1000) % 60)
      .toString()
      .padStart(2, "0");
    m = Math.floor((r / 60000) % 60)
      .toString()
      .padStart(2, "0");
    h = Math.floor(r / 3600000)
      .toString()
      .padStart(2, "0");
    theStatus += h + ":" + m + ":" + s + "";

    return theStatus;
  }
}

class Brute {
  url = null;
  data = null;
  form_data = null;
  password_field = null;
  send_format = "data";

  rules = new BruteRuleset("");
  wordlist = [];
  the_password = "";

  listController = null;
  running = false;

  constructor() {}

  set_url(url) {
    let oldURL = this.url;
    this.url = url;
    return "Brute: Changed URL from " + oldURL + " to " + url;
  }

  set_data(data) {
    let oldData = this.data === null ? "null" : JSON.stringify(this.data);
    let newData = null;
    try {
      newData = JSON.parse(data.replaceAll(/[”“’‘]/g, '"'));
    } catch (e) {
      return -1;
    }
    this.data = newData;
    this.form_data = new URLSearchParams();
    Object.keys(this.data).forEach((key) =>
      this.form_data.append(key, this.data[key])
    );
    if (this.password_field !== null && !(this.password_field in this.data)) {
      this.password_field = null;
    }
    return (
      "Brute: Changed data from " + oldData + " to " + JSON.stringify(newData)
    );
  }

  set_field(field) {
    let oldField = this.feild;
    if (this.data === null) {
      return "You must specify the data first";
    }
    if (!(field in this.data)) {
      return "This field is not found in the data";
    }
    this.password_field = field;
    return "Brute: Changed field from " + oldField + " to " + field;
  }

  set_ruleset(ruleset) {
    let oldRules = this.rules;
    this.rules = new BruteRuleset(ruleset);
    return (
      "Brute: Changed rules from " +
      (oldRules.ruleset || "*none*") +
      " to " +
      (this.rules.ruleset || "*none*")
    );
  }

  set_send_format(format) {
    let oldSendFormat = this.send_format;
    let newSendFormat = null;
    switch (format) {
      case "form":
      case "data":
        newSendFormat = format;
        break;
      default:
        break;
    }

    if (newSendFormat === null) {
      return "You must select a valid format";
    }

    this.send_format = newSendFormat;
    return (
      "Brute: Changed send format from " +
      oldSendFormat +
      " to " +
      newSendFormat
    );
  }

  wordlist_controller(wordlistCommand, args, message) {
    if (wordlistCommand === "display") {
      if (this.wordlist.length === 0) {
        return "The wordlist is empty";
      }
      let str_wordlist = "";
      if (isNaN(args[0])) {
        str_wordlist = "```\n";
        if (this.wordlist.length <= 100) {
          str_wordlist += this.wordlist.join(", ");
        } else {
          str_wordlist +=
            this.wordlist.slice(0, 100).join(", ") +
            "... " +
            (this.wordlist.length - 100) +
            " more";
        }
        str_wordlist += "```";
      } else {
        let i = parseInt(args[0]);
        let possible_passwords = this.rules.generateList(this.wordlist);
        if (typeof possible_passwords === "string") {
          return "Error generating the password list";
        }
        if (i >= possible_passwords.length) {
          return (
            i +
            " is greater than " +
            (possible_passwords.length - 1) +
            ". Invalid range"
          );
        }
        if (i < 0) {
          return i + " is less than 0. Invalid range";
        }
        if (i >= 2) {
          str_wordlist += `\`${i - 2}: ${possible_passwords[i - 2]}\`\n\`${
            i - 1
          }: ${possible_passwords[i - 1]}\`\n`;
        } else if (i == 1) {
          str_wordlist += `\`${i - 1}: ${possible_passwords[i - 1]}\`\n`;
        }
        str_wordlist += `> \`${i}: ${possible_passwords[i]}\``;
        if (i <= possible_passwords.length - 3) {
          str_wordlist += `\n\`${i + 1}: ${possible_passwords[i + 1]}\`\n\`${
            i + 2
          }: ${possible_passwords[i + 2]}\``;
        } else if (i == possible_passwords.length - 2) {
          str_wordlist += `\n\`${i + 1}: ${possible_passwords[i + 1]}\``;
        }
      }

      return str_wordlist;
    }
    if (wordlistCommand === "type") {
      this.wordlist = args;
      return "Setting wordlist to the words typed in the above message";
    } else if (wordlistCommand === "url") {
      if (args.length === 0) {
        return -1;
      }
      (async () => {
        try {
          message.channel.send("Attempting to download wordlist");
          const response = await axios.get(args[0]);
          this.wordlist = response.data.split(/\n+/);
          this.wordlist = this.wordlist.map((word) => word.trim());
          message.channel.send(
            "The wordlist has been set to the text at the provided URL"
          );
        } catch {
          message.channel.send(
            "An error occured setting the wordlist using the provided URL"
          );
        }
      })();
      return "";
    } else if (wordlistCommand === "file") {
      if (!message.attachments) {
        return -1;
      }
      if (
        message.attachments.first().contentType.split(/ +/)[0] !== "text/plain;"
      ) {
        return "The provided file is not a txt file";
      }
      (async () => {
        try {
          message.channel.send("Attempting to download wordlist");
          const response = await axios.get(message.attachments.first().url);
          this.wordlist = response.data.split(/\n+/);
          this.wordlist = this.wordlist.map((word) => word.trim());
          message.channel.send(
            "The wordlist has been set to the text in the provided file"
          );
        } catch {
          message.channel.send(
            "An error occured setting the wordlist using the provided file"
          );
        }
      })();
      return "";
    } else {
      return -1;
    }
  }

  try_password(password, message) {
    if (this.url === null) {
      return "You must specify a URL first";
    }
    if (this.data === null) {
      return "The must specify the data first";
    }
    if (this.password_field === null) {
      return "You must specify a field first";
    }

    (async () => {
      const found = await this.test_password(password, message);

      if (found) {
        message.channel.send(
          "Correct! The password is: `" + this.the_password + "`"
        );
      } else if (found !== null) {
        message.channel.send("Inncorrect password");
      }
    })();
    return "";
  }

  run(message) {
    if (this.running === true) {
      return "Brute bot is already running (run stop if you don't want this)";
    }

    if (
      this.data === null ||
      this.url === null ||
      this.password_field === null
    ) {
      return "Error: make sure all the required values (url, data, field) are set";
    }

    if (this.wordlist.length === 0) {
      return "Your wordlist is empty, no passwords to run";
    }

    let possible_passwords = this.rules.generateList(this.wordlist);

    if (typeof possible_passwords === "string") {
      return possible_passwords;
    }

    (async () => {
      this.listController = new BruteListController(possible_passwords);
      this.running = true;
      this.the_password = null;
      for (
        let password = this.listController.next();
        password !== undefined && this.running == true;
        password = this.listController.next()
      ) {
        let found = await this.test_password(
          password,
          message,
          this.listController.index
        );
        if (found === null) break;
        if (found) {
          message.channel.send(
            "<@" +
              message.author.id +
              "> The password is `" +
              this.the_password +
              "`"
          );
          break;
        }
      }
      if (this.the_password === null) {
        message.channel.send("<@" + message.author.id + "> Password not found");
      }
      this.running = false;
      this.listController = null;
    })();
    return "Brute bot has started running";
  }

  stop() {
    if (!this.running) {
      return "Brute bot wasn't running";
    }
    this.running = false;
    return "Stopping Brute not";
  }

  status() {
    if (!this.running) {
      return "Brute bot is not running. No status to give";
    }
    return this.listController.status();
  }

  async test_password(password, message, index = -1) {
    this.form_data.set(this.password_field, password);

    let dataToSend = {
      method: "POST",
      body: this.form_data,
    };
    if (this.send_format === "form") {
      dataToSend["Content-Type"] = "application/x-www-form-urlencoded";
    }

    let response = undefined;
    try {
      response = await fetch(this.url, {
        method: "POST",
        body: this.form_data,
      });
    } catch (err) {
      return null;
    }
    if (response.ok) {
      this.the_password = password;
      return true;
    } else if (response.status === 403) {
      return false;
    } else {
      let errorMessage =
        "Error: Status code " +
        response.status +
        " unexpected: " +
        response.statusText +
        `\nStopped at \`${password}\``;
      if (index !== -1) {
        errorMessage += ` (index \`${index}\`)`;
      }
      message.channel.send(errorMessage);
      return null;
    }
  }

  info() {
    let theInfo = "url: " + (this.url || "*none*");
    theInfo += "\ndata: " + (this.data ? JSON.stringify(this.data) : "*none*");
    theInfo += "\nfield: " + (this.password_field || "*none*");
    theInfo += "\nsend format: " + this.send_format;
    theInfo += "\nrules: " + (this.rules.ruleset || "*none*");
    theInfo += "\nwordlist:\n";
    if (this.wordlist.length === 0) {
      theInfo += "*empty*";
    } else if (this.wordlist.length <= 3) {
      theInfo += this.wordlist.join(", ");
    } else {
      theInfo +=
        this.wordlist.slice(0, 3).join(", ") +
        "... " +
        (this.wordlist.length - 3) +
        " more";
    }
    theInfo += "\nrunning: " + this.running;

    return theInfo;
  }
}

function parseBoolFromString(str) {
  strLower = str.toLowerCase();
  if (strLower === "on" || strLower === "true" || strLower === "yes") {
    return true;
  } else if (strLower === "off" || strLower === "false" || strLower === "no") {
    return false;
  }
  return null;
}

function perm(list, n) {
  if (n === 1) return list;
  return list
    .map((e, i) => {
      let cutlist = list.slice(0, i).concat(list.slice(i + 1, list.length));
      return perm(cutlist, n - 1).map((x) => e + x);
    })
    .flat();
}

function comb(list, n) {
  if (n === 1) return list;
  return list
    .map((e, i) => {
      return comb(list, n - 1).map((x) => e + x);
    })
    .flat();
}

module.exports = Brute;
