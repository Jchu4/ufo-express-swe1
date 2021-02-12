// Import dependencies.
import express, { json } from 'express';
import methodOverride from 'method-override'
import { read, add, write } from './jsonFileStorage.js'

// App setup.
const app = express();
const PORT = 3000;
const JSONFILE = 'data.json';

// Load EJS template engine.
app.set('view engine', 'ejs');
// Set up our middleware to parse POST data as follows.
app.use(express.urlencoded({ extended: false}));
// Serve CSS file found in 'public' directory.
app.use('/public', express.static('public'));
// Override DELETE/POST with ?_method=PUT
app.use(methodOverride('_method'));


// Sighting - GET. [Renders form-fill].
app.get('/sighting', (req, res) => {
  read(JSONFILE, (data, err) => {
    if (err) {
      console.log("/sighting(GET) Read error", err);
    }
    console.log("/sighting(GET) - Read data.json successfully! ----");
    
    res.render('sighting-form', {})
  });
});

// Sighting - POST. [Routes HTTP POST requests to a specified path].
app.post('/sighting', (req, res) => {
  add(JSONFILE, 'sightings', req.body, (jsonContent, err) => {
    if (err) {
      console.log("/sighting(POST) Read error", err);
    }
    console.log("/sighting(POST) - Added to data.json successfully! ----");

    // Convert JSON string --> JS Object.
    let jsObject = JSON.parse(jsonContent)
    let sightingIndex = jsObject.sightings.length - 1;

    // Status code: "302 Found" is the 1st Default argument, before the path.
    res.redirect(`/sighting/${sightingIndex}`);
  });
});

// Sighting/:index - GET. [Renders summary of form submission of latest sighting].
app.get('/sighting/:index', (req, res) => {
  const { index } = req.params;

  read(JSONFILE, (data, err) => {
    if (err) {
      console.log("/sighting/:index(GET) Read error", err);
    }
    console.log("/sighting/:index(GET) - Read data.json successfully! ----");

    // Returns 1 object from sightings array.
    const content = data.sightings[index]

    res.render('sighting-index', {content, index});
   });
});

//  Sighting/:index/edit - GET. [Read form with values populated from 'data.json].
app.get('/sighting/:index/edit', (req, res) => {
  const {index} = req.params;

  read(JSONFILE, (jsonContent, err) => {
    if (err) {
       console.log("/sighting/:index/edit(GET) - Read error", err);
    }
    let content = jsonContent.sightings[index];
    console.log(content);

    res.render('sighting-index-edit', {content, index})
  });
});

// Sighting/:index/edit - PUT. [Routes HTTP POST requests to a specified path].
app.put('/sighting/:index/edit', (req, res) => {
  const { index } = req.params;

  console.log("PUT Request, body:", req.body)

  // Read 'data.json' file & write edits made back to 'data.json'.
  read(JSONFILE, (jsonContent) => {
    jsonContent["sightings"][index] = req.body;
    write(JSONFILE, jsonContent, (data) => {
      console.log("/sighting:index/edit(PUT) - Write back to data.json successfully! ----");
    });
    // Status code: "302 Found" is the 1st Default argument, before the path.
    res.redirect(`/sighting/${index}`);
  });
});

// Sighting/:index/delete - DELETE. [Request is sent from the /sighting/:index/edit form].
app.delete('/sighting/:index/delete', (req, res) => {
  const { index } = req.params;

  read(JSONFILE, (jsonContent, err) => {
    console.log("sighting/:index(DELETE) - readFile successful!") 

    if (jsonContent.sightings[index]) {
      // Remove sighting record at respective index.
      jsonContent['sightings'].splice(index, 1)
    } else {
      res.status(404).json({ message: "Record is empty!"});
    }
    write(JSONFILE, jsonContent, (data) => {
      console.log('sighting/:index(DELETE) Deleted record succesfully.')
      res.render('sighting-index-deleted', {index});
    });
  });
});

// Root - GET. [Reads & renders our 'data.json' file].
app.get('/', (req, res) => {
  read(JSONFILE, (jsonContent, err) => {
    if (err) {
      console.log("/root Read error", err);
    } 
    console.log("/root readFile successful!");
    const sightings = jsonContent.sightings;
    const { order } = req.query;

    console.log(order)

    res.render('root', {sightings , order});
  });
});

// Root - DELETE. [Button functionality to delete data in sightings array].
app.delete('/:index', (req, res) => {
  const { index } = req.params;
  read(JSONFILE, (jsonContent, err) => {
    console.log("/root(DELETE) - readFile successful!") 

    if (jsonContent.sightings[index]) {
      // Remove sighting record at respective index.
      jsonContent['sightings'].splice(index, 1)
    } else {
      res.status(404).json({ message: "Record is empty!"});
    }

    write('data.json', jsonContent, (data) => {
      console.log('/:index(DELETE) Deleted record succesfully.')
      res.redirect('/');
    });
  });
});

// Shape - GET. [].
app.get('/shapes', (req, res) => {
  read(JSONFILE, (jsonContent, err) => {
    if (err) {
      console.log("/shapes Read error", err);
    }
    console.log("/shapes readFile successful!");

    let content = jsonContent.sightings;
  
    res.render('shapes', { content });
  });
});

// Shape/:shape - GET. [Comes from /shapes page's 'View All' button].
app.get('/shapes/:shape', (req, res) => {
  read(JSONFILE, (jsonContent, err) => {
    if (err) {
      console.log("/shapes/:shape Read error", err);
    }
    console.log("/shapes/:shape readFile successful!");

    const content = jsonContent.sightings;
    const { shape } = req.params;

    res.render('shape-individual', { content, shape })
  });
});


// Set up socket on respective port.
app.listen(PORT, (err) => {
  if (err) {
   console.log("PORT setup Unsuccessfull")
  }
  console.log("Success, listening on Port", PORT);
});