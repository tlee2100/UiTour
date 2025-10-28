using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class TourReviewRepository : GenericRepository<TourReview>, ITourReviewRepository
    {
        public TourReviewRepository(UITourContext context) : base(context)
        {
        }
    }
}


