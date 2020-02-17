
# Now Playing Dashboard for Spotify

 **About**

This is a dashboard for Spotify that fetches data https://api.lyrics.ovh/, Wikipedia, MusicBrainz and Spotify about what you are currently listening to.

![Screenshot](https://github.com/peterdconradie/Now-Playing-Dashboard-for-Spotify/blob/master/screenshot.png)

Latest release : v0.1
## **Known Issues**
- Wikipedia search sometimes results in the same text for both albums and artists. This happens with lesser known artists.
- Musicbrainz doesn't always have a Wikidata identifier associated with an artist, in which case the artist info box does not get populated.

## **Changelog**

v0.1
- Ability to fetch album song info from Wikipedia
- Ability to fetch artist info from Wikipedia
- Fetch song credits - if available - from https://api.lyrics.ovh/
- Fetch artist credits - if available - from MusicBrainz
- Added artist art from Spotify
- Added artist genre from Spotify
- Get song and artist popularity from Spotify
- Added search links to album and artist info to Allmusic.com, albumoftheyear.com and last.fm
- Added release date information from Spotify
- Added playback controls (prev, pause, play, next, shuffle, repeat)
- Added volume indicator
- Modified login page

## **Coded in :**

HTML, CSS, JS, PHP

## **Used libraries:**

- [Spotify Web API PHP by jwilsson](https://github.com/jwilsson/spotify-web-api-php)
- [Spotify Web API JS by JMPerez](https://github.com/jmperez/spotify-web-api-js)

## **How do I run this?**

Clone or download the repository and run it locally with XAMPP (macOS, Linux or Windows) or Wampserver (Windows only).

For Mac users, macOS has a built in server: if you put the folder in your root documents folder, running and accessing it can be done by executing the following code in your terminal:
`php -S localhost:3000 -t /Users/{YOUR USERNAME}/Now-Playing-Dashboard-for-Spotify-master`

Following this, you can access it at: `http://localhost:3000/`

## **What modifications are required ?**
As originally instructed by [busybox11](https://github.com/busybox11/NowPlaying-for-Spotify), to complete setup for your local machine, you need a `Client ID` a `Client Secret` and a domain url `Domain`.

*Getting your Client ID and Client Secret:*
First create a Client ID (`Create a Client ID` button) on [Spotify's developer dashboard](https://developer.spotify.com/dashboard/applications).
Type your app's name in the `App or Hardware name` text field, and its description on the `App or Hardware description` text field. In the `What are you building?` section, indicate the platform which you are building the app for, then click on the `NEXT` button. Answer to the commercial integration question, and continue. If necessary, fill the form and check all the boxes at the 3rd stage.

Now that you have your app, you have some modifications to do in two files: `login.php` and `token.php`.

Edit the following values:

- `YOUR_CLIENT_ID` your Client ID available on your app's panel,
- `YOUR_CLIENT_SECRET` your `Client Secret` available by clicking on the `Show Client Secret` button situated on the same webpage as your client ID,
- `YOUR_DOMAIN` by your redirect URL, in the case of a local hosting replace it by `http://localhost/token.php` in most cases. basically, it's the accessible URL for the `token.php` page.

Let's go back on our app's panel. You need to declare the URL where the `token.php` page is located, for a local hosting it would be in most cases `http://localhost/token.php`. Click on the green `Edit settings` button situated on the top of the page, then in the `Redirect URIs` text field, indicate yours. ***ATTENTION***: what you typed should **IMPERATIVELY** be the same as what you wrote in the two precedent files! Then click on the `SAVE` button on the very bottom of the form. Your app is declared and ready to use!

## **Credits**
The base for this web application was provided by [busybox11](https://github.com/busybox11/NowPlaying-for-Spotify) and it uses the [Spotify Web API PHP by jwilsson](https://github.com/jwilsson/spotify-web-api-php) and [Spotify Web API JS by JMPerez](https://github.com/jmperez/spotify-web-api-js). Icons by [smashicons](https://www.flaticon.com/authors/smashicons)
