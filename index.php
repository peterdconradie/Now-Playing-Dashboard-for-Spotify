<?php
if(isset($_GET)){
    if(isset($_GET['lang']) && !empty($_GET['lang'])){
        setcookie('lang', $_GET['lang'], time() + 60*60*24*30);
    }
}
if(!isset($_COOKIE['lang']) OR empty($_COOKIE['lang'])){
    setcookie('lang', 'en', time() + 60*60*24*30);
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

<body>
<div id="all_content">
<div id="playing-div">
  <h1>Npw Playing Dashboard for Spotify</h1>
    <div id="left-side"></div>

    <div id="main">
            <h1>Welcome</h1>


            <a href="login.php" class="spotify-btn"><p>Connect to your Spotify Account</p></a>
            <p class="space20"></p>
            <h3>Credits</h3>
            <p>This is an opensource project. Is is derived for the most part on <a href="https://github.com/busybox11/NowPlaying-for-Spotify">busybox11's NowPlaying for Spotify</a>,
           which also relies on the <a href="https://github.com/JMPerez/spotify-web-api-js">spotify-web-api-js</a> by José M. Pérez. The code can be accessed on <a href="https://github.com/peterdconradie/Now-Playing-Dashboard-for-Spotify/">GitHub</a></p>
            <p>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
      </div></p>

      <div id="right-side"></div>

  </div>


        </div>
        <h3><?=IndexCookie;?></h3>

</body>
</html>
