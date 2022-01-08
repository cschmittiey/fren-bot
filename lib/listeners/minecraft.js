const { queryFull } = require('minecraft-server-util');
const BaseListener = require('./base.js');

const { FRENCRAFT_HOST, MC_POLL_INTERVAL } = process.env;

class MinecraftListener extends BaseListener {
  constructor() {
    super();

    this.playerCache = null;

    this.poll = setInterval(() => {
      this.rehydrate();
    }, MC_POLL_INTERVAL);
  }

  /**
   * Return the count of players on the server
   * @return {Number} Number of players
   */
  get playerCount() {
    return this.playerCache.length;
  }

  /**
   * Get the list of players currently on the server
   * @return {Promise<String[]>}
   */
  async playerList() {
    const {
      players: {
        list,
      },
    } = await queryFull(FRENCRAFT_HOST);

    return list;
  }

  /**
   * Rehydrate the cached player list and handle edge state detection
   * @return {Promise<void>}
   */
  async rehydrate() {
    const lastPlayers = this.playerCache;
    const nextPlayers = await this.playerList();

    this.playerCache = nextPlayers;

    if (lastPlayers !== null) {
      const joined = nextPlayers.filter(player => !lastPlayers.includes(player));
      const left = lastPlayers.filter(player => !nextPlayers.includes(player));

      if (joined.length > 0) this.emit(this.JOINED, joined);
      if (left.length > 0) this.emit(this.LEFT, left);
    }
  }
}

module.exports = MinecraftListener;