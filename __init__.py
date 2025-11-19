from .main import PromoteDemotePlugin

def setup(bot):
    bot.add_cog(PromoteDemotePlugin(bot))