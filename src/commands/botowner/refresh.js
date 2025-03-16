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
      return message.channel.send("Please provide what to refresh (all/category/command/event/eventCat) and a name.\nDon't forget to add a forward slash at the beginning of the command name or category name if you want to refresh slash commands.");
    }

    // Map inner command aliases
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

    const typeArg = args[0].toLowerCase();
    const type = commandTypeMap[typeArg] || typeArg;
    let name = args[1] ? args[1].toLowerCase() : null;
    let isSlashCommand = false;

    // Determine if it's a slash command based on a leading '/'
    if (name && name.startsWith('/')) {
      isSlashCommand = true;
      name = name.substring(1);
    }

    try {
      switch (type) {
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
          await deleteDuplicateGuildSlashCommands(client, message.guild.id, message);
          console.log('Removed duplicate slash commands.');
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

// Returns best "guess" for category names using string similarity
function findBestMatchCategory(categoryName, basePath) {
  const categories = readdirSync(basePath).filter(name => lstatSync(path.join(basePath, name)).isDirectory());
  const { bestMatch } = stringSimilarity.findBestMatch(categoryName, categories);
  return bestMatch.target;
}

// Refreshes everything (commands, slash commands, and events)
function refreshAll(client) {
  const oldCommands = new Map(client.commands);
  const oldEvents = new Map(client.events);
  const oldSlash = new Map(client.slash);

  try {
    client.commands.clear();
    client.slash.clear();
    client.events.clear();
    client.aliases.clear();

    loadItems(client, 'src/commands', client.commands);
    loadItems(client, 'src/slashCommands', client.slash, true);
    loadEvents(client, 'src/events');

    console.log("All commands, slash commands, and events have been refreshed.");
  } catch (error) {
    console.error("Error refreshing all:", error);
    client.commands = oldCommands;
    client.events = oldEvents;
    client.slash = oldSlash;
  }
}

// Refreshes a specific category of commands (either slash or traditional)
function refreshCategory(client, message, categoryName, isSlashCommand) {
  const basePath = isSlashCommand ? 'src/slashCommands' : 'src/commands';
  const categoryPath = path.join(basePath, categoryName);
  const bestMatch = findBestMatchCategory(categoryName, basePath);

  if (!existsSync(categoryPath) || !lstatSync(categoryPath).isDirectory()) {
    return message.channel.send(`This ${isSlashCommand ? "slash " : ""}category doesn't exist, did you mean \`${bestMatch}\`?`);
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

// Refreshes a single command
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
    const resolvedFile = path.resolve(matchingFile);
    delete require.cache[require.resolve(resolvedFile)];
    const newCommand = require(resolvedFile);

    if (isSlashCommand) {
      client.slash.set(newCommand.data.name.toLowerCase(), newCommand);
    } else {
      client.commands.set(newCommand.name.toLowerCase(), newCommand);
      if (newCommand.aliases && Array.isArray(newCommand.aliases)) {
        newCommand.aliases.forEach(alias => {
          client.aliases.set(alias.toLowerCase(), newCommand.name.toLowerCase());
        });
      }
    }
    message.channel.send(`Command \`${commandName}\` has been refreshed.`);
  } catch (error) {
    console.error(error);
    message.channel.send(`Failed to reload command \`${commandName}\`: ${error.message}`);
  }
}

// Refreshes a single event by searching within subdirectories of 'src/events'
function refreshEvent(client, message, eventName) {
  let eventFound = false;
  const eventsDir = path.resolve('src', 'events');

  readdirSync(eventsDir).forEach(dir => {
    const dirPath = path.join(eventsDir, dir);
    if (lstatSync(dirPath).isDirectory()) {
      readdirSync(dirPath).forEach(file => {
        if (path.parse(file).name.toLowerCase() === eventName.toLowerCase()) {
          try {
            const eventPath = path.join(dirPath, file);
            delete require.cache[require.resolve(eventPath)];
            const newEvent = require(eventPath);
            client.events.set(eventName.toLowerCase(), newEvent);
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
    }
  });

  if (!eventFound) {
    message.channel.send(`Event \`${eventName}\` not found.`);
  }
}

// Refreshes all events within a specific event category (subfolder of 'src/events')
function refreshEventCategory(client, message, eventCategoryName) {
  const eventsDir = path.resolve('src', 'events');
  const eventCategories = readdirSync(eventsDir).filter(name => lstatSync(path.join(eventsDir, name)).isDirectory());
  const { bestMatch } = stringSimilarity.findBestMatch(eventCategoryName, eventCategories);

  if (bestMatch.rating < 0.5) {
    return message.channel.send("This event category doesn't exist. Make sure this category exists or check your spelling and try again.");
  } else {
    const categoryPath = path.join(eventsDir, bestMatch.target);
    try {
      const { count, failedEvents } = loadEvents(client, path.join('src', 'events', bestMatch.target));
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

// Recursively loads command items from a directory
function loadItems(client, basePath, collection, isSlashCommand = false) {
  const fullBasePath = path.resolve(__dirname, '..', '..', '..', basePath);
  let count = 0;
  let failedCommands = [];

  const loadFromDirectory = (dirPath) => {
    readdirSync(dirPath)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const filePath = path.join(dirPath, file);
        try {
          delete require.cache[require.resolve(filePath)];
          const item = require(filePath);
          if (isSlashCommand && item.data) {
            collection.set(item.data.name.toLowerCase(), item);
          } else if (!isSlashCommand && item.name) {
            collection.set(item.name.toLowerCase(), item);
            if (item.aliases && Array.isArray(item.aliases)) {
              item.aliases.forEach(alias => client.aliases.set(alias.toLowerCase(), item.name.toLowerCase()));
            }
          }
          count++;
        } catch (error) {
          console.error(`Error loading item at ${filePath}: `, error);
          failedCommands.push({ name: path.parse(file).name, error: error.message });
        }
      });
  };

  if (!existsSync(fullBasePath) || !lstatSync(fullBasePath).isDirectory()) {
    console.error(`basePath is not a directory: ${fullBasePath}`);
    return { count, failedCommands };
  }

  const subdirs = readdirSync(fullBasePath).filter(name => lstatSync(path.join(fullBasePath, name)).isDirectory());
  if (subdirs.length > 0) {
    subdirs.forEach(dir => {
      loadFromDirectory(path.join(fullBasePath, dir));
    });
  } else {
    loadFromDirectory(fullBasePath);
  }
  return { count, failedCommands };
}

// Loads events from a directory (non-recursively)
function loadEvents(client, basePath) {
  const fullBasePath = path.resolve(__dirname, '..', '..', '..', basePath);
  let count = 0;
  let failedEvents = [];

  readdirSync(fullBasePath).forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(fullBasePath, file);
      const eventName = file.split('.')[0];
      client.removeAllListeners(eventName);
      try {
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        client.on(eventName, (...args) => event(client, ...args));
        count++;
      } catch (error) {
        console.error(`Error loading event at ${filePath}: `, error);
        failedEvents.push({ name: eventName, error: error.message });
      }
    }
  });
  return { count, failedEvents };
}

// Recursively retrieves all files with a given extension
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

// Deletes duplicate guild slash commands that do not match local definitions
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
