const router = require('express').Router();
const fs = require('fs')
const { v4 } = require('uuid')
const util = require('util');

// GET "/api/notes" responds with all notes from the database
router.get('/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) =>{
    if(err){
        console.log(err);
    }else{
        res.json(JSON.parse(data))
        console.log('Request to get notes received');
    }
  })
});

// POST "/api/notes" adds a note to the database
router.post('/notes', (req, res) => {
  console.log('save request received')
  console.log(`entered post ${req.body}`)

  //if the new note has a title and text, create a new object
  const {title, text} = req.body;
  if (title && text){
      const newNote = {
          title,
          text,
          id: v4()
      };

      fs.readFile('./db/db.json', 'utf8', (err, data) =>{
          console.log('readfile data: ' + JSON.parse(data))
          if(err){
              console.log(err);
          }else{
              //push the new note into allNotes array
              console.log('data line 55: ' + JSON.parse(data))
              let allNotes = JSON.parse(data);
              allNotes.push(newNote);
  
              //rewrite db.json with new note array
              fs.writeFile('./db/db.json', JSON.stringify(allNotes), err =>{
                  if(err){
                      console.log(err)
                  }else{
                      console.log('Note added')
                  }
              });
          }
      });

      const response = {
          status: 'success',
          body: newNote,
      };

      res.status(201).json(response)    
  }else{
      res.status(500).json('Error in posting')
  }
});
  
// DELETE "/api/notes" deletes the note with an id equal to req.params.id
router.delete('/notes/:id', (req, res) => {
  const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );
  const readFromFile = util.promisify(fs.readFile);
  const notesId = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all tips except the one with the ID provided in the URL
      const result = json.filter((notes) => notes.id !== notesId);

      // Save that array to the filesystem
      writeToFile('./db/db.json', result);

      // Respond to the DELETE request
      res.json(`Item ${notesId} has been deleted 🗑️`);
    });
  });

// PUT "api/notes" updates a note with an id equal to req.params.id
router.put('/notes/:id', (req, res) => {
  const newNote = { ...req.body, id: v4() }
  fs.readFile('./db/db.json', 'utf-8', (err, data) => {
    err && res.status(500)
    const parsed = data && JSON.parse(data)
    const newArray = parsed !== [] && parsed.map(note => note.id === req.params.id ? newNote : note)
    fs.writeFile('./db/db.json', JSON.stringify(newArray), err => {
      err && res.status(500)
      res.json(newArray)
    })
  })
});

module.exports = router;
