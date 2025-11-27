import { useEffect, useState } from 'react';
import './admin.css';
import adminAPI from '../../services/adminAPI';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../utils/translations';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllTransactions();
      setTransactions(data || []);
    } catch (err) {
      setError(err.message || t(language, 'adminTransactions.loadError'));
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
          <div className="table-title">{t(language, 'adminTransactions.title')}</div>
          <div style={{ padding: '20px', textAlign: 'center' }}>{t(language, 'common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">{t(language, 'adminTransactions.title')}</div>
          <div style={{ padding: '20px', color: '#b91c1c' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
      <div className="admin-page">
        <div className="table-card">
          <div className="table-title">
            {t(language, 'adminTransactions.title')} ({transactions.length})
          </div>
        <div className="table">
          <div className="row head">
            <div>ID</div>
            <div>{t(language, 'adminTransactions.user')}</div>
            <div>{t(language, 'adminTransactions.amount')}</div>
            <div>{t(language, 'adminTransactions.date')}</div>
            <div>{t(language, 'adminTransactions.status')}</div>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>{t(language, 'common.noData')}</div>
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


