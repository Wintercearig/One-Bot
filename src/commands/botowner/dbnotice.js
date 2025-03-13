module.exports = {
    name: "dbnotice",
    description: "Send bot update notifications to all subscribed users",
    category: "botowner",
    usage: "dbnotice <message>",
    ownerOnly: true,
    run: async (client, message, args) => {
        const notificationMessage = args.join(" ");
        if (!notificationMessage) return message.reply("Please provide a message to send.");   
        
        client.sendBotUpdates(client, notificationMessage);
    },
};