<?php
require 'vendor/autoload.php';

$session = new SpotifyWebAPI\Session(
    '2fbf07d1a88946c989897fe4bcdc749b',
    'dd57c3a56ea4425a9d4fbd54e5635c44',
    'http://localhost:3000/token.php'
);

if (!isset($_GET['action'])) {

    $session->requestAccessToken($_GET['code']);

    $accessToken = $session->getAccessToken();
    setcookie('accessToken', $accessToken, time() + 3600);
    setcookie('refreshTime', time() + 3600, time() + (3600 * 365));
    $refreshToken = $session->getRefreshToken();
    setcookie('refreshToken', $refreshToken, time() + (3600 * 365));

} elseif ($_GET['action'] == "refresh") {

    $session->refreshAccessToken($_COOKIE['refreshToken']);

    $accessToken = $session->getAccessToken();
    setcookie('accessToken', $accessToken, time() + 3600);
    setcookie('refreshTime', time() + 3600, time() + (3600 * 365));
    $refreshToken = $session->getRefreshToken();
    setcookie('refreshToken', $refreshToken, time() + (3600 * 365));
}

header('Location: playing.php');
die();
?>
