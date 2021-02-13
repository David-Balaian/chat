
require('dotenv').config();
const Express = require("express");
const BodyParser = require("body-parser");
const fs = require('fs')

let users = [
    {username: "user_1", userId: 1613120611627, avatar: "/avatar1.png"},
    {username: "user_2", userId: 1613120611628, avatar: "/avatar2.png"},
    {username: "user_3", userId: 1613120611629, avatar: "/avatar3.png"},
    {username: "user_4", userId: 1613120611630, avatar: "/avatar4.png"},
    {username: "user_5", userId: 1613120611631, avatar: "/avatar5.png"},
    {username: "user_6", userId: 1613120611632, avatar: "/avatar6.png"},
    {username: "user_7", userId: 1613120611633, avatar: "/avatar7.png"},
    {username: "user_8", userId: 1613120611634, avatar: "/avatar1.png"},
    {username: "user_9", userId: 1613120611635, avatar: "/avatar2.png"},
    {username: "user_10", userId: 1613120611636, avatar: "/avatar3.png"},
    {username: "user_11", userId: 1613120611637, avatar: "/avatar4.png"},
    {username: "user_12", userId: 1613120611638, avatar: "/avatar5.png"},
    {username: "user_13", userId: 1613120611639, avatar: "/avatar6.png"},
    {username: "user_14", userId: 1613120611640, avatar: "/avatar7.png"},
  ]


var app = Express();
app.use(BodyParser.json({ limit: '10mb', extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
        
app.use(Express.static(__dirname + '/public'));


app.post('/authenticate', function (req, res) {
    let findUserIndex = users.findIndex(user => user.username === req.body.userName)
    if(findUserIndex > -1){
        return res.status(200)
        .json({
            userInfo: {...users[findUserIndex]}
        });
    }
    res.status(500)
        .json({
            error: 'Internal error please try again'
        });
});

app.get('/getChannels', function (req, res) {
    
    let usersArr = users.filter(user => user.userId != req.query.id)
    res.status(200).json(usersArr);
    return
});

app.get('/getChannel', function (req, res) {
    let user = users.find(user => user.userId == req.query.id)
    res.status(200).json(user);
    return
});



app.get('/getMessages', function (req,res){
    var dir = __dirname + '/messagesArchive';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0744);
    }
    let path = __dirname + '/messagesArchive/'
    let possiblePaths = [`${req.query.currentUserId}_${req.query.destinationUserId}.JSON`, `${req.query.destinationUserId}_${req.query.currentUserId}.JSON`]
    path = fs.existsSync(path + possiblePaths[0]) ? path + possiblePaths[0] : fs.existsSync(path + possiblePaths[1]) ? path + possiblePaths[1] : path + possiblePaths[0] 
    fs.readFile(path, "utf8", function(err, data){
        if(err){
           return res.status(200).json([])
        }else{
            return res.status(200).json(data)
        }
    })
})

app.post('/sendMessage', function (req, res){
    let message = {
        message: req.body.message,
        sender: req.body.sender,
        time: Date.now(),
    }
    let path = __dirname + '/messagesArchive/'
    let possiblePaths = [`${req.body.currentUserId}_${req.body.destinationUserId}.JSON`, `${req.body.destinationUserId}_${req.body.currentUserId}.JSON`]
    path = fs.existsSync(path + possiblePaths[0]) ? path + possiblePaths[0] : fs.existsSync(path + possiblePaths[1]) ? path + possiblePaths[1] : path + possiblePaths[0] 
    let jsonFile;
    try{
        jsonFile = fs.readFileSync(path)
    }catch(err){
        jsonFile = []
    }
    if(jsonFile.length){
        jsonFile = JSON.parse(jsonFile)
    }
    jsonFile.push(message)
    io.sockets.emit("FromAPI", {ids:path, messages:jsonFile});


    fs.writeFile(path, JSON.stringify(jsonFile), function(err) {
        if (err) {
            return res.sendStatus(500)
        };
        return res.sendStatus(200)
        }
    )
      
})



var http = require('http')
var server = http.createServer(app);
const PORT = 5000;
const socketIo = require("socket.io");
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
  });


  server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});