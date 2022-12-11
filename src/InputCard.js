import React from "react";

export class InputCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sendInput = this.sendInput.bind(this);
  }

  handleChange(e) {
    this.setState({ debugInput: e.target.value });
  }

  sendInput() {
    this.props.onChange(this.state.debugInput);
  }

  render() {
    return (
      <div className="card card-bordered shadow-xl w-2/3 m-10">
        <div className="card-body">
          <h3 className="card-title">Enter Debug Log Contents</h3>
          <textarea
            id="debugLogContents"
            className="textarea textarea-bordered min-h-[200px]"
            onChange={this.handleChange}
          ></textarea>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={this.sendInput}>
              Parse
            </button>
          </div>
        </div>
      </div>
    );
  }
}
