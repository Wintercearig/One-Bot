const { readdirSync } = require('fs');

module.exports = async (client) => {
  const player = await client.player;

  readdirSync('./src/events/').forEach(dir => {
    const events = readdirSync(`./src/events/${dir}/`).filter(file => file.endsWith('.js'));
    for (let file of events) {
      const evt = require(`../src/events/${dir}/${file}`);
      let eName = file.split('.')[0];
      if(dir === 'player'){
        client.player.events.on(eName, evt.bind(null, client, player));
        console.log(`Loaded Music Player Event: ${eName}`);
      } else {
        client.on(eName, evt.bind(null, client));
        console.log(`The ${eName} event has loaded`);
      }
    }
  });
};
