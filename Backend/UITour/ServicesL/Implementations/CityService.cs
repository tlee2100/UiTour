using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class CityService: ICityService
    {
        private readonly IUnitOfWork _unitOfWork;
        public CityService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }
        public async Task<IEnumerable<City>> GetAllAsync()
        {
            return await _unitOfWork.Cities.Query().ToListAsync();
        }
        public async Task<City> GetByIdAsync(int id)
        {
            var city = await _unitOfWork.Cities.GetByIdAsync(id);
            if (city == null)
                throw new InvalidOperationException("City not found");
            return city;
        }
        public async Task<City> CreateAsync(City city)
        {
            await _unitOfWork.Cities.AddAsync(city);
            await _unitOfWork.SaveChangesAsync();
            return city;
        }
        public async Task<City> UpdateAsync(City city)
        {
            var existingCity = await GetByIdAsync(city.CityID);
            existingCity.CityName = city.CityName;
            existingCity.CountryID = city.CountryID;
            _unitOfWork.Cities.Update(existingCity);
            await _unitOfWork.SaveChangesAsync();
            return existingCity;
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var city = await GetByIdAsync(id);
            if (city == null) return false;
            _unitOfWork.Cities.Remove(city);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        public async Task<IEnumerable<City>> GetCitiesByCountryIdAsync(int countryId)
        {
            return await _unitOfWork.Cities.Query()
                .Where(c => c.CountryID == countryId)
                //.Include(c => c.Country) // nếu bạn muốn kèm thông tin quốc gia
                .ToListAsync();
        }
    }
}
