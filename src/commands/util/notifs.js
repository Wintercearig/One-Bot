const { EmbedBuilder } = require('discord.js');
const User = require("../../../models/User.model");

// Display list of all possible notifications
const allNotifs = [
    'Bot Updates', 
    'Guild Status', 
    /* ... other notifs ... */
];

// Function to normalize notification types for comparison
const normalize = (str) => str.toLowerCase().replace(/\s/g, '');
module.exports = {
  name: "notifs",
  description: "Returns your notifs config",
  category: "util",
  usage: "notifs [enable/disable] [notifType]",
  aliases: ["notif", "notifications"],
  run: async (client, message) => {
    const args = message.content.split(' ').slice(1);
    const userId = message.author.id;

    if (args.length >= 2) {
      const action = args[0];
      const notifType = normalize(args[1]);

      // Check if the normalized input is a valid notification type
      if (!allNotifs.map(normalize).includes(notifType)) {
        return message.channel.send('Invalid notification type.');
      }

      const isEnabled = action.toLowerCase() === 'enable';
      const user = await User.findOne({ user_id: userId });
      const userNotifs = user?.notifications ?? [];

      // Check if the notification is already set to the desired state
      const isAlreadySet = userNotifs.includes(notifType) === isEnabled;
      if (isAlreadySet) {
        return message.channel.send(`Notification '${args[1]}' is already ${isEnabled ? 'enabled' : 'disabled'}.`);
      }

      await client.updateUserNotifs(userId, notifType, isEnabled);
      message.channel.send(`Notification '${args[1]}' has been ${isEnabled ? 'enabled' : 'disabled'}.`);
    } else {
      const user = await User.findOne({ user_id: userId });
      let userNotifs = user?.notifications ?? [];

      if (user && (!user.notifications || user.notifications.length === 0)) {
        await User.findOneAndUpdate({ user_id: userId }, { $unset: { notifications: 1 } });
        // Set userNotifs to an empty array for display purposes.
        userNotifs = [];
      }

      const embed = new EmbedBuilder()
        .setTitle('Your Notification Settings')
        .setColor('#5865F2');

      allNotifs.forEach(notif => {
        const isNotifEnabled = userNotifs.includes(normalize(notif));
        embed.addFields({
          name: notif,
          value: isNotifEnabled ? 'Enabled' : 'Disabled',
          inline: true
        });
      });

      message.channel.send({ embeds: [embed] });
    }
  }
};
