using System.Linq.Expressions;

namespace UITour.DAL.Interfaces
{
    public interface IRepository<TEntity> where TEntity : class
    {
        //Cho phép truy vấn LINQ (chưa thực thi SQL ngay)
        IQueryable<TEntity> Query();
        //Lấy 1 entity theo khóa chính (Primary Key)
        Task<TEntity?> GetByIdAsync(params object[] keyValues);
        //Thêm 1 entity
        Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
        //Thêm nhiều entity
        Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

        //Cập nhật entity
        void Update(TEntity entity);
        //Xóa 1 entity
        void Remove(TEntity entity);
        //Xóa nhiều entity
        void RemoveRange(IEnumerable<TEntity> entities);

        //Kiểm tra xem có entity thỏa điều kiện không
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
        //Lấy toàn bộ dữ liệu dạng list
        Task<List<TEntity>> ToListAsync(CancellationToken cancellationToken = default);
        //Lọc theo điều kiện
        Task<List<TEntity>> WhereAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
        //Lấy phần tử đầu tiên khớp điều kiện
        Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    }
}


