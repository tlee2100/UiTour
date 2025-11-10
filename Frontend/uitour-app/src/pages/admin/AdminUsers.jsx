import './admin.css';

export default function AdminUsers() {
  const rows = [
    { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'GUEST', state: 'HOẠT ĐỘNG' },
    { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'HOST', state: 'HOẠT ĐỘNG' },
    { id: 3, name: 'Lê Hoàng Cường', email: 'cuong.le@email.com', role: 'ADMIN', state: 'HOẠT ĐỘNG' },
  ];
  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Danh sách người dùng</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Họ tên</div><div>Email</div><div>Vai trò</div><div>Trạng thái</div></div>
          {rows.map(r => (
            <div key={r.id} className="row"><div>{r.id}</div><div>{r.name}</div><div>{r.email}</div><div>{r.role}</div><div>{r.state}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}


