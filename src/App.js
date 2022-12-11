import "./App.css";
import { InputCard } from "./InputCard.js";
import Header from "./Header.js";
import { OutputSection } from "./ActionBlock.js";
import React from "react";

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { debugInput: "" };
    this.setDebugInput = this.setDebugInput.bind(this);
  }

  setDebugInput(debugInput) {
    this.setState({ debugInput: debugInput });
  }

  render() {
    return (
      <div data-theme="emerald" className="w-full">
        <Header />
        <InputCard onChange={this.setDebugInput} />
        <OutputSection debugInput={this.state.debugInput} />
      </div>
    );
  }
}
