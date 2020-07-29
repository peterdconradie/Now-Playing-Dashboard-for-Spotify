// javascript starts here
// Check if cookie refreshToken is set
let cookie = document.cookie;
if (!cookie.includes("refreshToken")) {
  window.location.replace('login.php');
}

if (readCookie('theme') == "test") {
  $('#playingcss-test').attr('rel', 'stylesheet');
  $('#playingcss').attr('rel', 'stylesheet alternate');
}



// declare all variables
let result;
let response;
let parsedResult;
let idSong;
let idArtist;
let currentlyPlayingType;
let refreshTime;
let album_global;
let wikiTitle;
let mbArtistID;

// add record link to page
// todo: fix problem with track credits for Kanye West album
// light and dark theme
// justice album to debug


const AVAILABLE_DEVICES = ['Computer', 'Tablet', 'Smartphone', 'Speaker', 'TV', 'AVR', 'STB', 'AudioDongle', 'Gameconsole', 'CastVideo', 'CastAudio', 'Automobile', 'Unknown']
const DEVICES_ICON = ['computer', 'tablet_android', 'smartphone', 'speaker', 'tv', 'speaker_group', 'speaker_group', 'cast_connected', 'gamepad', 'cast_connected', 'cast_connected', 'directions_car', 'device_unknown']
refreshTime = readCookie('refreshTime');
var spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(readCookie('accessToken'));

loopForever();
// loop function
function loopForever() {

  //
  //
  // F U N C T I O N S
  //
  //
  // this function cleans titles, used for searching musicbrainz
  function cleanTitles(toFix) {
    var titleFixed = toFix.replace(/\(Deluxe(.*)/g, '')
      .replace(/&/g, 'and')
      .replace(/\-.*/g, '')
      .replace(/\[.*/g, '')
      .replace(/\(.*/g, '');
    return titleFixed;
  }

  // This gets the album artist ID from musicbrainz
  async function getMBartistID(albumArtistURI) {
    try {
      var url = `http://musicbrainz.org/ws/2/artist/?&fmt=json&limit=1&query=artist:"${albumArtistURI}"`
      console.log(url)
      let response = await fetch(url);
      let data = await response.json()
      let mbArtistID = data["artists"][0].id

      artistIDuri = "https://musicbrainz.org/artist/" + mbArtistID
      document.getElementById("artist_id").href = artistIDuri

      getMBwikiDataCode(mbArtistID)
      .then(artistWikiDataURLFixed => getWikiTitle(artistWikiDataURLFixed))
      .then(titleEncode => wikiAsyncFetch(titleEncode))
      .then(myJSONparsed => document.getElementById("artistInfo").innerHTML = myJSONparsed)

      return mbArtistID
    } catch (error) {
      console.log(error);
      $('#artistInfo').text("No record of this artist exists on Musicbrainz.");

    }
  }

  // This uses the Musicbrainz artist ID to search for a wikidata identifier
  async function getMBwikiDataCode(mbArtistID) {
    try {
      var url = `https://musicbrainz.org/ws/2/artist/${mbArtistID}?fmt=json&inc=url-rels`
      let response = await fetch(url);
      let data = await response.json()
      var subset = data.relations;
      var filtered = subset.filter(a => a.type == "wikidata");
      //console.log("Wikidata resource found");
      var artistWikiDataURL = filtered[0]["url"]["resource"]
      var artistWikiDataURLFixed = artistWikiDataURL.replace('https:\/\/www.wikidata.org\/wiki\/', '');
      //console.log(artistWikiDataURLFixed);
      return (artistWikiDataURLFixed)
    } catch (error) {
      console.log(error);
      $('#artistInfo').text("No wikipedia for this artist exists");
    }
  }

  // This gets a page title for for the associated wikidata identifier
  async function getWikiTitle(wikiDataInfo) {
    let response = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=sitelinks&ids=${wikiDataInfo}&sitefilter=enwiki&origin=*`);
    let data = await response.json()
    let title = data["entities"][wikiDataInfo]["sitelinks"]["enwiki"]["title"]
    titleEncode = encodeURIComponent(title)
    return titleEncode
  }

  // this takes a search string and returns the first result from wikipedia
  async function searchWiki(wikiSearch) {
    var url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${wikiSearch}&origin=*`;
    console.log("search for page" + url)
    let response = await fetch(url);
    // only proceed once promise is resolved
    let data = await response.json();
    // only proceed once second promise is resolved
    let pageName = data.query.search[0].title;
    console.log("wikidata page name: " + pageName)
    return pageName;
  }

  // When given the exact page title, this function fetches an extract of the page
  async function wikiAsyncFetch(pageName) {
    try{
    var url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${pageName}&origin=*`
    let response = await fetch(url);
    // only proceed once promise is resolved
    let data = await response.json();
    // only proceed once second promise is resolved
    pageID = Object.keys(data.query.pages);
    pageID = pageID["0"]
    var myJSON = JSON.stringify(data["query"]["pages"][pageID]["extract"])
    var myJSONparsed = JSON.parse(myJSON)
    //console.log(myJSONparsed)
    return myJSONparsed;
    }
    catch (error) {
      console.log(error);
    }
  }

  //gets the release group from MB
  async function getReleaseGroupID(mbArtistID, cleanAlbumURI, release_type) {
    try {
      var url =
        `http://musicbrainz.org/ws/2/release-group/?query=release:${cleanAlbumURI}+AND+arid:${mbArtistID}+AND+primarytype:${release_type}+AND+status:official&inc=recordings+recording-level-rels+work-rels+work-level-rels+artist-rels&fmt=json`
      console.log("Release Group Search URL " + url)
      let response = await fetch(url)
      let data = await response.json()
      let releaseGroupID = data["release-groups"][0].id
      console.log(data)
      rg_id = "https://musicbrainz.org/release-group/" + releaseGroupID
      document.getElementById("rg_id").href = rg_id
      return releaseGroupID
      }
      catch (error) {
      console.log(error);
      $('#albumInfo').text("No release group found on Musicbrainz");
    }
  }

  /// gets an original release, preferably no LPS
  async function getOfficialReleaseID(releaseGroupID) {
    try {
      var url = `https://musicbrainz.org/ws/2/release-group/${releaseGroupID}?inc=aliases+artist-credits+releases+url-rels&fmt=json`
      let response = await fetch(url)
      let data = await response.json()
      var subset = data.releases;
      var filter1 = subset.filter(a => a.status == "Official"); // first get only offical results
      var filter2 = filter1.filter(a => a.packaging !== "Cardboard/Paper Sleeve"); // try to remove all LPs, this isn't always possible because MB doesn't offer format information when browsing releaseGroups
      let releaseID = filter2[0].id

      return releaseID
    } catch (error) {
      console.log(error);
      //$('#albumInfo').text("No release group found on Musicbrainz");
    }
  }

  /// gets album wikidata information about the album
  async function getAlbumWikiData(releaseGroupID) {
    try {
      var url = `https://musicbrainz.org/ws/2/release-group/${releaseGroupID}?inc=aliases+artist-credits+releases+url-rels&fmt=json`
      let response = await fetch(url)
      let data = await response.json()
      console.log(data)
      var subset = data.relations;
      var filtered = subset.filter(a => a.type == "wikidata");
      console.log("Wikidata resource found");
      var WikiDataURL = filtered[0]["url"]["resource"]
      var WikiDataURLFixed = WikiDataURL.replace('https:\/\/www.wikidata.org\/wiki\/', '');
      console.log(WikiDataURLFixed);
      return (WikiDataURLFixed)
    } catch (error) {
      console.log(error);
      $('#albumInfo').text("No wikipedia page for this album");
    }

  }

  // uses the current track number and the release ID to get the track credits
  async function getCredits(releaseID, curTrackInteger) {
    try{
    var url = `https://musicbrainz.org/ws/2/release/${releaseID}?inc=recordings+recording-level-rels+work-rels+work-level-rels+artist-rels&fmt=json&limit=3`
    let response = await fetch(url)
    let data = await response.json()
    console.log(data)
    let credits_track = data["media"][0]["tracks"][curTrackInteger]["recording"].relations
    console.log(credits_track)
    return credits_track
    }
    catch (error) {
    console.log(error)

    // $('#nocredits').text("No credits found for this track");
    }
  }

  setInterval(function() {
    let promise = Promise.resolve(spotifyApi.getMyCurrentPlaybackState(null));
    promise.then(function(value) {
      response = value;
      //console.log('currently playing data from spotify');
      //console.log(response);
    });

    //console.log("mbArtistID " + mbArtistID);

    if (Math.floor(Date.now() / 1000) >= refreshTime) {
      window.location.replace('token.php?action=refresh');
    }
    if (response != "") {
      // even uitgezet
      //console.log('Response not empty');
      getInformations();
    } else {
      //console.log('Response empty');
      noInformations();
    }
    //console.log("idArtist= " + idArtist);
    var albumArtistID = idArtist;
    let artist_search = Promise.resolve(spotifyApi.search(albumArtist, ["artist"]));
    //   let artist_search = Promise.resolve(spotifyApi.getArtist(albumArtistID));
    artist_search.then(function(value) {
      result = value;
      //console.log('Artist search result (for image)');
      //console.log(result);

    });
    if (result != "") {
      // even uitgezet
      //console.log('artist search succesfull');
      getArtistInformations();
    } else {
      //console.log('Response empty');
      noInformations();
    }

    function getArtistInformations() {
      //console.log("something breaks here");
      // the information below is not yet available at first run
      artistImage = result["artists"]["items"][0]["images"][0].url;
      artistPopularity = result["artists"]["items"][0].popularity;
      artistGenres = result["artists"]["items"][0]["genres"];
      artistGenre = result["artists"]["items"][0]["genres"][0];
      artistID = result["artists"]["items"][0].id;

      artistPopularityIcon = Math.ceil(artistPopularity / 20);
      // this checks is the popularity is higher than 0. if it is zero, one star gets added, if not, the else loop is run
      if (artistPopularityIcon == 0) {
        //console.log("ZERO Rating");
        item = '<i class=\"material-icons\" style=\"font-size:16px;\">favorite<\/i>';
        $("#artistscore").html(item);
      } else {
        //console.log("Track popularity for icons " + artistPopularityIcon);
        var i = 1;
        var item;
        var items = [];
        for (i; i <= artistPopularityIcon; i++) {
          item = '<i class=\"material-icons\" style=\"font-size:16px;\">favorite<\/i>';
          items.push(item);
        }
        $('#artistscore').html(items.join('\n'));
      }

      // list of content
      $('#artist-image').attr("src", artistImage);
      $('#artist-popularity').text(artistPopularity);

      var i = 1;
      var genre;
      var genres = [];
      for (var i = 0; i < artistGenres.length; i++) {
        // alert("genre " + i)
        genre = artistGenres[i];
        genres.push(genre);
      }
      $('#artist-genres').html(genres.join(" | "));
      //$('#artist-genre').text(artistGenre);
    }
    /// get currently playing type
    function getInformations() {
      currentlyPlayingType = response.currently_playing_type;
      progressSong = response.progress_ms;
      progressSongFormatted = msToTime(response.progress_ms);
      deviceName = response["device"].name;
      deviceType = response["device"].type;
      // some if tests to display controls
      if (response.is_playing == true) {
        $("#activeicon").text(DEVICES_ICON[AVAILABLE_DEVICES.indexOf(deviceType)]);
        $(".play").hide();
        $(".pause").show();

      } else {
        $("#activeicon").text("cloud_off");
        $(".play").show();
        $(".pause").hide();
        //alert("stopped");
      }

      if (response.shuffle_state == true) {
        $(".shuffleOn").hide();
        $(".shuffleOff").show();
      } else {
        $(".shuffleOn").show();
        $(".shuffleOff").hide();
        //alert("stopped");
      }

      if (response.repeat_state == "context") {
        $(".repeatOn").hide();
        $(".repeatOff").show();
      } else {
        $(".repeatOn").show();
        $(".repeatOff").hide();
        //alert("stopped");
      }
      $("#device-name").text(deviceName);
      if (currentlyPlayingType != "ad") {
        lenghtSong = response["item"].duration_ms;
        lenghtSongFormatted = msToTime(response["item"].duration_ms);
        seekbarProgress = Math.round(progressSong * 100 / lenghtSong);
        titleSong = response["item"].name;
        let tempArtist = "";
        for (let i = 0; i < response["item"]["artists"].length; i++) {
          tempArtist = tempArtist + response["item"]["artists"][i].name;
          if (i != response["item"]["artists"].length - 1) {
            tempArtist = tempArtist + ", ";
          }
        }
        artistSong = tempArtist;
        albumSong = response["item"]["album"].name;
        trackPopularity = response["item"].popularity;
        trackExplict = response["item"].explicit;

        if (trackExplict == true) {
          $(".explicit").show();
          //console.log("explicit track");
        }
        if (trackExplict == false) {
          $(".explicit").hide();
          //console.log("not explicit");
        }

        albumArtist = response["item"]["artists"]["0"].name;
        releaseDate = response["item"]["album"].release_date;
        totalTracks = response["item"]["album"].total_tracks;
        curTrack = response["item"].track_number;
        curVol = response["device"].volume_percent;
        isrc = response["item"]["external_ids"].isrc;
        release_type = response["item"]["album"].album_type;
        //console.log("isrc: " + isrc)
        //console.log("release_type: " + isrc)
        title = titleSong + " by " + artistSong + " 🎧 " + deviceName + " at " + curVol + "% volume";
        albumPicture = response["item"]["album"]["images"]["0"].url;
        $("#time-song").text(progressSongFormatted + " · " + lenghtSongFormatted);
        //console.log("Track popularity " + trackPopularity);
        //console.log("This is the album artist: " + albumArtist);
        // sub loop when songs change
        // this ensures that the wikipedia fetch only happens when a song changes
        if (response["item"].id != idSong) {
          // prepare strings and titles
          albumArtistURI = encodeURIComponent(albumArtist);
          cleanAlbum = cleanTitles(albumSong);
          cleanAlbumURI = encodeURI(cleanAlbum);
          cleanTitleSong = cleanTitles(titleSong);
          cleanTitleSongURI = encodeURI(cleanTitleSong);

          var curTrackInteger = (parseInt(curTrack, 10) - 1);
          var totalTracksInteger = (parseInt(totalTracks, 10))

          // takes the track credits and formats it for the table in the song credits
          function fillCredits(credits_track) {
            console.log(credits_track)
            if (credits_track.length == 0) {
              const tmpl = () => ``;
              credtisFill.innerHTML = tmpl();
            } else {
              //console.log("credits")
              var i = 1;
              var creditName;
              var creditNames = [];

              var creditType;
              var creditTypes = [];

              var creditAttribute;
              var creditAttributes = [];

              var creditURI;
              var creditURIs = [];

              //console.log("Credits below");
              for (let i = 0, l = credits_track.length; i < l; i++) {

                creditName = credits_track[i]["artist"]?.name
                creditNames.push(creditName);

                creditURI = credits_track[i].artist?.id
                creditURIs.push(creditURI);

                creditAttribute = credits_track[i].attributes
                creditAttributes.push(creditAttribute);

                creditType = credits_track[i].type
                creditTypes.push(creditType);
                //console.log(creditURI);
              }
              const tmpl = (creditNames, creditAttributes, creditTypes, creditURIs) => `
            <h4>Song Credits:</h4>
            <table><thead>
            <tr><th>Artist<th>Contribution<th>Detail<tbody>
            ${creditNames.map( (cell, index) => `
                <tr><td><a href ="https://musicbrainz.org/artist/${creditURIs[index]}" target="_blank">${cell}<a>
                <td>${creditAttributes[index]}<td>${creditTypes[index]}</tr>
            `).join('')}
            </table>`;
              credtisFill.innerHTML = tmpl(creditNames, creditTypes, creditAttributes, creditURIs);
            }
          }

          getReleaseGroupID(mbArtistID, cleanAlbumURI, release_type)
            .then(releaseGroupID => getOfficialReleaseID(releaseGroupID))
            .then(releaseID => getCredits(releaseID, curTrackInteger))
            .then(credits_track => fillCredits(credits_track))

          // this 1) gets MB artistID, 2) gets the release group ID, 3) gets the wikidata code, extracts the title)
          getMBartistID(albumArtistURI)
            .then(mbArtistID => getReleaseGroupID(mbArtistID, cleanAlbumURI, release_type))
            .then(releaseGroupID => getAlbumWikiData(releaseGroupID))
            .then(artistWikiDataURLFixed => getWikiTitle(artistWikiDataURLFixed))
            .then(titleEncode => wikiAsyncFetch(titleEncode)
              .then(myJSONparsed => document.getElementById("albumInfo").innerHTML = myJSONparsed))


          trackPopularityIcon = Math.ceil(trackPopularity / 20);
          // this checks is the popularity is higher than 0. if it is zero, one star gets added, if not, the else loop is run
          if (trackPopularityIcon == 0) {
            //console.log("ZERO Rating");
            item = '<i class=\"material-icons\" style=\"font-size:16px;\">star<\/i>';
            $("#score").html(item);
          } else {
            //console.log("Track popularity for icons " + trackPopularityIcon);
            var i = 1;
            var item;
            var items = [];
            for (i; i <= trackPopularityIcon; i++) {
              item = '<i class=\"material-icons\" style=\"font-size:16px;\">star<\/i>';
              items.push(item);
            }
            $('#score').html(items.join('\n'));
          }



          // prepares a string to be searched on wikipedia, in this case for albums
          // lyrics block
          var urlSearchLyrics = `https://api.lyrics.ovh/v1/${albumArtistURI}/${cleanTitleSongURI}`
          var GoogleLyricsSearch = `https://www.google.com/search?q=${albumArtistURI}+-+${cleanTitleSongURI}+lyrics`
          //console.log(urlSearchLyrics);
          fetch(urlSearchLyrics)
            .then((response) => {
              return response.json();
            })
            .then((response) => {
              var myJSON = JSON.stringify(response["lyrics"]);
              var myJSONparsed = JSON.parse(myJSON)
              var myJSONedit = myJSON.replace(/\\n\\n\\n/g, '<br>')
                .replace(/\\n\\n/g, '<br>')
                .replace(/\\n/g, '<br>')
                .replace(/\\r/g, '')
                .replace(/\"/g, '');

              $("#song-lyrics").html(myJSON);
              //console.log(myJSONparsed);
              document.getElementById("song-lyrics").innerHTML = myJSONedit;
            })
            .catch(e => {
              var noLyrics = ("No lyrics found, " + "<a href=\"\r\n" + GoogleLyricsSearch + "\" target=\"_blank\"  >search for lyrics here.<\/a>");
              //https://www.google.com/search?q=HMLTD+-+To+the+Door+Lyrics
              //console.log(noLyrics);
              document.getElementById("song-lyrics").innerHTML = noLyrics;
            });

        } // track update loop ends here
      } // this function essentially gets all the externally needed data
      else {
        titleSong = "<?=ad; ?>";
        artistSong = "Spotify";
        albumSong = "";
        title = "<?=ad; ?> -" + deviceName + "- Now Playing for Spotify";
        albumPicture = "no_song.png";
        lenghtSong = " ";
        lenghtSongFormatted = " ";
        seekbarProgress = 0;
        $("#time-song").text(progressSongFormatted);
      }
      $("#seekbar-now").attr("style", "width : " + seekbarProgress + "%");
    } // get track information ends here

    function noInformations() {
      titleSong = "<?=defaultTitleSong; ?>";
      artistSong = "<?=defaultArtistSong; ?>";
      albumSong = "";
      title = "<?=defaultTitle; ?>";
      albumPicture = "no_song.png";
      lenghtSong = " ";
      lenghtSongFormatted = " ";
      progressSong = " ";
      progressSongFormatted = " ";
      seekbarProgress = 0;
      $("#activeicon").text("pause");
    } // if info can't be found, this function is invoked


    // this prepares the data from above for the divs
    // only happens when a song changes
    if (response["item"].id != idSong) {
      $("#song-title").text(titleSong);
      $("#song-artist").text(artistSong);
      $("#song-album").text(albumSong);
      // probably cut and paste
      $("#song-popularity").text(trackPopularity);
      $("#song-release").text(releaseDate);
      $("#total-album-tracks").text(totalTracks);
      $("#cur-album-track").text(curTrack);
      $('#cur-vol').text(curVol);

      document.title = title;
      $("#album-image").attr("src", albumPicture);
      idSong = response["item"].id;
      idArtist = response["item"]["album"]["artists"][0].id;
      var aoty = "https://www.albumoftheyear.org/search/artists/?q=" + albumArtist;
      var allmusic = "https://www.allmusic.com/search/artists/" + albumArtist;
      var lastfm = "http://www.last.fm/music/" + albumArtist;

      var aoty_album = "https://www.albumoftheyear.org/search/albums/?q=" + albumSong;
      var allmusic_album = "https://www.allmusic.com/search/albums/" + albumSong;
      var lastfm_album = "https://www.last.fm/search/albums?q=" + albumSong;

      document.getElementById("aoty").href = aoty;
      document.getElementById("allmusic").href = allmusic;
      document.getElementById("lastfm").href = lastfm;

      document.getElementById("aoty_album").href = aoty_album;
      document.getElementById("allmusic_album").href = allmusic_album;
      document.getElementById("lastfm_album").href = lastfm_album;





      function Pause() {
        spotifyApi.pause();
      }

      function Play() {
        spotifyApi.play();
      }

      function SkipToNext() {
        if (response["item"].id == idSong) {
          spotifyApi.skipToNext();
          wait(500);
        } else {}
      }

      function SkipToPrevious() {
        if (response["item"].id == idSong) {
          spotifyApi.skipToPrevious();
          wait(500);
        } else {}
      }

      function setRepeatOn() {
        spotifyApi.setRepeat("context");
      }

      function setRepeatOff() {
        spotifyApi.setRepeat("off");
      }



      // shuffle and repeat
      function setShufflOn() {
        spotifyApi.setShuffle("true");
      }

      function setShufflOff() {
        spotifyApi.setShuffle("false");
      }
      $("#pause").on("click", function() {
        Pause();
      });
      $("#play").on("click", function() {
        Play();
      });

      $("#next").on("click", function() {
        SkipToNext();
      });

      $("#shuffleOff").on("click", function() {
        setShufflOff();
      });

      $("#shuffleOn").on("click", function() {
        setShufflOn();
      });

      $("#repeatOn").on("click", function() {
        setRepeatOn();
      });

      $("#repeatOff").on("click", function() {
        setRepeatOff();
      });

      $("#previous").on("click", function() {
        if (response["item"].id == idSong) {
          SkipToPrevious();
          wait(1000);
        } else {

        }
      });
    }
  }, 1000);
} // loop function ends here
