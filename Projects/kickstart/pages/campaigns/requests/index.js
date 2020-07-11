import React, { Component } from 'react';
import { Button, Table, Message } from 'semantic-ui-react';
import { Link } from '../../../routes';
import Layout from '../../../components/Layout';
import RequestRow from '../../../components/RequestRow';
import campaignInstance from '../../../ethereum/campaign';

class RequestIndex extends Component {
  state = {
    errorMessage: ''
  };

  static async getInitialProps(props) {
    const { address } = props.query;
    const campaign = await campaignInstance(address);
    const approversCount = await campaign.methods.approversCount().call();
    const requestsCount = await campaign.methods.getRequestsCount().call();

    const requests = await Promise.all(
      Array(parseInt(requestsCount))
        .fill()
        .map((element, index) => {
          return campaign.methods.requests(index).call();
        })
    );

    return { address, requests, requestsCount, approversCount };
    // return {
    //   address: props.query.address
    // };
  }

  onErrorChange = errorMessage => {
    this.setState({ errorMessage });
  };

  renderRow() {
    return this.props.requests.map((request, index) => {
      return (
        <RequestRow
          key={index}
          id={index}
          request={request}
          address={this.props.address}
          approversCount={this.props.approversCount}
          onErrorChange={this.onErrorChange}
        />
      );
    });
  }

  render() {
    const { Header, Row, HeaderCell, Body } = Table;
    return (
      <Layout>
        <h1>View Request </h1>
        <Link route={`/campaigns/${this.props.address}/requests/new`}>
          <a>
            <Button primary floated="right" style={{ marginBottom: 10 }}>
              Add Request
            </Button>
          </a>
        </Link>
        <Table>
          <Header>
            <Row>
              <HeaderCell>ID</HeaderCell>
              <HeaderCell>Description</HeaderCell>
              <HeaderCell>Amount(in ether)</HeaderCell>
              <HeaderCell>Recipient</HeaderCell>
              <HeaderCell>Approval Count</HeaderCell>
              <HeaderCell>Approve</HeaderCell>
              <HeaderCell>Finalize</HeaderCell>
            </Row>
          </Header>
          <Body>{this.renderRow()}</Body>
        </Table>
        <div>
          <h3>Found {this.props.requestsCount} requests.</h3>
        </div>
        {this.state.errorMessage ? (
          <Message
            error
            header="Oops, something went wrong!"
            content={this.state.errorMessage}
            style={{ overflowWrap: 'break-word' }}
          />
        ) : null}
      </Layout>
    );
  }
}

export default RequestIndex;
