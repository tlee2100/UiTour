using UITour.Models;
namespace UITour.ServicesL.Interfaces
{
    public interface ICountryService
    {
       Task<IEnumerable<Country>> GetAllAynsc();
        Task<Country> GetByIdAsync(int id);
        Task<Country> CreateAsync(Country country);
        Task<Country> UpdateAsync(Country country);
        Task<bool> DeleteAsync(int id);
    }
}
