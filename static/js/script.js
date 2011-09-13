(function($) {

$(function() {
  
  var stats = new Stats();

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  $('body').append(stats.domElement);

  setInterval( function () {
      stats.update();
  }, 1000 / 60 );

  $('#page').append('<h1>socketbench</h1>');
  $('#page').append('<p id="clients">Connecting...</p>');
  $('#page').append('<pre id="log"></pre>');
  $('#page').append('<pre id="rendered"></pre>');
  
  var socket = io.connect('http://localhost:3000/');
  socket.on('clients', function (data) {
    $('#clients').html('Clients: ' + data);
  });
  
  var snaps_rendered = 0;
  socket.on('snapshot', function (snapshot) {
    $('#log').html(snapshot.ts + ": "+ snapshot.data[0].x + "," + snapshot.data[0].y);
    snaps_rendered++;
  });
  
  setInterval(function() {
    $('#rendered').html('Rate: ' + snaps_rendered + '/sec');
    snaps_rendered = 0;
  }, 1000);
});

})(jQuery);