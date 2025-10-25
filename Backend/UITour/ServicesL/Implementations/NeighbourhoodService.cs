using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class NeighbourhoodService: INeighbourhoodService
    {
        private readonly IUnitOfWork _unitOfWork;
        public NeighbourhoodService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<Neighbourhood> CreateAsync(Neighbourhood neighbourhood)
        {
            await _unitOfWork.Neighbourhoods.AddAsync(neighbourhood);
            await _unitOfWork.SaveChangesAsync();
            return neighbourhood;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var neighbourhood = await _unitOfWork.Neighbourhoods.GetByIdAsync(id);
            if (neighbourhood == null) return false;
            _unitOfWork.Neighbourhoods.Remove(neighbourhood);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Neighbourhood>> GetAllAsync()
        {
            return await _unitOfWork.Neighbourhoods.Query().ToListAsync();
        }

        public async Task<Neighbourhood> GetByIdAsync(int id)
        {
            var neighbourhood = await _unitOfWork.Neighbourhoods.GetByIdAsync(id);
            if (neighbourhood == null)
                throw new InvalidOperationException("Neighbourhood not found");
            return neighbourhood;
        }

        public async Task<Neighbourhood> UpdateAsync(Neighbourhood neighbourhood)
        {
            var existingNeighbourhood = await GetByIdAsync(neighbourhood.NeighbourhoodID);
            existingNeighbourhood.NeighbourhoodName = neighbourhood.NeighbourhoodName;
            existingNeighbourhood.CityID = neighbourhood.CityID;
            _unitOfWork.Neighbourhoods.Update(existingNeighbourhood);
            await _unitOfWork.SaveChangesAsync();
            return existingNeighbourhood;
        }

        public async Task<IEnumerable<Neighbourhood>> GetNeighbourhoodsByCityIdAsync(int cityId)
        {
            return await _unitOfWork.Neighbourhoods.Query()
                .Where(n => n.CityID == cityId)
                .ToListAsync();
        }
    }
}
