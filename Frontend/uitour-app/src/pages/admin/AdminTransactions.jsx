import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllTransactions();
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load transactions list');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
    const formatted = new Intl.NumberFormat('vi-VN').format(amount);
    return currency === 'USD' ? `$${formatted}` : `₫${formatted}`;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Recent transactions</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">Recent transactions</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="table-card">
        <div className="table-title">Giao dịch gần đây ({transactions.length})</div>
        <div className="table">
          <div className="row head"><div>ID</div><div>User</div><div>Amount</div><div>Date</div><div>Status</div></div>
          {transactions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No data</div>
          ) : (
            transactions.map(t => (
              <div key={t.TransactionID || t.transactionID || t.id} className="row">
                <div>TX{t.TransactionID || t.transactionID || t.id}</div>
                <div>User #{t.BookingID || t.bookingID || 'N/A'}</div>
                <div>{formatAmount(t.Amount || t.amount, t.Currency || t.currency)}</div>
                <div>{formatDate(t.ProcessedAt || t.processedAt)}</div>
                <div>{t.PaymentStatus || t.paymentStatus || 'N/A'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


