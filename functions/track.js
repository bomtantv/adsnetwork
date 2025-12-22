export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/track.php') return new Response('Not found', {status: 404});

    let body = '';
    try {
      body = await request.text();
    } catch {}

    const data = body ? JSON.parse(body) : {};
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ref = request.headers.get('referer') || 'direct';

    const logLine = `${new Date().toISOString()} | ${data.event || 'unknown'} | AD:${data.ad_id || 0} | IP:${ip} | REF:${ref}\n`;
    
    // Ghi log vào KV (hoặc D1 nếu cần database thật)
    // Ở đây dùng console.log + lưu vào R2 (hoặc bỏ qua nếu chỉ cần realtime stats)
    console.log(logLine);

    return new Response(JSON.stringify({status: 'ok'}), {
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    });
  }
};