const { readdirSync } = require('fs');
const ascii = require('ascii-table');
let table = new ascii();
/*
// Loads all commands, including slash commands, and their respective alias's
// Checks for duped commands in the bot and displays dupes and original locations
// Also displays commands that were loaded and failed
*/
module.exports = (client) => {
  const loadedCommands = new Map();
  const loadedAliases = new Map();
  let dupes = [];

  let totalCommands = 0;
  let commandsLoaded = 0;
  let totalSlashCommands = 0;
  let slashCommandsLoaded = 0;
  let failedCommands = [];

  const checkDuplicates = (loadedMap, item, type, filePath) => {
    if (loadedMap.has(item.toLowerCase())) {
      dupes.push(`Duplicate ${type} found: ${item.toLowerCase()}.
      \nDuplicate Location: ${filePath}
      \nExisting location: ${loadedMap.get(item.toLowerCase())}`);
      return true;
    }
    loadedMap.set(item.toLowerCase(), filePath);
    return false;
  };

  const loadCommands = (commandsPath, isSlashCommand = false) => {
    readdirSync(commandsPath).forEach(dir => {
      const commands = readdirSync(`${commandsPath}/${dir}/`).filter(f => f.endsWith('.js'));

      if (isSlashCommand) {
        totalSlashCommands += commands.length;
      } else {
        totalCommands += commands.length;
      }

      for (let file of commands) {
        const filePath = `${commandsPath}/${dir}/${file}`;
        let pull;
        try {
          pull = require(`.${filePath}`);
        } catch (error) {
          console.error(`Failed to load command at ${filePath}:`, error);
          failedCommands.push({file: file, type: isSlashCommand ? '/ CMD' : 'MSG CMD'});
          continue;
        }

        if (isSlashCommand && pull.data) {
          const isDupe = checkDuplicates(loadedCommands, pull.data.name, 'slash command', filePath);
          if (!isDupe) {
            slashCommandsLoaded++;
            client.slash.set(pull.data.name.toLowerCase(), pull);
          }
        } else if (!isSlashCommand && pull.name) {
          const isDupe = checkDuplicates(loadedCommands, pull.name, 'command', filePath);
          if (!isDupe) {
            commandsLoaded++;
            client.commands.set(pull.name.toLowerCase(), pull);
          }

          if (pull.aliases && Array.isArray(pull.aliases)) {
            pull.aliases.forEach(alias => {
              if (!checkDuplicates(loadedAliases, alias, 'alias', filePath)) {
                client.aliases.set(alias, pull.name);
              }
            });
          }
        }
      }
    });

    if (dupes.length > 0) {
      console.log("Duplicate Commands Detected:");
      dupes.forEach(duplicate => console.log(duplicate));
    }

    loadedCommands.clear();
    loadedAliases.clear();
  };

  loadCommands('./src/commands');
  loadCommands('./src/slashCommands', true);

  table.setHeading('Loaded', 'Failed');
  table.addRow(`${commandsLoaded}/${totalCommands} cmds loaded`, `${failedCommands.length} failed`);
  table.addRow(`${slashCommandsLoaded}/${totalSlashCommands} / cmds loaded`, failedCommands.map(cmd => `${cmd.file} ❌ ${cmd.type}`).join('\n'));

  console.log(table.toString());
};
