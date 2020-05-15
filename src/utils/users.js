const users = []

const addUser = ({id, username, room}) =>{
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    
    // validate username
    if(existingUser){
        return {
            error: 'Username is taken!'
        }
    }

    // Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        // splice(): borra un elemento en el array basado en su index
        return users.splice(index,1)[0] // esta devolviendo la propiedad 'id' del objeto users. Por eso el '[0]'
    }

}

const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id
    })

    if(!user){
        return {
            error: 'User does not exist'
        }
    }

    return user
}

const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter((user)=>{
        return user.room === room
    })

    if(!usersInRoom){
        return {
            error: 'No users in that room'
        }
    }

    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}