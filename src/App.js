import React, { Component } from 'react';
import './css/App.css';
const parser = window.require('epub-parser');
const remote = window.require('electron').remote;
const fs = remote.require('fs-extra');
const dialog = remote.dialog;
const DecompressZip = window.require('decompress-zip');

let htmlFilePaths = [], extracted = {}, dest = "";

remote.getCurrentWindow().on("close", () => {
    let toRem = Object.keys(extracted);

    for (let i=0; i<toRem.length; i++) {
      let path = dest + toRem[i];
      fs.remove(path);
    }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {page: -1};

    this.alterColor = this.alterColor.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.titleScreen = React.createRef();
    this.header = React.createRef();
    this.button = React.createRef();
    this.webview = React.createRef();
  }
  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  handleKeyDown (e) {
    if (this.state.page === -1) return;
    if (e.keyCode === 39 && this.state.page < htmlFilePaths.length) {
      this.webview.current.src = htmlFilePaths[this.state.page+1];
      this.setState({page: this.state.page+1});
    } else if (e.keyCode === 37 && this.state.page > 0) {
      this.webview.current.src = htmlFilePaths[this.state.page-1];
      this.setState({page: this.state.page-1})
    }
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
        <div ref={this.titleScreen} className="titleScreen">
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
                    dest = fileNames[0];
                    parser.open(dest, function (err, epubData) {
                      if(err) return console.log(err);
                      for (let filePath in epubData.easy.itemHashByHref) {
                        if (filePath.substr(filePath.length-4) === "html") {
                          htmlFilePaths.push("file://" + dest + "OEBPS/" + filePath);
                        }
                      }
                    });
                    /* Extract File */
                    let i, unzipper = new DecompressZip(fileNames[0]);

                    for (i = dest.length-1; i>0; i--) {
                      if (dest[i-1] === '/') break;
                    }
                    dest = dest.substr(0, i);
                    unzipper.on('extract', () => {
                      this.titleScreen.current.style.display = "none";
                      this.webview.current.src = htmlFilePaths[0];
                      this.webview.current.style.display = "inline-flex";
                      this.setState({page: 0});
                    });
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
        <webview ref={this.webview}></webview>
      </div>
    );
  }
}

export default App;
