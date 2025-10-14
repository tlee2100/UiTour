using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class AmenityRepository : GenericRepository<Amenity>, IAmenityRepository
    {
        public AmenityRepository(UITourContext context) : base(context)
        {
        }
    }
}


