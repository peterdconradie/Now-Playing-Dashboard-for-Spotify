<?php
if(isset($_GET)){
    if(isset($_GET['lang']) && !empty($_GET['lang'])){
        setcookie('lang', $_GET['lang'], time() + 60*60*24*30);
    }
}
if(!isset($_COOKIE['lang']) OR empty($_COOKIE['lang'])){
    setcookie('lang', 'en', time() + 60*60*24*30);
}
switch(@$_COOKIE['lang']){
    case 'fr': include_once 'lang/fr.php';
    break;
    case 'en': default: include_once 'lang/en.php';
    break;
}
if(isset($_GET['lang'])){
    header('Location: '.$_SERVER['PHP_SELF']);
}
?>

<!DOCTYPE html>
<html>
<head>
    <link rel="icon" type="image/png" href="favicon.png">
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link href="style.css" rel="stylesheet">
</head>

<body>        <div id="all_content">
<div id="playing-div">
  <h1>Dashboard for Spotify</h1>
    <div id="left-side"></div>

    <div id="main">
            <h1><?=IndexWelcome;?></h1>
            <h2><?=IndexPleaseConnect;?></h2>

            <a href="login.php" class="spotify-btn"><?=IndexConnection;?></a>
            <p class="space20"></p>
            <h3>Credits</h3>


            <p>This is an opensource project. Is is derived for the most part on <a href="https://github.com/busybox11/NowPlaying-for-Spotify">busybox11's NowPlaying for Spotify</a>,
           which also relies on the <a href="https://github.com/JMPerez/spotify-web-api-js">spotify-web-api-js</a> by José M. Pérez.</p>

      </div>

      <div id="right-side"></div>

  </div>

    <div id="footer"></div>
        </div>
        <h3><?=IndexCookie;?></h3>

</body>
</html>
