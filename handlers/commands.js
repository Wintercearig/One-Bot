const { readdirSync } = require('fs');
const ascii = require('ascii-table');
const table = new ascii().setHeading('Commands', 'Status');

module.exports = (client) => {
  // Using Maps instead of Sets for storing file paths
  const loadedCommands = new Map();
  const loadedAliases = new Map();
  let dupes = []; 

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

      for (let file of commands) {
        const filePath = `${commandsPath}/${dir}/${file}`;
        let pull;
        try {
          pull = require(`.${filePath}`);
        } catch (error) {
          console.error(`Failed to load command at ${filePath}:`, error);
          table.addRow(file, '❌ -> CMD failed to load.');
          continue;
        }

        if (isSlashCommand && pull.data) {
          // Loads slash commands
          const isDupe = checkDuplicates(loadedCommands, pull.data.name, 'slash command', filePath);
          client.slash.set(pull.data.name.toLowerCase(), pull);
          table.addRow(file, isDupe ? '⚠️ Slash CMD!' : '✅ Slash CMD!');
        } else if (!isSlashCommand && pull.name) {
          // Loads reg commands
          const isDupe = checkDuplicates(loadedCommands, pull.name, 'command', filePath);
          client.commands.set(pull.name.toLowerCase(), pull);
          table.addRow(file, isDupe ? '⚠️ MSG CMD!' : '✅ MSG CMD!');
          
          if (pull.aliases && Array.isArray(pull.aliases)) {
            pull.aliases.forEach(alias => {
              if (checkDuplicates(loadedAliases, alias, 'alias', filePath)) return;
              if (client.aliases.has(alias)) {
                console.warn(`Duplicate alias detected: ${alias}`);
              } else {
                client.aliases.set(alias, pull.name);
              }
            });
          }
        } else {
          table.addRow(file, '❌ -> CMD missing name.');
          continue;
        }
      }
    });

    if (dupes.length > 0) {
      console.log("Duplicate Commands Detected:");
      dupes.forEach(duplicate => console.log(duplicate));
    }

    // Clears Maps when finished
    loadedCommands.clear();
    loadedAliases.clear();
  };

  loadCommands('./src/commands');
  loadCommands('./src/slashCommands', true);

  console.log(table.toString());
};
