using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class TourPhotoRepository : GenericRepository<TourPhoto>, ITourPhotoRepository
    {
        public TourPhotoRepository(UITourContext context) : base(context)
        {
        }
    }
}


