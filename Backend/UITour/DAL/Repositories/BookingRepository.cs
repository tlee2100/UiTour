using UITour.DAL.Interfaces.Repositories;
using UITour.Models;

namespace UITour.DAL.Repositories
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(UITourContext context) : base(context)
        {
        }
    }
}


