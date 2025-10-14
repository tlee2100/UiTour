using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class SavedListingRepository : GenericRepository<SavedListing>, ISavedListingRepository
    {
        public SavedListingRepository(UITourContext context) : base(context)
        {
        }
    }
}


