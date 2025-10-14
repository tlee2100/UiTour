using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class PropertyAmenityRepository : GenericRepository<PropertyAmenity>, IPropertyAmenityRepository
    {
        public PropertyAmenityRepository(UITourContext context) : base(context)
        {
        }
    }
}


