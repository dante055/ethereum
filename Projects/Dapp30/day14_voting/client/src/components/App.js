import React, { Component } from 'react';
import '../css/App.css';
import Navigation from './Navigation';
import Home from './Home';
import Create from './Create';
import Ballots from './Ballots';
import Ballot from './Ballot';
import Results from './Results';
import Error from './Error';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Alert } from 'react-bootstrap';

class App extends Component {
  state = {
    ballotsDetail: [],
    ballotPath: [],
    showAlert: false,
    shouldReset: false,
    isCreating: false,
    ballotName: '',
    choices: '',
    timeLimit: '',
    timeLimitType: 'Seconds',
  };

  async componentDidMount() {
    const { contract } = this.props;

    const ballotsDetail = await contract.methods.showBallots().call();
    const ballotPath = ballotsDetail.map(
      ballot => `/ballot/${ballot.ballotId}`
    );
    this.setState({ ballotsDetail, ballotPath });
  }

  createBallot = async (ballotName, choices, timeLimit, timeLimitType) => {
    this.setState({
      isCreating: true,
      showAlert: false,
      ballotName,
      choices: choices.toString(),
      timeLimit,
      timeLimitType,
    });
    const { contract } = this.props;
    const accounts = await this.props.getAccounts();
    let unixTimestamp;
    if (timeLimitType === 'Hours') {
      unixTimestamp = timeLimit * 3600;
    } else if (timeLimitType === 'Days') {
      unixTimestamp = timeLimit * 86400;
    } else if (timeLimitType === 'Weeks') {
      unixTimestamp = timeLimit * 604800;
    } else {
      unixTimestamp = timeLimit;
    }

    let isBallotCreated;
    let ballotsDetail;
    let ballotPath;
    let newBallotDetail;

    try {
      await contract.methods
        .createBallot(ballotName, choices, unixTimestamp)
        .send({ from: accounts[0] });
      ballotsDetail = await contract.methods.showBallots().call();
      ballotPath = ballotsDetail.map(ballot => `/ballot/${ballot.ballotId}`);
      newBallotDetail = {
        id: ballotsDetail[ballotsDetail.length - 1].ballotId,
        name: ballotsDetail[ballotsDetail.length - 1].name,
      };
      isBallotCreated = true;
    } catch (error) {
      console.log(error);
      isBallotCreated = false;
    }

    const alertClass = isBallotCreated ? 'success' : 'danger';
    const alertMessage = isBallotCreated
      ? `Successfully created ballot with id ${newBallotDetail.id} and name ${newBallotDetail.name} !!`
      : 'Something went wrong see console for more info!!';
    const alert = (
      <Alert variant={alertClass} className='mt-2'>
        {alertMessage}
      </Alert>
    );

    this.setState({
      ballotsDetail,
      ballotPath,
      isCreating: false,
      showAlert: true,
      alert,
      shouldReset: true,
    });
  };

  render() {
    const { web3, contract, contractAddress, admin } = this.props;
    const {
      ballotsDetail,
      ballotPath,
      isCreating,
      showAlert,
      alert,
      shouldReset,
      ballotName,
      choices,
      timeLimit,
      timeLimitType,
    } = this.state;

    return (
      <Router>
        <Navigation ballotsDetail={ballotsDetail} />
        <Switch>
          <Route
            path='/'
            exact
            component={() => (
              <Home
                admin={admin}
                contractAddress={contractAddress}
                ballotsDetail={ballotsDetail}
              />
            )}
          />
          <Route
            path='/create'
            exact
            component={() => (
              <Create
                isCreating={isCreating}
                showAlert={showAlert}
                alert={alert}
                ballotName={ballotName}
                choices={choices}
                timeLimit={timeLimit}
                timeLimitType={timeLimitType}
                createBallot={this.createBallot}
              />
            )}
          />
          <Route
            path='/ballots'
            exact
            component={() => (
              <Ballots
                shouldReset={shouldReset}
                ballotsDetail={ballotsDetail}
              />
            )}
          />
          <Route
            // path="/ballot/:id"
            path={ballotPath}
            exact
            component={match => (
              <Ballot
                shouldReset={shouldReset}
                match={match}
                contract={contract}
                admin={admin}
                getAccounts={this.props.getAccounts}
                ballotsDetail={ballotsDetail}
              />
            )}
          />
          {/* <Route
            path='/results'
            exact
            component={() => (
              <Results
                shouldReset={shouldReset}
                ballotsDetail={ballotsDetail}
              />
            )}
          /> */}
          <Route component={Error} />
        </Switch>
      </Router>
    );
  }
}

export default App;
