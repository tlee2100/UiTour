using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(UITourContext context) : base(context)
        {
        }
    }
}


