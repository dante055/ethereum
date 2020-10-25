import React, { Component } from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import styles from '../css/ballotDetails.module.css';

class BallotDetails extends Component {
  listItem = (label, value) => {
    return (
      <ListGroup.Item>
        <Row>
          <Col className={styles.colLabel}>{label}</Col>
          <Col className={styles.colDetail} sm='12'>
            {label === 'Choices' ? (
              <React.Fragment>
                <Row className='font-weight-bold'>
                  <Col xs='3'>ChoiceId</Col>
                  <Col>ChoiceName</Col>
                </Row>
                {this.listChoices(value)}
              </React.Fragment>
            ) : (
              value
            )}
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  listChoices = choices => {
    return choices.map(choice => {
      return (
        <Row key={choice._id}>
          <Col xs='3'>{choice._id}</Col>
          <Col>{choice._name}</Col>
        </Row>
      );
      //   return { choiceId: choice._id, choiceName: choice._name };
    });
  };

  timeLimitMsg = timeLimit => {
    let timeLimitMsg;
    if (timeLimit < 3600) {
      timeLimitMsg = `${timeLimit} seconds`;
    } else if (timeLimit >= 3600 && timeLimit < 86400) {
      timeLimitMsg = `${Math.trunc(timeLimit / 3600)} hours : ${Math.trunc(
        timeLimit % 3600
      )} seconds`;
    } else if (timeLimit >= 86400 && timeLimit < 604800) {
      timeLimitMsg = `${Math.trunc(timeLimit / 86400)} Days : ${Math.trunc(
        (timeLimit % 86400) / 3600
      )} hours : ${Math.trunc((timeLimit % 86400) % 3600)} seconds`;
    } else if (timeLimit >= 604800) {
      timeLimitMsg = `${Math.trunc(timeLimit / 604800)} weeks : ${Math.trunc(
        (timeLimit % 604800) / 86400
      )} days : ${Math.trunc(
        ((timeLimit % 604800) % 86400) / 3600
      )} hours : ${Math.trunc(((timeLimit % 604800) % 86400) % 3600)} seconds`;
    }
    return timeLimitMsg;
  };

  timeConverter = UNIX_timestamp => {
    let a = new Date(UNIX_timestamp * 1000);
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let year = a.getFullYear();
    let month = months[a.getMonth()];
    let date = a.getDate();
    let hour = a.getHours();
    let min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
    let sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();

    var time =
      date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
  };

  render() {
    const { ballotDetails } = this.props;
    let ballotId,
      ballotName,
      choices = [],
      voters,
      hasVotingBegin,
      timeLimit,
      timeLimitMsg,
      totalVatesLogged,
      endTime;

    if (ballotDetails.ballot) {
      ballotId = ballotDetails.ballot.ballotId;
      ballotName = ballotDetails.ballot.name;
      choices = ballotDetails.choices;
      voters = ballotDetails.voters.join(', ');
      hasVotingBegin = ballotDetails.ballot.hasVotingBegin;
      timeLimit = ballotDetails.ballot.timeLimit;
      timeLimitMsg = this.timeLimitMsg(timeLimit);

      if (hasVotingBegin) {
        totalVatesLogged = ballotDetails.ballot.totalVatesLogged;
        endTime = this.timeConverter(ballotDetails.ballot.endTime);
      } else {
        totalVatesLogged = "The voting hasn't strated yet!";
        endTime = "The voting hasn't strated yet!";
      }
    }

    return (
      <Card style={{ borderRadius: '0' }} className='mb-3'>
        <Card.Header>Ballot Details</Card.Header>
        {/* <Card.Body> */}
        <ListGroup variant='flush'>
          {this.listItem('Ballot Id', ballotId)}
          {this.listItem('Ballot Name', ballotName)}
          {this.listItem('Choices', choices)}
          {this.listItem('Voters', voters)}
          {this.listItem('Time Limit', timeLimitMsg)}
          {this.listItem('Total Votes Logged', totalVatesLogged)}
          {this.listItem('End Time', endTime)}
        </ListGroup>
        {/* </Card.Body> */}
      </Card>
    );
  }
}

export default BallotDetails;
