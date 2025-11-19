import discord
from discord.ext import commands
import subprocess

class PromoteDemotePlugin(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.staff_role_id = 1401921758319218760

    def is_staff(self, member):
        return any(role.id == self.staff_role_id for role in member.roles)

    @commands.command(name="promote")
    async def promote(self, ctx, user_id: int, *, reason: str = "No reason"):
        if not self.is_staff(ctx.author):
            return await ctx.send("You don't have permission.")

        result = subprocess.run(
            ["node", "./plugins/promote_demote/roblox.js", "promote", str(user_id)],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            await ctx.send(f"Promoted user {user_id}. Reason: {reason}")
        else:
            await ctx.send(f"Error promoting user: {result.stderr.strip()}")

    @commands.command(name="demote")
    async def demote(self, ctx, user_id: int, *, reason: str = "No reason"):
        if not self.is_staff(ctx.author):
            return await ctx.send("You don't have permission.")

        result = subprocess.run(
            ["node", "./plugins/promote_demote/roblox.js", "demote", str(user_id)],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            await ctx.send(f"Demoted user {user_id}. Reason: {reason}")
        else:
            await ctx.send(f"Error demoting user: {result.stderr.strip()}")