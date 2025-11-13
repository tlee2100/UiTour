using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class ExperienceDetailsRepository : GenericRepository<ExperienceDetails>, IExperienceDetailsRepository
    {
        public ExperienceDetailsRepository(UITourContext context) : base(context)
        {
        }
    }
}


