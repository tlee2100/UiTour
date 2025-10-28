using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class TourParticipantRepository : GenericRepository<TourParticipant>, ITourParticipantRepository
    {
        public TourParticipantRepository(UITourContext context) : base(context)
        {
        }
    }
}


