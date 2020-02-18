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
// json error

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

//let mbArtistID;


const AVAILABLE_DEVICES = ['Computer', 'Tablet', 'Smartphone', 'Speaker', 'TV', 'AVR', 'STB', 'AudioDongle', 'Game//console', 'CastVideo', 'CastAudio', 'Automobile', 'Unknown']
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
    var url = `http://musicbrainz.org/ws/2/artist/?&fmt=json&limit=1&query=artist:${albumArtistURI}`;
    let response = await fetch(url);
    let data = await response.json()
    let mbArtistID = data["artists"][0].id
    return mbArtistID
  }

  // This uses the Musicbrainz artist ID to search for a wikidata identifier
  async function getMBwikiDataCode(mbArtistID) {
    var url = `https://musicbrainz.org/ws/2/artist/${mbArtistID}?fmt=json&inc=url-rels`
    let response = await fetch(url);
    let data = await response.json()
    var subset = data.relations;
    var filtered = subset.filter(a => a.type == "wikidata");
    console.log(filtered)
    if (filtered.length == 0) {
      console.log("No wikidata resource found");
      // search wikipedia
    } else {
      console.log("Wikidata resource found");
      var artistWikiDataURL = filtered[0]["url"]["resource"]
      var artistWikiDataURLFixed = artistWikiDataURL.replace('https:\/\/www.wikidata.org\/wiki\/', '');
      console.log(artistWikiDataURLFixed);
      return (artistWikiDataURLFixed)
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

  // When given the exact page title, this function fetches an extract of the page
  async function wikiAsyncFetch(pageName) {
    var url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${pageName}&origin=*`
    let response = await fetch(url);
    // only proceed once promise is resolved
    let data = await response.json();
    // only proceed once second promise is resolved
    pageID = Object.keys(data.query.pages);
    pageID = pageID["0"]
    var myJSON = JSON.stringify(data["query"]["pages"][pageID]["extract"])
    var myJSONparsed = JSON.parse(myJSON)
    console.log(myJSONparsed)
    return myJSONparsed;
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
      ////console.log('Response not empty');
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

        ////console.log("This is the search result froom spotify "+ albumArtistData);
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
        if ($("#song-title").text() == "<?=defaultTitleSong; ?>" || response["item"].id != idSong) {

          // prepare strings and titles
          albumArtistURI = encodeURI(albumArtist);
          cleanAlbum = cleanTitles(albumSong);
          cleanAlbumURI = encodeURI(cleanAlbum);
          cleanTitleSong = cleanTitles(titleSong);
          cleanTitleSongURI = encodeURI(cleanTitleSong);

          //getMBartistID(albumArtistURI)


          //console.log("Song title should be " + titleSong)
          //console.log("Song clean should" + cleanTitleSong)
          //console.log("Song changed: " + titleSong + " by " + albumArtist + " on the album " + albumSong)
          //console.log("Song cleaned: " + cleanTitleSong + " by " + albumArtist + " on the album " + cleanAlbum);

          var curTrackInteger = (parseInt(curTrack, 10) - 1);
          var totalTracksInteger = (parseInt(totalTracks, 10))

            getMBartistID(albumArtistURI)
           .then(mbArtistID => console.log(mbArtistID))

          //console.log(curTrackInteger + " (integer) vs  (original)" + curTrack);
          var mbURL1 = `http://musicbrainz.org/ws/2/artist/?&fmt=json&limit=1&query=artist:${albumArtistURI}`;
          fetch(mbURL1).then(response => { // fetch 1
            return response.json();
          }).then(data => {
            //console.log(data);
            //this just gets the artist id from the artist search string
            var mbArtistID = data["artists"][0].id
            var url2 = `http://musicbrainz.org/ws/2/release-group/?query=release:${cleanAlbumURI}+AND+arid:${mbArtistID}+AND+primarytype:${release_type}+AND+status:official&inc=recordings+recording-level-rels+work-rels+work-level-rels+artist-rels&fmt=json`; //?inc=url-rels&fmt=json/
            console.log("RG search:" + url2)
            return fetch(url2) // fetch 2
          }).then(response => {
            console.log("release group data found")
            return response.json();
          }).then(releaseData => {
            console.log(releaseData);
            releaseGroups = releaseData["release-groups"][0].releases
            releaseGroupID = releaseData["release-groups"][0].id

            var releaseGroupIDurl = "https://musicbrainz.org/release-group/" + releaseGroupID;
            document.getElementById("rg_id").href = releaseGroupIDurl;

            //console.log(releaseGroups);
            var filtered = releaseGroups.filter(a => a.status == "Official");
            console.log(filtered);
            var releaseID = filtered[0].id
            var url3 = `https://musicbrainz.org/ws/2/release/${releaseID}?inc=recordings+recording-level-rels+work-rels+work-level-rels+artist-rels&fmt=json&limit=3`;
            return fetch(url3) // fetch 3
          }).then(response => {
            return response.json();
          }).then(releaseData => {
            console.log(releaseData);
            credits_all = releaseData["media"][0]["tracks"]
            credits_track = releaseData["media"][0]["tracks"][curTrackInteger]["recording"].relations
            //console.log(credits_track);

            if (credits_track.length == 0) {
              const tmpl = () => ``;
              contributionsTemplate.innerHTML = tmpl();
            }
            else {
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
              <h4>Song Credits</h4>
              <table><thead>
              <tr><th>Artist<th>Contribution<th>Detail<tbody>
              ${creditNames.map( (cell, index) => `
                  <tr><td><a href ="https://musicbrainz.org/artist/${creditURIs[index]}" target="_blank">${cell}<a>
                  <td>${creditAttributes[index]}<td>${creditTypes[index]}</tr>
              `).join('')}
              </table>`;
            contributionsTemplate.innerHTML = tmpl(creditNames, creditTypes, creditAttributes, creditURIs);
              }
          }).catch(err => {
            //console.error(err);
          });

          // this whole chain first fetches an artistID, checks for wikidatacode, gets the title from the wikidata code and then grabs the extract
          getMBartistID(albumArtistURI)
            .then(mbArtistID => getMBwikiDataCode(mbArtistID)
              .then(artistWikiDataURLFixed => getWikiTitle(artistWikiDataURLFixed))
              .then(titleEncode => wikiAsyncFetch(titleEncode)
                .then(myJSONparsed => document.getElementById("artistInfo").innerHTML = myJSONparsed))
            )

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

          // some search string replacements  - not complete or comprehensive
          var albumFixed = albumSong.replace(/\(Deluxe(.*)/g, '')
            .replace(/\(Deluxe(.*)/g, '')
            .replace(/\[Deluxe(.*)/g, '')
            .replace(/\(Remastered(.*)/g, '')
            .replace(/\[Remastered(.*)/g, '')
            .replace(/\Remastered Version(.*)/g, '')
            .replace(/\(Super(.*)/g, '');
          //console.log("This is ALBUM search string FIXED " + albumFixed);

          var songFixed = titleSong.replace(/\(Deluxe(.*)/g, '')
            .replace(/\- Remastered(.*)/g, '')
            .replace(/\(Super(.*)/g, '');
          //console.log("This is TRACK search string FIXED " + songFixed);
          // some search string replacements  - not complete or comprehensive
          var str2 = " (album) by ";
          var str3 = albumArtist;
          var str1 = cleanAlbum;
          var res = str1.concat(str2);
          var res2 = res.concat(str3);
          // Wikipedia Search 1: get album data
          var wikiSearch = encodeURIComponent(res2);
          //console.log("This is ALBUM search string to Wikipedia " + wikiSearch);
          var url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${wikiSearch}&origin=*`;
          console.log("This should be the ALBUM search URL to Wikipedia: " + url);
          fetch(url)
            .then(function(response) {
              return response.json();
            })
            .then(function(json) {
              //console.log(json);
              let wikiTitle = json.query.search[0].title;
              let wikiPageId = json.query.search[0].pageid;
              var wikiUrl = encodeURIComponent(wikiTitle);


              //console.log(wikiUrl);
            //console.log(wikiPageId);
              // Wikipedia Search 2: Get actual album article
              var url2 = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${wikiUrl}&origin=*`;
              //console.log("this the album page from wikipedia " +url2)
              fetch(url2)
                .then(blob => blob.json())
                .then(data => {
                  // Work with JSON data here
                  //console.table(data);
                  var myJSON = JSON.stringify(data["query"]["pages"][wikiPageId].extract);
                  //  var myJSONfixed = JSON.stringify(myJson);
                  var myJSONparsed = JSON.parse(myJSON)
                  document.getElementById("albumInfo").innerHTML = myJSONparsed;
                  //return data;
                })
                .catch(e => {
                  return e;
                  //console.log("noAlbumInfo");
                  var noAlbumInfo = ("Server overloaded OR no information found");
                  $("#albumInfo").text(noAlbumInfo);
                });

            }); // title search wiki ends here

          // lyrics block
          var lyricsArtist = encodeURI(albumArtist);
          var lyricsTrack = encodeURI(songFixed);
          var urlSearchLyrics = `https://api.lyrics.ovh/v1/${lyricsArtist}/${cleanTitleSong}`
          var GoogleLyricsSearch = `https://www.google.com/search?q=${lyricsArtist}+-+${cleanTitleSong}+lyrics`
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
              ////console.log(myJSONparsed);
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


    // this prepares the data from above for the divs . html
    if ($("#song-title").text() == "<?=defaultTitleSong; ?>" || response["item"].id != idSong) {
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
      //$("#playing-div").attr("style", "background: url('" + albumPicture + "');background-size:cover;background-position: center center;");
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


      /// playback section

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
