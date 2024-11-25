const express = require('express')
const app = express()
const cors = require('cors')


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

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
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
    response.json(notes)
})


app.get('/api/notes/:id', (request, response)=>{
    const id = request.params.id
    const note = notes.find(note=> note.id === id)

    if(note){
        response.json(note)
    }else{
        response.status(404).end()
    }
    
})



const generateId = (datas)=>{
    const maxId = datas.length > 0? Math.max(...datas.map(n=>Number(n.id))): 0

    return String(maxId+1)
}

app.post('/api/notes', (request, response)=>{
    const body = request.body

    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = {
        content: body.content,
        important: Boolean(body.important)||false,
        id: generateId(notes),
    }


    notes = notes.concat(note)

    console.log(note)
    response.json(note)
})

app.delete('/api/notes/:id', (request, response)=>{
    const id = request.params.id
    notes = notes.filter(note=> note.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT||3001
app.listen(PORT,()=>{
    console.log('server running on port '+PORT)
})

app.use(unknownEndpoint)