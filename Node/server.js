require('dotenv').config()
let express = require('express');
//let port = 5000;
let app = express();
let path = require('path');
var bodyParser = require('body-parser');
const Keycloak = require('keycloak-connect');
const multer = require('multer');
const session = require('express-session');
let AWSHandler = require('./server/lib/AWSHander');
var memoryStore = new session.MemoryStore();  
const cors = require('cors');  
let ESDB = require('./server/ESDB/esdb');
global.esdb = new ESDB();      
var keycloak = new Keycloak({ store: memoryStore });
const cron = require('node-cron');
const FirebaseRouter = require('./server/lib/FirebaseRouter');
const urlBase = require('./config/config').baseUrlVcloudServer;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./server/lib/users')

app.use(session({
    secret:'thisShouldBeLongAndSecret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));
const kc = require('./config/keycloakconfig.js').initKeycloak();
app.use(kc.middleware());


app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
	next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
	limit: '20mb'
}));
app.use(cors());
app.get('/api/index', function(req,res) {
    res.download('./uploads/index.pdf')
})


// AWSHandler.uploadFile();

require(__dirname + "/server/News/NewsRouter")(app);

const server = app.listen(process.env.PORT, function(req,res){
    console.log("Listening to: ", `${process.env.PORT}`)
})

var io = require("socket.io")(server, {
    //pingTimeout: 60000,
  
    cors: { origin: '*',
      methods: ["GET", "POST"],
      credentials: true
     },
  });
  io.on("connection", (socket) => {
    socket.on('join',(data,callback)=>{
      const { error, user } = addUser(socket.id, data)

      if (error) {
          return callback(error)
      }
      socket.join(user.room)
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
    })
      callback();
  })

    socket.on("msgsent", (sentdetail,callback) => {
      const user  = getUser(socket.id);
      let su = sentdetail?.friendUid;
      if(user){
      io.to(user.room).emit('firstusermsg', sentdetail)
      callback()
      }
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id)

      if (user) {
          // io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
          io.to(user.room).emit('roomData', {
              room: user.room,
              users: getUsersInRoom(user.room)
          })
      }
  })
  });