import { createContext, useContext, useState, useEffect } from "react";

// ⭐ Tỷ giá (bạn có thể lấy API sau)
const RATE = {
  USD: 1,
  VND: 25000,       // 1 USD = 25k VND
};

// ⭐ Format number theo từng currency
function formatCurrency(value, currency) {
  if (currency === "VND") {
    return Number(value).toLocaleString("vi-VN") + " ₫";
  }
  if (currency === "USD") {
    return "$" + Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return value;
}

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {

  // ⭐ Currency hiện tại — mặc định từ localStorage hoặc VND
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('uitour_currency');
    return saved && (saved === 'USD' || saved === 'VND') ? saved : 'VND';
  });

  // ⭐ Đổi đơn vị hiển thị
  const changeCurrency = (cur) => {
    setCurrency(cur);
    localStorage.setItem('uitour_currency', cur);
  };

  // ⭐ Convert USD → currency hiển thị
  function convertToCurrent(usdValue) {
    return usdValue * RATE[currency];
  }

  // ⭐ Convert currency → USD (dùng để lưu vào BE)
  function convertToUSD(displayValue) {
    return displayValue / RATE[currency];
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        changeCurrency,
        convertToCurrent,
        convertToUSD,
        format: (value) => formatCurrency(value, currency),
        rate: RATE,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
