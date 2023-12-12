/* eslint-disable no-process-exit */
const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Commands', 'Status');

module.exports = (client) => {
  const loadedCommands = new Set();
  const loadedSlashCommands = new Set();
  const loadedAliases = new Set();

  const checkDuplicates = (loadedSet, item, type) => {
    if (loadedSet.has(item.toLowerCase())) {
      console.error(`Duplicate ${type} found: ${item.toLowerCase()}`);
      return true;
    }
    loadedSet.add(item.toLowerCase());
    return false;
  };

  const loadCommands = (commandsPath, isSlashCommand = false) => {
    readdirSync(commandsPath).forEach(dir => {
      const commands = readdirSync(`${commandsPath}/${dir}/`).filter(f => f.endsWith('.js'));

      for (let file of commands) {
        let pull = require(`.${commandsPath}/${dir}/${file}`);

        if (isSlashCommand && pull.data) {
            // Loads slash commands
            if (checkDuplicates(loadedSlashCommands, pull.data.name, 'slash command')) {
              continue;
            }

            client.slash.set(pull.data.name.toLowerCase(), pull);
            table.addRow(file, '✅ Slash CMD!');
          } else if (!isSlashCommand && pull.name) {
            // Loads reg commands
            if (checkDuplicates(loadedCommands, pull.name, 'command')) {
              continue;
            }

            client.commands.set(pull.name.toLowerCase(), pull);
            table.addRow(file, '✅ MSG CMD!');
            if (pull.aliases && Array.isArray(pull.aliases)) {
              for (let alias of pull.aliases) {
                if (checkDuplicates(loadedAliases, alias, 'alias')) {
                  continue; 
                }
  
                client.aliases.set(alias, pull.name);
              }
          }
        } else {
          table.addRow(file, '❌ -> CMD failed to load.');
          continue;
        }
      }
    });

    // Clears Sets when fin
    loadedCommands.clear();
    loadedAliases.clear();
    loadedSlashCommands.clear();
  };

  // Load regular message commands
  loadCommands('./src/commands');
  // Load slash commands
  loadCommands('./src/slashCommands', true);

  console.log(table.toString());
};