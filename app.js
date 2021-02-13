
require('dotenv').config();
const Express = require("express");
const BodyParser = require("body-parser");
var cors = require('cors')

const fs = require('fs')
const path = require('path');
var app = Express();

app.use(BodyParser.json({ limit: '10mb', extended: true }));
// let allowCrossDomain = function (req, res, next) {
//     var allowedOrigins = [process.env.DEV_TEST, "http://192.168.0.241:3001"];
//     var origin = req.headers.origin;
//     console.log('origin', origin)
//     if (allowedOrigins.indexOf(origin) > -1) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     res.header('Access-Control-Allow-Credentials', "true");
//     res.header('Access-Control-Allow-Headers',  "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// }
// app.use(allowCrossDomain);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(BodyParser.urlencoded({ extended: true }));
app.use(Express.static(__dirname + '/public'));

var database, collection;

// app.listen(5000, () => {
//     console.log("server listens port: 5000")
// });

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

var http = require('http').createServer(app);
const PORT = 5000;
var io = require('socket.io')(http);
http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { /* socket object may be used to send specific messages to the new connected client */

    console.log('new client connected');
});




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
    console.log('req.body getChannel', req.query)
    let user = users.find(user => user.userId == req.query.id)
    res.status(200).json(user);
    return
});



app.get('/getMessages', function (req,res){
    console.log('req.body', req.query)
    var dir = __dirname + '/messagesArchive';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0744);
    }
    let path = __dirname + '/messagesArchive/'
    let possiblePaths = [`${req.query.currentUserId}_${req.query.destinationUserId}.JSON`, `${req.query.destinationUserId}_${req.query.currentUserId}.JSON`]
    path = fs.existsSync(path + possiblePaths[0]) ? path + possiblePaths[0] : fs.existsSync(path + possiblePaths[1]) ? path + possiblePaths[1] : path + possiblePaths[0] 
    fs.readFile(path, "utf8", function(err, data){
        if(err){
            console.log('err', err)
           return res.status(200).json([])
        }else{
            console.log('data', data)
            return res.status(200).json(data)
        }
    })
})

app.post('/sendMessage', function (req, res){
    console.log('req.body', req.body)
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
    console.log('jsonFile', jsonFile)
    jsonFile.push(message)

    fs.writeFile(path, JSON.stringify(jsonFile), function(err) {
        if (err) {
            return res.sendStatus(500)
            // throw err
        };
        console.log('message Sent');
        return res.sendStatus(200)
        }
    )
      
})

app.get('/logout', function (req, res) {

    res.sendStatus(200);
    return

});


app.post(["/Categories"], 
(request, response) => {
    
});

app.get(["/Categories"], 
(request, response) => {
    
    console.log(`fetched! from where`)
    response.send("result");
    
})
