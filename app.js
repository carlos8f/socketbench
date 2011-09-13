var express = require('express'),
    app = module.exports = express.createServer(),
    conf = require('./conf.js'),
    _ = require('underscore'),
    io = require('socket.io').listen(app);

app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname + '/static'));
  app.register('._', {
    compile: function(str, options) {
      var compiled = _.template(str);
      return function (locals) {
        return compiled(locals);
      };
    }
  });
  app.set('view engine', '_');
  app.set('view options', {
    layout: false
  });
});
app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});
app.configure('production', function() {
  app.use(express.errorHandler()); 
});

app.get('/', function(req, res) {
  res.render('index');
});

var clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  for (var i in clients) {
    clients[i].emit('clients', clients.length);
  }
});

io.sockets.on('disconnect', function (socket) {
  var new_clients = [];
  for (var i in clients) {
    if (clients[i].id != socket.id) {
      new_clients.push(clients[i]);
    }
  }
  clients = new_clients;
  for (var i in clients) {
    clients[i].emit('clients', clients.length);
  }
});

// Send random snapshots 60x/sec.
setInterval(function() {
  // Generate snapshot.
  var snapshot = {ts: new Date().getTime(), data: []};
  _.each(clients, function() {
    snapshot.data.push({x: Math.random(), y: Math.random()});
  });

  // Send to each client.
  _.each(clients, function(client) {
    client.emit('snapshot', snapshot);
  });
}, 1000 / 60);

if (!module.parent) {
  app.listen(conf.port);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}


