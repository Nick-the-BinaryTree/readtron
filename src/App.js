import React, { Component } from 'react';
import './css/App.css';
const parser = window.require('epub-parser');
const remote = window.require('electron').remote;
const fs = remote.require('fs-extra');
const dialog = remote.dialog;
const DecompressZip = window.require('decompress-zip');

let extracted = {}, dest = "";
document.onkeypress = function (e) {
    let toRem = Object.keys(extracted);

    for (let i=0; i<toRem.length; i++) {
      let path = dest + toRem[i];
      fs.remove(path);
    }
};

class App extends Component {
  constructor(props) {
    super(props);

    this.alterColor = this.alterColor.bind(this);
    this.header = React.createRef();
    this.button = React.createRef();
  }

  alterColor (light) {
    if (this.header && this.button) {
      if (light) {
        this.header.current.classList.add("white");
        this.button.current.classList.add("white");
      } else {
        this.header.current.classList.remove("white");
        this.button.current.classList.remove("white");
      }
    }
  }

  render() {
    return (
      <div className="App">
        <h1 id="header" ref={this.header}>Readtron</h1>
        <div id="loadBook" ref={this.button}
          onMouseEnter={() => this.alterColor(1)}
          onMouseOut={() => this.alterColor(0)}
          onClick={() => {
            /* Open File */
            dialog.showOpenDialog(
            { filters: [{ name: "EPUB", extensions: ["epub"] }] },
            fileNames => {
               if(fileNames === undefined) {
                  console.log("No file selected");
               } else {
                  parser.open(fileNames[0], function (err, epubData) {
                    if(err) return console.log(err);
                    for (let filePath in epubData.easy.itemHashByHref) {
                      if (filePath.substr(filePath.length-4) === "html") {
                        // console.log(filePath);
                      }
                    }
                  });
                  /* Extract File */
                  let i, unzipper = new DecompressZip(fileNames[0]);
                  dest = fileNames[0]

                  for (i = dest.length-1; i>0; i--) {
                    if (dest[i-1] === '/') break;
                  }
                  dest = dest.substr(0, i);
                  unzipper.extract({
                    path: dest,
                    filter: file => {
                      if (file.parent === ".") {
                        extracted[file.filename] = true;
                      } else {
                        extracted[file.parent] = true;
                      }
                      return true;
                    }
                  });

               }
            });
          }}>
          Load Book
        </div>
      </div>
    );
  }
}

export default App;
