using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class CancellationPolicyRepository : GenericRepository<CancellationPolicy>, ICancellationPolicyRepository
    {
        public CancellationPolicyRepository(UITourContext context) : base(context)
        {
        }
    }
}


