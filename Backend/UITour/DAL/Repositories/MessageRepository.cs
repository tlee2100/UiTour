using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        public MessageRepository(UITourContext context) : base(context)
        {
        }
    }
}


