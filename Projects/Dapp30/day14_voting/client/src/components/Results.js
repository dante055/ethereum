import React, { Component } from 'react';

class Results extends Component {
  componentDidMount() {
    if (this.props.shouldReset) {
      window.location.reload(true);
    }
  }
  render() {
    return (
      <div>
        <h1>result</h1>
      </div>
    );
  }
}

export default Results;
