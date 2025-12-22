<?php
$id = $_GET['id'] ?? 0;
$dest = urldecode($_GET['dest'] ?? 'https://google.com');

// Log click ngay (dùng sendBeacon style, nhưng vì PHP thì append log)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$ref = $_SERVER['HTTP_REFERER'] ?? 'direct';
$log = date('Y-m-d H:i:s') . " | CLICK | AD:$id | IP:$ip | REF:$ref" . PHP_EOL;
file_put_contents(__DIR__ . '/admin/stats.log', $log, FILE_APPEND | LOCK_EX);

// Cập nhật stats.json tương tự track.php
$statsFile = __DIR__ . '/admin/stats.json';
$stats = file_exists($statsFile) ? json_decode(file_get_contents($statsFile), true) : [];
if (!isset($stats[$id])) $stats[$id] = ['views' => 0, 'clicks' => 0];
$stats[$id]['clicks']++;
file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));

// Redirect an toàn (thêm no-cache)
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header("Location: $dest");
exit;
?>