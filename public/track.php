<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Chống spam: Giới hạn 10 req/s/IP (dùng file lock đơn giản)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$lockFile = __DIR__ . '/admin/rate_' . md5($ip) . '.lock';
$now = time();
if (file_exists($lockFile)) {
    $last = (int)file_get_contents($lockFile);
    if ($now - $last < 1 && $last > 0) {
        http_response_code(429); // Too Many Requests
        exit('Rate limited');
    }
}
file_put_contents($lockFile, $now);

// Nhận data từ sendBeacon
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($data && isset($data['event'])) {
    $log = date('Y-m-d H:i:s') . " | " . $data['event'] . " | AD:" . ($data['ad_id'] ?? '0') .
           " | IP:" . ($data['ip'] ?? '') . " | REF:" . ($data['ref'] ?? '') .
           " | UA:" . substr($data['ua'] ?? '', 0, 50) . " | TS:" . $data['ts'] . PHP_EOL;
    
    // Log vào file (an toàn với concurrent)
    file_put_contents(__DIR__ . '/admin/stats.log', $log, FILE_APPEND | LOCK_EX);
    
    // Cập nhật stats.json (tự động)
    $statsFile = __DIR__ . '/admin/stats.json';
    $stats = file_exists($statsFile) ? json_decode(file_get_contents($statsFile), true) : [];
    $adId = $data['ad_id'] ?? 0;
    $event = $data['event'];
    if (!isset($stats[$adId])) $stats[$adId] = ['views' => 0, 'clicks' => 0];
    if ($event === 'view') $stats[$adId]['views']++;
    if ($event === 'click') $stats[$adId]['clicks']++;
    file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));
}

echo json_encode(['status' => 'ok']);
?>