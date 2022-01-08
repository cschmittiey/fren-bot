const Discord = require('discord.js');
const BaseListener = require('./base.js');

const {
  GUILD_ID,
  VOICE_CHANNEL_ID,
  DISCORD_TOKEN,
} = process.env;

class DiscordListener extends BaseListener {
  constructor() {
    super();

    this.client = new Discord.Client();

    this.client.login(DISCORD_TOKEN);

    this.client.on('voiceStateUpdate', (oldState, newState) => {
      const { channelID: oldChannel } = oldState;
      const { channelID: newChannel, member } = newState;

      if (oldChannel === VOICE_CHANNEL_ID && newChannel !== VOICE_CHANNEL_ID) {
        console.log(`${member.user.username} has disconnected.`);

        this.onLeave(member.user.username);
      }

      if (newChannel === VOICE_CHANNEL_ID && oldChannel !== VOICE_CHANNEL_ID) {
        console.log(`${member.user.username} has connected.`);

        this.onJoin(member.user.username);
      }
    });
  }

  /**
   * Get the current member count (cached)
   * @return {Number}
   */
  get memberCount() {
    const { members: { size: memberCount } } = this.client
      .guilds.cache.get(GUILD_ID)
      .channels.cache.get(VOICE_CHANNEL_ID);

    return memberCount;
  }
}

module.exports = DiscordListener;