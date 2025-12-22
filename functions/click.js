export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/click.php') return new Response('Not found', {status: 404});

    const id = url.searchParams.get('id') || '0';
    const dest = decodeURIComponent(url.searchParams.get('dest') || 'https://google.com');

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ref = request.headers.get('referer') || 'direct';
    console.log(`${new Date().toISOString()} | CLICK | AD:${id} | IP:${ip} | REF:${ref}`);

    return Response.redirect(dest, 302);
  }
};