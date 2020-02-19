<?php
if (!isset($_COOKIE['lang']) or empty($_COOKIE['lang']))
{
    setcookie('lang', 'en', time() + 60 * 60 * 24 * 30);
}

switch ($_COOKIE['lang'])
{
    case 'fr':
        include_once 'lang/fr.php';
    break;
    case 'en':
    default:
        include_once 'lang/en.php';
    break;
}
?>
<!DOCTYPE html>
<head>
    <title>Spotify Connect - Now Playing</title>
    <meta name="viewport" content="width=device-width, user-scalable=no">

    <link rel="icon" type="image/png" href="favicon.png">
    <link href="style.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Fira+Sans:100,300,400,500,700,800,900&display=swap" rel="stylesheet">>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons"  rel="stylesheet">
    <script src="spotify-web-api.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="scripts.js?ts=<?=time() ?>"></script>
    <script src="cursor.js?ts=<?=time() ?>"></script>
    <script src="get_data.js"></script>


</head>
<body>
<div id="progress"><div id="seekbar-bg"><div id="seekbar-now" style="width : 0%"></div></div></div>

<div id="all_content">



  <div id="playing-div">

    <h1 id="song-artist"><?=defaultArtistSong; ?></h1>
    <div id="left-side">


    <div id="albumArt"><img src="no_song.png" id="album-image"></div>
    <h3>More info</h3>

    <h4>Artist popularity:</h3>
    <div id="artistscore">
    </div>
    <h4>Track popularity:</h4>
    <div id="score">
    <i class="material-icons" style="font-size:12px;">star</i>
    </div>

    <h4><i class="material-icons inline";">mic</i>External links artist</h4>
    <p><a id="aoty" href="https://www.albumoftheyear.org/releases/" target="_blank">AOTY</a></p>
    <p><a id="allmusic" href="http://www.allmusic.com" target="_blank">Allmusic</a></p>
    <p><a id="lastfm" href="http://www.last.fm" target="_blank">Last.fm</a></p>

    <h4><i class="material-icons inline">album</i>External links album</h4>
    <p><a id="aoty_album" href="https://www.albumoftheyear.org/releases/" target="_blank">AOTY</a></p>
    <p><a id="allmusic_album" href="http://www.allmusic.com" target="_blank">Allmusic</a></p>
    <p><a id="lastfm_album" href="http://www.last.fm" target="_blank">Last.fm</a></p>

    <h4>Release date:</h4><p id="song-release"></p>
    <h4>Track:</h4>
    <i id="explicit" class="material-icons explicit" style="font-size:14px;">explicit</i>
    <p id="cur-album-track"></p>
    <p> of </p>
    <p id="total-album-tracks"></p>
    <h4>Artist genre:</h4>
    <p id="artist-genres"></p>
    <div id="contributionsTemplate"><p></p></div>
    </div>

    <div id="main">
      <h2 id="song-title"><?=defaultTitleSong; ?></h2>
      <h3 id="song-album"></h3>
      <h4>Album information</h4>
      <p id="albumInfo">No album info found</p>

      <p><a id="rg_id" href="https://musicbrainz.org/" target="_blank"><i class="material-icons inline">launch</i></a></p>
      <h4>Artist information</h4>
      <p id="artistInfo">No artist info found</p>
      <p><a id="artist_id" href="https://musicbrainz.org/" target="_blank"><i class="material-icons inline">launch</i></a></p>
    </div>
    <div id="right-side">
      <div id="artistArt"><img src="no_artist.png" id="artist-image"></div>
      <h2>Lyrics</h2>
      <p id="song-lyrics">No lyrics found</p>
    </div>

    </div>
    </div>
    <div id="footer"><span>
      <div id="dynamic_info">

        <a id="fullscreen-button" href="#" onclick="fullscreen();"><i id="fullscreen-icon" class="material-icons settings-icon">fullscreen</i></a>

        <a class="" href="#" id="previous"><i class="material-icons">skip_previous</i></a>
        <a class="controls pause" href="#" id="pause"><i class="material-icons">pause</i></a>
        <a class="controls play" href="#" id="play"><i class="material-icons">play_arrow</i></a>
        <a class="" href="#" id="next"><i class="material-icons">skip_next</i></a>

        <a class="controls shuffleOff" href="#" id="shuffleOff"><i class="material-icons" id="active">shuffle</i></a>
        <a class="controls shuffleOn" href="#" id="shuffleOn"><i class="material-icons">shuffle</i></a>

        <a class="controls repeatOff" href="#" id="repeatOff"><i class="material-icons" id="active">repeat</i></a>
        <a class="controls repeatOn" href="#" id="repeatOn"><i class="material-icons">repeat</i></a>
        <i class="material-icons">volume_up</i><p id="cur-vol"></p>

        <i id="activeicon" class="material-icons"></i>
        </span>
        <p id="device-name">Spotify Connect</p><p> </p><p id="time-song"></p>
    </div>
    </div>



  </div>


</body>
