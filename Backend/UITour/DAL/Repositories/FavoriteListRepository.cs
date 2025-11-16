using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class FavoriteListRepository : GenericRepository<FavoriteList>, IFavoriteListRepository
    {
        public FavoriteListRepository(UITourContext context) : base(context)
        {
        }
    }
}

