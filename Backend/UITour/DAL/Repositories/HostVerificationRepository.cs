using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class HostVerificationRepository : GenericRepository<HostVerification>, IHostVerificationRepository
    {
        public HostVerificationRepository(UITourContext context) : base(context)
        {
        }
    }
}


