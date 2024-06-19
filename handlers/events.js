const { readdirSync } = require('fs');

module.exports = async (client) => {
  const player = await client.player;

  let totalDiscordEvents = 0;
  let loadedDiscordEvents = 0;
  let totalPlayerEvents = 0;
  let loadedPlayerEvents = 0;
  let failedEvents = [];

  readdirSync('./src/events/').forEach(dir => {
    const events = readdirSync(`./src/events/${dir}/`).filter(file => file.endsWith('.js'));

    if (dir === 'player') {
      totalPlayerEvents += events.length;
    } else {
      totalDiscordEvents += events.length;
    }

    for (let file of events) {
      try {
        const evt = require(`../src/events/${dir}/${file}`);
        let eName = file.split('.')[0];
        if (dir === 'player') {
          client.player.events.on(eName, evt.bind(null, client, player));
          loadedPlayerEvents++;
        } else {
          client.on(eName, evt.bind(null, client));
          loadedDiscordEvents++;
        }
      } catch (error) {
        console.error(`Failed to load event ${file}:`, error);
        failedEvents.push({ eventName: file, eventType: dir });
      }
    }
  });

  console.log(`${loadedDiscordEvents}/${totalDiscordEvents} Discord events loaded successfully`);
  console.log(`${loadedPlayerEvents}/${totalPlayerEvents} Player events loaded successfully`);

  if (failedEvents.length > 0) {
    console.log("Failed to load the following events:");
    failedEvents.forEach(event => console.log(`${event.eventName} (${event.eventType} event)`));
  }
};
