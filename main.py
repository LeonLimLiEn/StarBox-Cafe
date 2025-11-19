import discord
from discord.ext import commands
import os
from noblox import Client

class PromoteDemotePlugin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.staff_role_id = 1401921758319218760
        self.roblox_cookie = os.getenv("ROBLOX_COOKIE")
        self.group_id = int(os.getenv("ROBLOX_GROUP_ID", 0))
        self.roblox_client = None
        if self.roblox_cookie:
            try:
                self.roblox_client = Client(self.roblox_cookie)
            except Exception as e:
                print(f"Roblox login failed: {e}")

    def is_staff(self, member):
        return any(role.id == self.staff_role_id for role in member.roles)

    async def change_rank(self, ctx, user_id: int, promote=True):
        if not self.roblox_client:
            return await ctx.send("Roblox login not configured or failed.")

        try:
            roles = self.roblox_client.get_roles(self.group_id)
            current_rank = self.roblox_client.get_rank_in_group(self.group_id, user_id)
            roles_sorted = sorted(roles, key=lambda r: r['rank'])
            idx = next((i for i, r in enumerate(roles_sorted) if r['rank'] == current_rank), None)
            if idx is None:
                return await ctx.send("Cannot find user's current rank.")

            if promote:
                if idx >= len(roles_sorted) - 1:
                    return await ctx.send("User already has the highest rank.")
                target_rank = roles_sorted[idx + 1]['rank']
            else:
                if idx == 0:
                    return await ctx.send("User already has the lowest rank.")
                target_rank = roles_sorted[idx - 1]['rank']

            self.roblox_client.set_rank(self.group_id, user_id, target_rank)
            action = "Promoted" if promote else "Demoted"
            await ctx.send(f"{action} user {user_id} → rank {target_rank}")
        except Exception as e:
            await ctx.send(f"Error: {e}")

    @commands.command(name="promote")
    async def promote(self, ctx, user_id: int):
        if not self.is_staff(ctx.author):
            return await ctx.send("You don't have permission.")
        await self.change_rank(ctx, user_id, promote=True)

    @commands.command(name="demote")
    async def demote(self, ctx, user_id: int):
        if not self.is_staff(ctx.author):
            return await ctx.send("You don't have permission.")
        await self.change_rank(ctx, user_id, promote=False)
