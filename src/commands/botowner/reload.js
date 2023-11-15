module.exports = {
    name: "reload",
    description: "Reloads a command, event, or every command/event",
    category: "botowner",
    ownerOnly: true,
    run: async (client, message, args) => {
      if (!args[0]) {
        return message.channel.send("Please provide proper args.");
      }
  
      const type = args[0].toLowerCase();
  
      if (type === 'all') {
        reloadAllCommands(client, message);
      } else {
        reloadSpecificCommand(client, message, type);
      }
    }
  };
  
  function reloadSpecificCommand(client, message, name) {
    const command = client.commands.get(name) || client.commands.get(client.aliases.get(name));
    if (!command) {
      return message.channel.send("Command not found.");
    }
    reloadCommand(client, command);
    message.channel.send(`Successfully reloaded command: \`${command.name}\``);
  }
  
  function reloadAllCommands(client, message) {
    const commands = client.commands.filter((cmd) => cmd.category !== "exempt");
    commands.forEach((command) => reloadCommand(client, command));
    message.channel.send(`All \`${commands.size}\` commands have been reloaded.`);
  }
  
  function reloadCommand(client, cmd) {
    try {
      delete require.cache[require.resolve(`../${cmd.category}/${cmd.name}.js`)];
      const command = require(`../${cmd.category}/${cmd.name}.js`);
      client.commands.set(command.name, command);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          client.aliases.set(alias, cmd.name);
        }
      }
    } catch (e) {
      client.logger.error("reload_commands", e.stack || e);
      throw new Error("An error occurred while reloading the command.");
    }
  }
  