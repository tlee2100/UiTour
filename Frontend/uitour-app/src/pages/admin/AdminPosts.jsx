import './admin.css';

export default function AdminPosts() {
  const rows = [
    { id: 1, title: 'Villa sang trọng tại Đà Lạt', price: '₫2,500,000/đêm', host: 'Nguyễn Văn An', status: 'ĐÃ DUYỆT' },
    { id: 2, title: 'Homestay ven biển Nha Trang', price: '₫1,200,000/đêm', host: 'Trần Thị Bình', status: 'ĐÃ DUYỆT' },
    { id: 3, title: 'Căn hộ cao cấp Quận Ba Vị', price: '₫2,500,000/đêm', host: 'Lê Hoàng Cường', status: 'ĐÃ DUYỆT' },
  ];
  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Danh sách bài đăng</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Tiêu đề</div><div>Giá</div><div>Chủ host</div><div>Trạng thái</div></div>
          {rows.map(r => (
            <div key={r.id} className="row"><div>{r.id}</div><div>{r.title}</div><div>{r.price}</div><div>{r.host}</div><div>{r.status}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}


