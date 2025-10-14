using UITour.DAL.Interfaces.Repositories;
using UITour.Models;
using Host = UITour.Models.Host;

namespace UITour.DAL.Repositories
{
    public class HostRepository : GenericRepository<Host>, IHostRepository
    {
        public HostRepository(UITourContext context) : base(context)
        {
        }
    }
}


