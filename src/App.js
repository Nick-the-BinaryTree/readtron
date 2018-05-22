import React, { Component } from 'react';
import './css/App.css';
const dialog = window.require('electron').remote.dialog;
const parser = window.require('epub-parser');

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
            dialog.showOpenDialog(
            { filters: [{ name: "EPUB", extensions: ["epub"] }] },
            fileNames => {
               if(fileNames === undefined) {
                  console.log("No file selected");
               } else {
                  console.log(fileNames[0]);
                  parser.open(fileNames[0], function (err, epubData) {
                    if(err) return console.log(err);
                    console.log(epubData.easy);
                    for (let filePath in epubData.easy.itemHashByHref) {
                      if (filePath.substr(filePath.length-4) === "html") {
                        console.log(filePath);
                      }
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
