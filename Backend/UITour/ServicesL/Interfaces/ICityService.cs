using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface ICityService
    {
        Task<IEnumerable<City>> GetAllAsync();
        Task<City> GetByIdAsync(int id);
        Task<City> CreateAsync(City city);
        Task<City> UpdateAsync(City city);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<City>> GetCitiesByCountryIdAsync(int countryId);
    }
}
