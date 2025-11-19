import noblox from "noblox.js";

const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;
const GROUP_ID = parseInt(process.env.ROBLOX_GROUP_ID, 10);

await noblox.setCookie(ROBLOX_COOKIE);

const args = process.argv.slice(2);
const action = args[0];
const userId = parseInt(args[1], 10);

async function run() {
    try {
        const currentRank = await noblox.getRankInGroup(GROUP_ID, userId);
        const roles = await noblox.getRoles(GROUP_ID);
        roles.sort((a, b) => a.rank - b.rank);
        const idx = roles.findIndex(r => r.rank === currentRank);
        let targetRank;
        if (action === "promote") {
            if (idx === roles.length - 1) throw new Error("User already highest rank");
            targetRank = roles[idx + 1].rank;
        } else if (action === "demote") {
            if (idx === 0) throw new Error("User already lowest rank");
            targetRank = roles[idx - 1].rank;
        } else {
            throw new Error("Invalid action");
        }

        await noblox.setRank(GROUP_ID, userId, targetRank);
        console.log(`Success: ${action} user ${userId} -> rank ${targetRank}`);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

run();