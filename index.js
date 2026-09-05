require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Warning storage
const warnings = new Map();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const args = message.content.trim().split(/\s+/);

  if (args[0] !== "!warn") return;

  // Check permission
  if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return message.reply("❌ You need the **Moderate Members** permission.");
  }

  const user = message.mentions.users.first();

  if (!user) {
    return message.reply("❌ Please mention a user.\nExample: `!warn @User Spamming`");
  }

  if (user.id === message.author.id) {
    return message.reply("❌ You can't warn yourself.");
  }

  const member = await message.guild.members.fetch(user.id);

  // Don't allow warning moderators
  if (member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    return message.reply("❌ You can't warn another moderator.");
  }

  const reason = args.slice(2).join(" ") || "No reason provided";

  const currentWarnings = warnings.get(user.id) || 0;
  const newWarnings = currentWarnings + 1;

  warnings.set(user.id, newWarnings);

  message.reply(
    `⚠️ **Member Warned**\n\n` +
    `**Member:** ${user}\n` +
    `**Reason:** ${reason}\n` +
    `**Warnings:** ${newWarnings}`
  );
});

client.login(process.env.DISCORD_TOKEN);
