using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class NeighbourhoodRepository : GenericRepository<Neighbourhood>, INeighbourhoodRepository
    {
        public NeighbourhoodRepository(UITourContext context) : base(context)
        {
        }
    }
}


