using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class BedTypeRepository : GenericRepository<BedType>, IBedTypeRepository
    {
        public BedTypeRepository(UITourContext context) : base(context)
        {
        }
    }
}


