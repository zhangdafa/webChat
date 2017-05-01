                                                    配合Node http server
Server (app.js)

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

Client (index.html)

  var socket = io('http://localhost');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });


                                                      配合 Express 3/4
Server (app.js)

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
      
Client (index.html)


  var socket = io.connect('http://localhost');
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });


                            发送和接受事件
Socket.IO 允许触发和接受自定义事件，除了connect，message和disconnect这三个官方事件
Server

// note, io(<port>) will create a http server for you
var io = require('socket.io')(80);

io.on('connection', function (socket) {
  io.emit('this', { will: 'be received by everyone'});

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('disconnect', function () {
    io.emit('user disconnected');
  });
});


定义自己的命名空间

如果使用默认/命名空间工程，可以对特定应用程序发出的所有消息和事件进行控制。
如果你想利用第三方代码生成代码，或与别人分享，socket.io提供一种命名空间插座
这有复用单个连接的好处。而不是使用两个WebSocket连接socket.io，它会使用一个

Server (app.js)

var io = require('socket.io')(80);
var chat = io
  .of('/chat')
  .on('connection', function (socket) {
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });
      
Client (index.html)

  var chat = io.connect('http://localhost/chat')
    , news = io.connect('http://localhost/news');
  
  chat.on('connect', function () {
    chat.emit('hi!');
  });
  
  news.on('news', function () {
    news.emit('woot');
  });



发送轻便消息
有时某些消息可以被丢弃。假设你有一个应用程序，显示实时鸣叫的关键字比伯.

如果某个客户端没有准备好接收消息（因为网络缓慢或其他问题），
或者因为它们通过长轮询连接，并且处于请求响应周期的中间），
如果它没有收到所有相关的比伯鸣叫你的应用程序不会受到影响.

In that case, you might want to send those messages as volatile messages.

Server

var io = require('socket.io')(80);

io.on('connection', function (socket) {
  var tweets = setInterval(function () {
    getBieberTweet(function (tweet) {
      socket.volatile.emit('bieber tweet', tweet);
    });
  }, 100);

  socket.on('disconnect', function () {
    clearInterval(tweets);
  });
});
    
发送和获取数据

有时候，当应用确认收到消息之后，你也许想获取一个回调
To do this, simply pass a function as the last parameter of .send or .emit. What’s more, when you use .emit, 
the acknowledgement is done by you, which means you can also pass data along:

Server (app.js)

var io = require('socket.io')(80);

io.on('connection', function (socket) {
  socket.on('ferret', function (name, fn) {
    fn('woot');
  });
});
      
Client (index.html)

  var socket = io(); // TIP: io() with no args does auto-discovery
  socket.on('connect', function () { // TIP: you can avoid listening on `connect` and listen on events directly too!
    socket.emit('ferret', 'tobi', function (data) {
      console.log(data); // data will be 'woot'
    });
  });




广播消息
To broadcast, simply add a broadcast flag to emit and send method calls. 、
Broadcasting means sending a message to everyone else except for the socket that starts it.

Server

var io = require('socket.io')(80);

io.on('connection', function (socket) {
  socket.broadcast.emit('user connected');
});
    
##使用它只是作为一个跨浏览器的WebSocket
如果你只是想WebSocket的语义，你也可以这样做。简单地利用发送和侦听消息事件:

Server (app.js)

var io = require('socket.io')(80);

io.on('connection', function (socket) {
  socket.on('message', function () { });
  socket.on('disconnect', function () { });
});
      
Client (index.html)


  var socket = io('http://localhost/');
  socket.on('connect', function () {
    socket.send('hi');

    socket.on('message', function (msg) {
      // my msg
    });
  });

      
If you don’t care about reconnection logic and such, take a look at Engine.IO, which is the WebSocket semantics transport layer Socket.IO uses.