var functionURL = `http://musicbrainz.org/ws/2/artist/?&fmt=json&limit=1&query=artist:dave`;
fetch(functionURL).then(response => {
  return response.json();

}).then(data => {
  console.log(data);
}).catch(err => {
  console.error(err);
});
