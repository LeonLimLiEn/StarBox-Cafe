/**
 * Discord-Roblox Group Rank Management Plugin
 * --------------------------------------------
 * Install: npm install noblox.js discord.js
 * Bot should support discord.js v13+ (slash commands).
 *
 * Env Vars Required:
 *   - ROBLOX_COOKIE: Your Roblox .ROBLOSECURITY string
 *   - ROBLOX_GROUP_ID: Your group ID
 */

const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');

const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;
const GROUP_ID = process.env.ROBLOX_GROUP_ID;

let robloxReady = false;

// Authenticate with Roblox before using group actions
async function initRoblox() {
    if (!robloxReady) {
        await noblox.setCookie(ROBLOX_COOKIE);
        robloxReady = true;
    }
}

async function promoteUser(username) {
    await initRoblox();
    const userId = await noblox.getIdFromUsername(username);
    if (!userId) throw new Error(`Roblox user "${username}" not found.`);
    const newRank = await noblox.promote(GROUP_ID, userId);
    return newRank;
}

async function demoteUser(username) {
    await initRoblox();
    const userId = await noblox.getIdFromUsername(username);
    if (!userId) throw new Error(`Roblox user "${username}" not found.`);
    const newRank = await noblox.demote(GROUP_ID, userId);
    return newRank;
}

// Registers commands for Discord.js bots
function registerRobloxCommands(client) {
    // On bot ready (register commands if needed)
    client.once('ready', async () => {
        // For global command registration:
        await client.application.commands.set([
            new SlashCommandBuilder()
                .setName('promote')
                .setDescription('Promote a Roblox group member')
                .addStringOption(opt => 
                    opt.setName('username')
                        .setDescription('Roblox username')
                        .setRequired(true)
                ).toJSON(),
            new SlashCommandBuilder()
                .setName('demote')
                .setDescription('Demote a Roblox group member')
                .addStringOption(opt => 
                    opt.setName('username')
                        .setDescription('Roblox username')
                        .setRequired(true)
                ).toJSON()
        ]);
        console.log('[Roblox Plugin] Commands registered.');
    });

    // Handle interactions
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        const username = interaction.options.getString('username');
        try {
            if (interaction.commandName === 'promote') {
                const rank = await promoteUser(username);
                await interaction.reply(`✅ ${username} promoted to: **${rank.name}**`);
            } else if (interaction.commandName === 'demote') {
                const rank = await demoteUser(username);
                await interaction.reply(`✅ ${username} demoted to: **${rank.name}**`);
            }
        } catch (e) {
            await interaction.reply(`❌ Error: ${e.message}`);
        }
    });
}

module.exports = {
    registerRobloxCommands,
};