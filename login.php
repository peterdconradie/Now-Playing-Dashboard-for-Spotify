<?php
require_once 'vendor/autoload.php';

$session = new SpotifyWebAPI\Session(
    '',
    '',
    'http://localhost:3000/token.php'
);

$options = [
    'scope' => [
        'user-read-currently-playing',
        'user-read-playback-state',
		'user-modify-playback-state',
    ],
];

header('Location: ' . $session->getAuthorizeUrl($options));
die();
?>
