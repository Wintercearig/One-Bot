const { readdirSync, lstatSync, existsSync } = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

module.exports = {
  name: "refresh",
  description: "Refreshes commands, slash commands, events, or all",
  category: "botowner",
  usage: "refresh [all/category/command/event/eventCat] </>[name]",
  aliases: ['r'],
  ownerOnly: true,
  run: async (client, message, args) => {
    if (!args.length) {
      return message.channel.send("Please provide what to refresh (all/category/command/event/eventCat) and a name.\nDon't forget to add a forward slash at the beginning of the command name or category name if you wanna refresh slash.");
    }

    /*
    ** [WARNING]
    ** Sophisticated stuff. Do NOT make changes to this code, unless you know what you are doing.
    */

    // Inner cmd aliases
    const commandTypeMap = {
      'a': 'all',
      'cat': 'category',
      'c': 'command',
      'cmd': 'command',
      'eventcategory': 'eventCat',
      'ecat': 'eventCat',
      'ec': 'eventCat',
      'e': 'event',
      's': 'slash',
      '/': 'slash'
  };

    // Acts as an Inner Cmd aliase handler
    const typeArg = args[0].toLowerCase();
    const type = commandTypeMap[typeArg] || typeArg;

    let name = args[1] ? args[1].toLowerCase() : null;

    // Set false as default, lest cmd is slash oriented
    let isSlashCommand = false;

    // Check if it's a slash command or message command depending on input for {name}
    if (name && name.startsWith('/')) {
      isSlashCommand = true;
      name = name.substring(1); // Remove the forward slash
    }

    // Switch case (obviously)
    try {
      switch(type) {
        case "all":
          refreshAll(client);
          message.channel.send("All commands, slash commands, and events have been refreshed.");
          break;
        case "category":
          refreshCategory(client, message, name, isSlashCommand);
          break;
        case "command":
          refreshCommand(client, message, name, isSlashCommand);
          break;
        case "eventCat":
          refreshEventCategory(client, message, name);
          break;
        case "event":
          refreshEvent(client, message, name);
          break;
        case "slash":
          await deleteDuplicateGuildSlashCommands(client, message.guild.id);
          console.log('yeet');
          break;
        default:
          message.channel.send("Invalid type. Please use 'all', 'category', 'command', 'eventCat', 'event', or 'slash'.");
      }
    } catch (e) {
      client.logger.error("Switch Case", e.stack || e);
      throw new Error("An error occurred while reloading something.");
    }
  }
};

// Returns best "guess", if user words a cat name weirdly, or shortens it for whatever reason
function findBestMatchCategory(categoryName, basePath) {
  const categories = readdirSync(basePath).filter(name => lstatSync(path.join(basePath, name)).isDirectory());
  const { bestMatch } = stringSimilarity.findBestMatch(categoryName, categories);

  return bestMatch.target;
}

// Self explanatory, but this refreshes everything, from commands to events.
function refreshAll(client) {
  // Stores the old commands, events, and slash commands, in case of an error
  const oldCommands = new Map(client.commands);
  const oldEvents = new Map(client.events);
  const oldSlash = new Map(client.slash);

  try {
    client.commands.clear();
    client.slash.clear();
    client.events.clear();
    client.aliases.clear();

    loadItems(client, './src/commands', client.commands);
    loadItems(client, './src/slashCommands', client.slash, true);
    loadEvents(client, './src/events');

    console.log("All commands, slash commands, and events have been refreshed.");
  } catch (error) {
    console.error("Error refreshing all:", error);
    client.commands = oldCommands;
    client.events = oldEvents;
    client.slash = oldSlash;
  }
}


// Refreshes an entire category, slash or msg
function refreshCategory(client, message, categoryName, isSlashCommand) {
  const basePath = isSlashCommand ? 'src/slashCommands' : 'src/commands';
  const categoryPath = path.join(basePath, categoryName);
  const bestMatch = findBestMatchCategory(categoryName, basePath);

  if (!existsSync(categoryPath) || !lstatSync(categoryPath).isDirectory()) {
      return message.channel.send(`This ${isSlashCommand ? "slash " : ""}category doesn't seem to exist, did you mean \`${bestMatch}\`?`);
  }

  const { count, failedCommands } = loadItems(client, categoryPath, isSlashCommand ? client.slash : client.commands, isSlashCommand);

  let responseMessage = `Category \`${bestMatch}\` with ${count} ${isSlashCommand ? "slash " : ""}commands has been refreshed.`;
  if (failedCommands.length > 0) {
      responseMessage += `\nAlthough ${failedCommands.length} commands failed to load:\n`;
      failedCommands.forEach(cmd => {
          responseMessage += `${cmd.name} - ${cmd.error}\n`;
      });
  }

  message.channel.send(responseMessage);
}

// Refreshes an entire event category
function refreshEventCategory(client, message, eventCategoryName) {
  const eventCategories = readdirSync('./src/events').filter(name => lstatSync(path.join('./src/events', name)).isDirectory());
  const { bestMatch } = stringSimilarity.findBestMatch(eventCategoryName, eventCategories);

  if (bestMatch.rating < 0.5) {
    message.channel.send("This event category doesn't exist. Make sure this category exists or check your spelling and try again.");
  } else {
    const categoryPath = path.join('./src/events', bestMatch.target);
    try {
      const { count, failedEvents } = loadEvents(client, categoryPath);
      let responseMessage = `Event category \`${bestMatch.target}\` with ${count} events has been refreshed.`;
      if (failedEvents.length > 0) {
        responseMessage += `\nAlthough ${failedEvents.length} events failed to load:\n`;
        failedEvents.forEach(evt => {
          responseMessage += `${evt.name} - ${evt.error}\n`;
        });
      }
      message.channel.send(responseMessage);
    } catch (error) {
      console.error(`Error refreshing event category '${bestMatch.target}': ${error.message}`);
    }
  }
}

// Supposed to refresh a single command, but it's bipolar, so yeah.
function refreshCommand(client, message, commandName, isSlashCommand) {
  const basePath = isSlashCommand ? 'src/slashCommands' : 'src/commands';
  const allCommandFiles = getFilesRecursively(basePath);
  
  const matchingFile = allCommandFiles.find(file => 
    path.parse(file).name.toLowerCase() === commandName.toLowerCase()
  );

  if (!matchingFile) {
    return message.channel.send(`Command \`${commandName}\` not found.`);
  }

  try {
    // Convert to an absolute path to ensure Node can find it
    const resolvedFile = path.resolve(matchingFile);
    delete require.cache[require.resolve(resolvedFile)];
    const newCommand = require(resolvedFile);
    
    if (isSlashCommand) {
      client.slash.set(newCommand.data.name, newCommand);
    } else {
      client.commands.set(newCommand.name, newCommand);
      if (newCommand.aliases) {
        newCommand.aliases.forEach(alias => {
          client.aliases.set(alias, newCommand.name);
        });
      }
    }

    message.channel.send(`Command \`${commandName}\` has been refreshed.`);
  } catch (error) {
    console.error(error);
    message.channel.send(`Failed to reload command \`${commandName}\`: ${error.message}`);
  }
}

// Refreshes a single event, but it's also bipolar, so yeah.
function refreshEvent(client, message, eventName) {
  let eventFound = false;

  readdirSync('./src/events').forEach(dir => {
    readdirSync(path.join('./src/events', dir)).forEach(file => {
      if (path.parse(file).name.toLowerCase() === eventName.toLowerCase()) {
        try {
          const eventPath = path.resolve('./src/events', dir, file);
          delete require.cache[require.resolve(eventPath)];
          const newEvent = require(eventPath);
          client.events.set(eventName, newEvent);
          client.removeAllListeners(eventName);
          client.on(eventName, newEvent.bind(null, client));
          eventFound = true;
          message.channel.send(`Event \`${eventName}\` has been refreshed successfully.`);
        } catch (error) {
          console.error(error);
          message.channel.send(`Failed to reload event \`${eventName}\`: ${error.message}`);
        }
      }
    });
  });

  if (!eventFound) {
    message.channel.send(`Event \`${eventName}\` not found.`);
  }
}

function loadItems(client, basePath, collection, isSlashCommand = false) {
  const fullBasePath = path.join(__dirname, '..', '..', '..', basePath);
  let count = 0;
  let failedCommands = [];

  const loadFromDirectory = (dirPath) => {
      readdirSync(dirPath).filter(file => file.endsWith('.js')).forEach(file => {
          const requirePath = path.join('..', '..', '..', basePath, dirPath.replace(fullBasePath, ''), file);

          try {
              delete require.cache[require.resolve(requirePath)];
              const item = require(requirePath);

              if (isSlashCommand && item.data) {
                  collection.set(item.data.name.toLowerCase(), item);
              } else if (!isSlashCommand && item.name) {
                  collection.set(item.name.toLowerCase(), item);
                  if (item.aliases && Array.isArray(item.aliases)) {
                      item.aliases.forEach(alias => client.aliases.set(alias, item.name));
                  }
              }
              count++;
          } catch (error) {
              console.error(`Error loading item at ${requirePath}: `, error);
              failedCommands.push({ name: path.parse(file).name, error: error.message });
          }
      });
  };

  if (!existsSync(fullBasePath) || !lstatSync(fullBasePath).isDirectory()) {
      console.error(`basePath is not a directory: ${fullBasePath}`);
      return { count, failedCommands };
  }

  if (readdirSync(fullBasePath).some(name => lstatSync(path.join(fullBasePath, name)).isDirectory())) {
      readdirSync(fullBasePath).forEach(dir => {
          const dirPath = path.join(fullBasePath, dir);
          if (lstatSync(dirPath).isDirectory()) {
              loadFromDirectory(dirPath);
          }
      });
  } else {
      loadFromDirectory(fullBasePath);
  }

  return { count, failedCommands };
}

function loadEvents(client, basePath) {
  const fullBasePath = path.join(__dirname, '..', '..', '..', basePath);
  let count = 0;
  let failedEvents = [];

  readdirSync(fullBasePath).forEach(file => {
    if (file.endsWith('.js')) {
      const requirePath = path.join(fullBasePath, file);
      const eventName = file.split('.')[0];

      client.removeAllListeners(eventName);

      try {
        delete require.cache[require.resolve(requirePath)];
        const event = require(requirePath);

        client.on(eventName, (...args) => event(client, ...args));
        count++;
      } catch (error) {
        console.error(`Error loading event at ${requirePath}: `, error);
        failedEvents.push({ name: eventName, error: error.message });
      }
    }
  });

  return { count, failedEvents };
}

function getFilesRecursively(directory, ext = '.js') {
  let files = [];
  readdirSync(directory, { withFileTypes: true }).forEach(dirent => {
    const fullPath = path.join(directory, dirent.name);
    if (dirent.isDirectory()) {
      files = files.concat(getFilesRecursively(fullPath, ext));
    } else if (dirent.name.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  return files;
}

async function deleteDuplicateGuildSlashCommands(client, guildId, message) {
  try {
    const localSlashCommands = new Map();
    client.slash.forEach(cmd => localSlashCommands.set(cmd.data.name, cmd.data.description));
    
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return console.error("Guild not found.");
    
    const guildCommands = await guild.commands.fetch();
    
    let deletedCount = 0;
    guildCommands.forEach(guildCommand => {
      const localCommandDescription = localSlashCommands.get(guildCommand.name);

      if (!localCommandDescription || guildCommand.description !== localCommandDescription) {
        guild.commands.delete(guildCommand.id);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      message.channel.send(`Deleted ${deletedCount} outdated slash commands.`);
    }
  } catch (error) {
    console.error("Error deleting duplicate guild slash commands:", error);
  }
}
