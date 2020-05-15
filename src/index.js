const path = require('path') // core node module
const http = require('http') // core node module
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocation} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
// __dirname is the actual directory we are
// '../public' is getting out of the src folder and going to public
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))



// server(emit) -> client(receive) - countUpdated
// client(emit) -> server(receive) - increment
let msg = "Welcome!"
io.on('connection', (socket)=>{
    console.log('New Websocket connection!')

    //the server emits an event in five ways:
    // 1. socket.emit: emit to that particular connection
    // 2. socket.broadcast.emit: to emit to everybody else except for this particular connection
    // 3. io.emit: emit to everyone
    // 4. io.to.emit: emits an event to everybody in a specific room
    // 5. socket.broadcast.to.emit: sending an event to everyone except for the specific client, but it's limiting to a specific chat room
  

    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id,username, room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', msg))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('sendMessage', (newMsg, callback)=>{
        const filter = new Filter()
        const user = getUser(socket.id)
        
        if(filter.isProfane(newMsg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, newMsg))
        callback() // esto es el 'Message delivered' de chat.js 
    })

    socket.on('shareLocation',  (coords, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback() // calling this function lets the client know that the event has indeed been acknowledged. chat.js  'Location shared'
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

       
    })
})



server.listen(port,()=>{
    console.log(`Server is on port ${port}`)
})