//required packages
const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const uuid = require('uuid');

// Set up the port number
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

//display notes page
app.get('/notes', (req, res) =>{
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//get all notes
app.get('/api/notes', (req, res)=>{
    console.info(`${req.method} request received for notes`);
    readFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

//write data to a file
const writeData = (destination, data) =>
  fs.writeFile(destination, JSON.stringify(data, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

//read data from a file and append new content
const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content)
        writeData(file, parsedData);
      }
    });
};

//add a new note
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note ${req.body}`);
    
    const { title, text } = req.body;
    
    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuid.v4(),
      };
      readAndAppend(newNote, './db/db.json');
      res.json(newNote);
    } else {
      res.status(400).send('Error in adding note');
    }
});

//delete a note
app.delete("/api/notes/:id", function(req, res) {
    console.log("params", req.params.id)
    fs.readFile('./db/db.json', 'utf-8',(err,data)=>{
      if(err){
        console.error(err)
      }else{
        let parsedData = JSON.parse(data)
        parsedData = parsedData.filter(({ id }) => id !== req.params.id);
        fs.writeFile('./db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
        err ? console.error(err) : res.json('writeFile'))
      }
    })
  });

// Route to the index
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

//listen on port 3001
app.listen(PORT, () =>
    console.log(`APP listening at http://localhost:${PORT}`)
);