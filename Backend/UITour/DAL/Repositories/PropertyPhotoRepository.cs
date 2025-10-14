using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class PropertyPhotoRepository : GenericRepository<PropertyPhoto>, IPropertyPhotoRepository
    {
        public PropertyPhotoRepository(UITourContext context) : base(context)
        {
        }
    }
}


