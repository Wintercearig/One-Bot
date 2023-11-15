const { readdirSync } = require('fs');

module.exports = (client) => {
  readdirSync('./src/events/').forEach(dir => {
    const events = readdirSync(`./src/events/${dir}/`).filter(file => file.endsWith('.js'));
    for (let file of events) {
      const evt = require(`../src/events/${dir}/${file}`);
      let eName = file.split('.')[0];
      console.log(`The ${eName} event has loaded`);
      client.on(eName, evt.bind(null, client));
    }
  });
};
