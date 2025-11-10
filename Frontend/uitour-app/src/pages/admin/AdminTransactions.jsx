import './admin.css';

export default function AdminTransactions() {
  const rows = [
    { id: 'TX1001', user: 'Nguyễn Văn A', amount: '₫1,500,000', date: '20/12/2024', status: 'Thành công' },
    { id: 'TX1002', user: 'Trần Thị B', amount: '₫2,300,000', date: '22/12/2024', status: 'Thành công' },
  ];
  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Giao dịch gần đây</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>Người dùng</div><div>Số tiền</div><div>Ngày</div><div>Trạng thái</div></div>
          {rows.map(r => (
            <div key={r.id} className="row"><div>{r.id}</div><div>{r.user}</div><div>{r.amount}</div><div>{r.date}</div><div>{r.status}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}


