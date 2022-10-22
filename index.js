require('dotenv-flow').config();

const {
  GAS_CHAT,
  GAS_GAMER_CHAT,
  SM_MC_CHANNEL,
  FRENCRAFT_CREATE_HOST,
  FRENCRAFT_HOST,
  FRENCRAFT_PORT,
  MC_POLL_INTERVAL,
  MC_CREATE_POLL_INTERVAL,
  FRENCRAFT_CREATE_PORT,
  GUILD_ID,
  VOICE_CHANNEL_ID,
  PRODUCTIVITY_CHANNEL_ID,
} = process.env;

const telegram = require('./lib/senders/telegram');
const slack = require('./lib/senders/slack');

const DiscordListener = require('./lib/listeners/discord');
const MinecraftListener = require('./lib/listeners/minecraft');
const FrenCountResponder = require('./lib/responders/fren_count');

const discordResponder = new FrenCountResponder((frenCount) => {
  const plural = frenCount > 1;
  const msg = `There ${plural ? 'are' : 'is'} ${frenCount} fren${
    plural ? 's' : ''
  } in the leb.`;

  telegram.send(msg, GAS_CHAT);
});

const productivityResponder = new FrenCountResponder((frenCount) => {
  const plural = frenCount > 1;
  const msg = `${frenCount} fren${
    plural ? 's' : ''
  } ${plural ? 'are' : 'is'} being productive 😌.`;

  telegram.send(msg, GAS_CHAT);
});

const minecraftResponder = new FrenCountResponder((frenCount) => {
  const plural = frenCount > 1;
  const msg = `There ${plural ? 'are' : 'is'} ${frenCount} fren${
    plural ? 's' : ''
  } on the frencraft server.`;

  telegram.send(msg, GAS_GAMER_CHAT);
  slack.send(msg, SM_MC_CHANNEL);
});

const minecraftCreateResponder = new FrenCountResponder((frenCount) => {
  const plural = frenCount > 1;
  const msg = `There ${plural ? 'are' : 'is'} ${frenCount} fren${
    plural ? 's' : ''
  } on the create server.`;

  telegram.send(msg, GAS_GAMER_CHAT);
  slack.send(msg, SM_MC_CHANNEL);
});

const discordVoice = new DiscordListener(GUILD_ID, VOICE_CHANNEL_ID);
const discordProductivity = new DiscordListener(GUILD_ID, PRODUCTIVITY_CHANNEL_ID);

const minecraft = new MinecraftListener(
  FRENCRAFT_HOST,
  MC_POLL_INTERVAL,
  Number.parseInt(FRENCRAFT_PORT, 10)
);
const minecraftCreate = new MinecraftListener(
  FRENCRAFT_CREATE_HOST,
  MC_CREATE_POLL_INTERVAL,
  Number.parseInt(FRENCRAFT_CREATE_PORT, 10)
);

discordVoice.onJoin((user) => {
  console.log(`${user} has connected to Discord.`);

  discordResponder.onJoin(user, discordVoice.memberCount);
});

discordVoice.onLeave((user) => {
  console.log(`${user} has disconnected from Discord.`);

  discordResponder.onLeave(user, discordVoice.memberCount);
});

discordProductivity.onJoin((user) => {
  console.log(`${user} has connected to Discord.`);

  productivityResponder.onJoin(user, discordProductivity.memberCount);
});

discordProductivity.onLeave((user) => {
  console.log(`${user} has disconnected from Discord.`);

  productivityResponder.onLeave(user, discordProductivity.memberCount);
});

minecraft.onJoin((user) => {
  console.log(`${user} has connected to Frencraft.`);

  minecraftResponder.onJoin(user, minecraft.playerCount);
});

minecraft.onLeave((user) => {
  console.log(`${user} has disconnected from Frencraft.`);

  minecraftResponder.onLeave(user, minecraft.playerCount);
});

minecraftCreate.onJoin((user) => {
  console.log(`${user} has connected to the Create server.`);

  minecraftCreateResponder.onJoin(user, minecraftCreate.playerCount);
});

minecraftCreate.onLeave((user) => {
  console.log(`${user} has disconnected from the Create server.`);

  minecraftCreateResponder.onLeave(user, minecraftCreate.playerCount);
});
