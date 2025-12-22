// === publisher.js ===
(() => {
  const ZONE_ID = 'zone-1'; // Có thể tạo nhiều zone
  const AD_SERVER = 'https://yourdomain.com/my-ad-network'; // Thay bằng domain thật của bạn
  
  // Tạo script load core (async + defer, không block render)
  const s = document.createElement('script');
  s.src = `${AD_SERVER}/loader.js?v=${Date.now()}`;
  s.async = true;
  s.defer = true;
  s.onload = () => window.MyAdNetwork?.show(ZONE_ID);
  document.head.appendChild(s);

  // Pre-connect để nhanh hơn (tối ưu perf)
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = AD_SERVER;
  document.head.appendChild(link);
})();