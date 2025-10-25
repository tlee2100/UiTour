using UITour.Models;

namespace UITour.ServicesL.Interfaces
{
    public interface INeighbourhoodService
    {
        Task<IEnumerable<Neighbourhood>> GetAllAsync();
        Task<Neighbourhood> GetByIdAsync(int id);
        Task<Neighbourhood> CreateAsync(Neighbourhood neighbourhood);
        Task<Neighbourhood> UpdateAsync(Neighbourhood neighbourhood);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<Neighbourhood>> GetNeighbourhoodsByCityIdAsync(int cityId);
    }
}
