/**
 * 
 * 
 * 
 * 
 * chrome autoplay policy 때문에 불가능. 
 * 
 * 
 * 
 * 

$(function () {
  const audio = document.querySelector("audio");
  document.querySelector("audio").play();
  setTimeout(function () {
    audio.muted = false;
  }, 1000);
});

var promise = document.querySelector("video").play();
if (promise !== undefined) {
  promise
    .then((_) => {
      // Autoplay started!
    })
    .catch((error) => {
      // Autoplay was prevented.
      // Show a "Play" button so that user can start playback.
    });
}
*/
