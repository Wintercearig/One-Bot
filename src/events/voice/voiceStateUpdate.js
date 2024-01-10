module.exports = (client, oldState, newState) => {
    client.player.handleVoiceState(oldState, newState);
};