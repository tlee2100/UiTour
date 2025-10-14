using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class VerificationTypeRepository : GenericRepository<VerificationType>, IVerificationTypeRepository
    {
        public VerificationTypeRepository(UITourContext context) : base(context)
        {
        }
    }
}


