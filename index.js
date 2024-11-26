const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const Note = require('./models/note')



const requestLogger = (request, response, next)=>{
    console.log('Method:', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('---')

    next()
}

const unknownEndpoint = (request, response)=>{
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())
app.use(requestLogger)



let notes = [{ id: "1", content: "HTML is easy", important: true }, { id: "2", content: "Browser can execute only JavaScript", important: false }, { id: "3", content: "GET and POST are the most important methods of HTTP protocol", important: true }]
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/', (request, response)=>{
    response.send('<h1>Hello World</h1>')
})

app.get('/info', (request,response)=>{
    response.send('<p>Phonebook has info for '+persons.length+' people</p> <p>'+new Date().toString()+'</p>')
})

app.get('/api/persons', (request, response)=>{
    response.json(persons)
})

app.post('/api/persons', (request, response)=>{
    const body = request.body
    console.log(request.body)
    if(!body.number || !body.name){
        return response.status(400).json({
            error: "number or name are missing"
        })
    }

    persons.map(person=>{
        if(person.name === body.name){
            return response.status(400).json({
                error: "this name is already added"
            })
        }
    })

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(persons),
    }


    persons = persons.concat(person)

    console.log(person)
    response.json(person)
})


app.get('/api/persons/:id', (request, response)=>{
    const id = request.params.id
    const person = persons.find(person=> person.id === id)

    if(person)
    {
        response.json(person)
    }else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id',(request,response)=>{
    const id = request.params.id

    persons = persons.filter(person=> person.id !== id)

    response.json(persons)
})

app.get('/api/notes', (request, response)=>{
    Note.find({}).then(notes=>{
            response.json(notes)
    })
    
})


app.get('/api/notes/:id', (request, response, next)=>{
    Note.findById(request.params.id).then(note=>{
        if(note)
        {
            response.json(note)
        }else{
            response.status(404).end()
        }
        
    })
    .catch(error=>next(error))
    
})



const generateId = (datas)=>{
    const maxId = datas.length > 0? Math.max(...datas.map(n=>Number(n.id))): 0

    return String(maxId+1)
}

app.post('/api/notes', (request, response)=>{
    const body = request.body

    if(body.content === undefined){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = Note({
        content: body.content,
        important: body.important || false,
    })


    note.save().then(savedNote=>{
        response.json(savedNote)
    })
})

app.delete('/api/notes/:id', (request, response, next)=>{
    // const id = request.params.id
    // notes = notes.filter(note=> note.id !== id)

    // response.status(204).end()
    Note.findByIdAndDelete(request.params.id)
    .then(result=>{
        response.status(204).end()
    })
    .catch(error=> next(error))
})

app.put('/api/notes/:id', (request, response, next)=>{
    const body = request.body
    if(body.content === undefined){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: body.important
    }
    
    Note.findByIdAndUpdate(request.params.id, note, {new: true})
    .then(updatedNote=>{
        response.json(updatedNote)
    })
    .catch(error=> next(error))
})

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log('server running on port '+PORT)
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next)=>{
    console.error(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)