require('dotenv').config()
const { ActivityType } = require('discord.js');


module.exports = client => {
    console.log(`${client.user.tag} is now online!`);
    const activities_list = [
      `${client.guilds.cache.size.toLocaleString()} servers`,
      `${client.users.cache.size.toLocaleString()} users`,
      `@ me for prefix`,
      `${process.env.prefix}help for more info`    
    ];
    client.user.setPresence({status: 'idle'});
      setInterval(() => {
        const activityIndex = Math.floor(Math.random() * (activities_list.length));
        client.user.setActivity(activities_list[activityIndex], { type: ActivityType.Watching });
  }, 15000);
};
