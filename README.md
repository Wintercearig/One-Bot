# GITHUB

1- Commit your changes to your branch.

2- Go to GitHub and submit a pull request to have your branch merged with Main

3- Pull from Main into Your_Branch periodically to stay up to date with Main Branch

-----------------------------------------------------------------------------------------------------
These serve as Safe Guards.

        This code calculates the input number, (Decimal Number)
        and does the necessary calculations with divisionResult
        To be deleted, changed, and implimented into math.js in future updates.
        (Lets the code output have a certain number of decimal numbers)

        function divide(x, by) {
        return `${x / by}.${(Number(x % by) / Number(by)).toFixed(4).slice(x >= 0n === by >= 0n ? 2 : 3)}`
        }

        console.log(divide(76561198395997581n, 16n))
-----------------------------------------------------------------------------------------------------
        In order to continue a timed thing such as mute, when the bot comes online
        it reads all guild warnings time, does the necessary calculations to determine
        how much time is left, and continues a new timer based on whats left, in discord, else
        it deletes the timer automatically and runs the proper command, such as unmuting said person
-----------------------------------------------------------------------------------------------------
        Have discord bot have a cache system to retrieve said information that is
        frequented by discord bot or users, as to prevent rate limiting
-----------------------------------------------------------------------------------------------------
        Impliment a feature where the discord bot periodically (every month) checks
        if a certain node module has an update, then it checks if the update is required
        and installs the update
-----------------------------------------------------------------------------------------------------
# .env File
prefix = "-"
token = "your bot token"
mongoDB = "your mongodb connection"
theme = "#9fe3ed"