using Microsoft.EntityFrameworkCore;
using UITour.DAL.Interfaces;
using UITour.Models;
using UITour.ServicesL.Interfaces;

namespace UITour.ServicesL.Implementations
{
    public class CountryService: ICountryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CountryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        }

        public async Task<IEnumerable<Country>> GetAllAynsc()
        {
            return await _unitOfWork.Countries.Query().ToListAsync();
        }

        public async Task<Country> GetByIdAsync(int id)
        {
            var country = await _unitOfWork.Countries.GetByIdAsync(id);
            if (country == null)
                throw new InvalidOperationException("Country not found");
            return country;
        }

        public async Task<Country> CreateAsync(Country country)
        {
            await _unitOfWork.Countries.AddAsync(country);
            await _unitOfWork.SaveChangesAsync();
            return country;
        }

        public async Task<Country> UpdateAsync(Country country)
        {
            var existingCountry = await GetByIdAsync(country.CountryID);
            existingCountry.CountryName = country.CountryName;
            _unitOfWork.Countries.Update(existingCountry);
            await _unitOfWork.SaveChangesAsync();
            return existingCountry;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var country = await GetByIdAsync(id);
            _unitOfWork.Countries.Remove(country);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
