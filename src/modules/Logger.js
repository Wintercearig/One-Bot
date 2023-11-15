const chalk = require('chalk');

class Logger {
  constructor() {
    this.now = new Date();
  }

  error(type, error) {
    console.error(
      `${chalk.red('[ERROR]')}[${type.toUpperCase()}][${this.now.toISOString()}]: ${error}`
    );
  }

  warn(type, warning) {
    console.warn(
      `${chalk.yellow('[WARNING]')}[${type.toUpperCase()}][${this.now.toISOString()}]: ${warning}`
    );
  }

  log(type, message) {
    console.log(
      `${chalk.blueBright('[INFO]')}[${type.toUpperCase()}][${this.now.toISOString()}]: ${message}`
    );
  }
}

module.exports = new Logger();
