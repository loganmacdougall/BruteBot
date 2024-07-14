# BruteBot

A discord bot which can perform a variety of different brute force password attacks to a specified website.

## Commands

Every command starts with the string `$brute`. From there, there's a list of supported commands
- $brute url {url}: sets the url of brute bot
- $brute data {data}: set default form data
- $brute field {field}: set the field which is to be changed (password field in data)
- $brute rules {ruleset}: sets the rules to be applied on the wordlist [p(erm)d, c(omb)d, u(upper), l(ower), b(oth)]
- $brute info: returns all data currently set
- $brute send {form/data}: will set how the data should be sent
- $brute wordlist {Type/File/URL} {...words/file.txt/URL to text file}: Sets the wordlist
- $brute wordlist display {index}: will display the current wordlist or will display which password is at the specified index of the complete wordlist
- $brute try {password}: will try the password specified
- $brute run: Will start brute forcing passwords
- $brute stop: Will stop brute force if it is running
- $brute status: Will tell you how far long the brute forcing has come

## Example

When using the brute bot you'll need to first set the necessary fields based on your attack
- url: The endpoint that you'll be brute-forcing (`http://www.website.com/login`)
- data: The data fields that the url will be expected (`{"username": "user", "password": "pass"}`)
- field: The field being brute forced which is usually the password field (password)
- send format: This will set the format of the data to be formated as form or data (data)

Once that's done, you now need to tell the bot what passwords to try. This is done through either a wordlist, a ruleset, or a combination of both.
For example, if I wanted to try all 4 and 5 digit number combinations, I would run:
```
$brute wordlist Type 0 1 2 3 4 5 6 7 8 9
$brute rules c45
```

Finally, I just need to type `$brute run` and the bot will begin the attack on the website. You can then type `$brute stop` to end the attack or `$brute status` to see how far along the attack is currently and how much time is left for the attack.
Here's an image example of setting the wordlist using a wordlist from [the Seclists repository](https://github.com/danielmiessler/SecLists).

![Brute Bot Demo](https://github.com/loganmacdougall/BruteBot/blob/master/brute-bot-demo.png)
