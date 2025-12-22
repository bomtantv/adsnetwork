// === loader.js – FULL SEND BEACON 2025 ===
window.MyAdNetwork = (function () {
  const SERVER = 'https://yourdomain.com/my-ad-network'; // Thay domain
  const STORAGE_KEY = 'myad-history';
  const EXPIRE_HOURS = 24;

  async function getIP() {
    try {
      const r = await fetch('https://api.ipify.org?format=json', {cache: 'no-store'});
      return (await r.json()).ip;
    } catch { return 'unknown'; }
  }

  async function log(event, adId, extra = {}) {
    const data = {
      event,
      ad_id: adId,
      ip: await getIP(),
      ua: navigator.userAgent.slice(0, 100), // Giới hạn để dưới 64KB
      ref: document.referrer || 'direct',
      url: location.href,
      ts: Date.now(),
      ...extra
    };

    // SEND BEACON – Không bao giờ mất data (99.9% thành công)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${SERVER}/track.php`, JSON.stringify(data));
    } else {
      // Fallback cho browser cổ (hiếm)
      fetch(`${SERVER}/track.php`, {
        method: 'POST',
        body: JSON.stringify(data),
        mode: 'no-cors',
        keepalive: true
      });
    }
  }

  async function show(zoneId = 'zone-1') {
    const container = document.getElementById(`myad-${zoneId}`);
    if (!container || container.dataset.loaded) return;

    const [adsRes, ip] = await Promise.all([
      fetch(`${SERVER}/admin/ads.json?t=${Date.now()}`),
      getIP()
    ]);
    const ads = await adsRes.json();
    if (!ads.length) return;

    // Lịch sử theo IP (tuần tự ads)
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const userHist = history[ip] || {list: [], ts: Date.now()};

    if (Date.now() - userHist.ts > EXPIRE_HOURS * 3600000) {
      userHist.list = [];
      userHist.ts = Date.now();
    }

    const unseen = ads.filter(a => !userHist.list.includes(a.id));
    const ad = unseen.length > 0 ? unseen[0] : ads[0];

    // Log VIEW bằng sendBeacon
    log('view', ad.id, {zone: zoneId});

    // Render ad (lazy load, không ảnh hưởng SEO)
    const trackerUrl = `${SERVER}/click.php?id=${ad.id}&dest=${encodeURIComponent(ad.click_url)}`;
    container.innerHTML = `
      <div style="text-align:center;margin:10px 0;line-height:0">
        <a href="${trackerUrl}" target="_blank" rel="nofollow sponsored" onclick="window.MyAdNetwork.click(${ad.id})">
          <img src="${ad.image_url}" loading="lazy" alt="${ad.title}" 
               style="max-width:100%;height:auto;border:0;border-radius:8px;">
        </a>
        <div style="font-size:11px;color:#666;margin-top:4px">
          Quảng cáo • MyAdNetwork
        </div>
      </div>`;

    // Lưu lịch sử
    if (!userHist.list.includes(ad.id)) {
      userHist.list.push(ad.id);
      history[ip] = userHist;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    container.dataset.loaded = 'true';
  }

  function click(adId) {
    // Log CLICK bằng sendBeacon (ngay cả khi redirect)
    log('click', adId);
  }

  return { show, click };
})();