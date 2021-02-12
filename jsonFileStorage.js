import { openSync, readFile, writeFile } from 'fs';

// SET UP
export const create = (filename, key, value, flag = 'a') => {
  const filepath = `./${filename}`;
  openSync(filepath, flag);

  const readFileCallback = (error, data) => {
    if (error) {
      console.log('readFile Error: --- ', error);
    }
    const objContent = {};

    // Populate object.
    objContent[key] = value;

    // JS object --> JSON string .
    const setupContent = JSON.stringify(objContent);

    writeFile(filename, setupContent, (err) => {
      if (err) {
        console.log('writeFile Error: --- ', err);
      }
    });
  };

  readFile(filename, 'utf-8', readFileCallback);
};

// ADD
// `callback` has two parameters: 1) data | 2) error.
export const add = (filename, key, userInput, callback) => {
  const whenFileIsRead = (error, data) => {
    if (error) {
      console.log('Reading Error: ', error);
      callback(null, error);
      return;
    }

    // JSON string --> JS Object.
    const objContent = JSON.parse(data);

    // Check for key, if it doesn't exist, exit immediately.
    if (!(key in objContent)) {
      console.log('Key currently non-existent.');

      callback(null, error);
      return;
    }

    // Push name/address to the value of the key (which is an array in this case).
    objContent[key].push(userInput);

    // JS Object --> JSON string.
    const newJsonContent = JSON.stringify(objContent);

    writeFile(filename, newJsonContent, 'utf-8', (err) => {
      if (err) {
        console.log('Writing Error: ---', err);
        callback(null, error);
        return;
      }
      // When file is successfully written:
      callback(newJsonContent, null); // Now we have the content filled, & error null for the callback.
    });
  };

  readFile(filename, 'utf-8', whenFileIsRead);
};

// READ
// `callback` takes 2 parameters: 1) JSON content  2) Read error if any.
export const read = (filename, callback) => {
  const whenFileIsRead = (err, jsonContent) => {
    if (err) {
      console.log('Reading Error: ---', err);
      callback(null, err);
      return;
    }

    // JSON string --> JS object.
    const objContent = JSON.parse(jsonContent);

    // Return the JSON content via the callback's 1st parameter.
    callback(objContent, null);
  };
  readFile(filename, 'utf-8', whenFileIsRead);
};

// WRITE
export const write = (filename, objContent, callback) => {
  // JS Object --> JSON string.
  const stringContent = JSON.stringify(objContent);

  writeFile(filename, stringContent, 'utf-8', (err) => {
    if (err) {
      console.log('writeFile Error: ---', err);
      callback(null, err);
      return;
    }
    console.log('writeFile Success! ---');
    callback(stringContent, null);
  });
};

