using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class SavedListingsRepository : GenericRepository<SavedListings>, ISavedListingsRepository
    {
        public SavedListingsRepository(UITourContext context) : base(context)
        {
        }
    }
}


