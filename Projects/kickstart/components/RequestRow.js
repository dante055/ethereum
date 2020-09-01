import React, { Component } from 'react';
import { Table, Button, Message } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import campaignInstance from '../ethereum/campaign';
import { Router } from '../routes';

class RequestRow extends Component {
  state = {
    loading: false,
    loadingFinalize: false
  };

  onApprove = async () => {
    const accounts = await web3.eth.getAccounts();
    const campaign = await campaignInstance(this.props.address);

    this.setState({ loading: true });
    this.props.onErrorChange('');

    try {
      await campaign.methods
        .approveRequest(this.props.id)
        .send({ from: accounts[0] });

      Router.replaceRoute(`/campaigns/${this.props.address}/requests`);
    } catch (err) {
      this.props.onErrorChange(err.message);
    }

    this.setState({ loading: false });
  };

  onFinalize = async () => {
    const accounts = await web3.eth.getAccounts();
    const campaign = await campaignInstance(this.props.address);

    this.setState({ loadingFinalize: true });
    this.props.onErrorChange('');

    try {
      await campaign.methods
        .finalizeRequest(this.props.id)
        .send({ from: accounts[0] });

      Router.replaceRoute(`/campaigns/${this.props.address}/requests`);
    } catch (err) {
      this.props.onErrorChange(err.message);
    }

    this.setState({ loadingFinalize: false });
  };

  render() {
    const { Row, Cell } = Table;
    const { id, request, approversCount } = this.props;
    const readyToFinalize = request.approvalCount > approversCount / 2;

    return (
      <Row
        disabled={request.complete}
        positive={readyToFinalize && !request.complete}
      >
        <Cell>{id}</Cell>
        <Cell>{request.description}</Cell>
        <Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>
        <Cell>{request.recipient}</Cell>
        <Cell>
          {request.approvalCount}/{approversCount}
        </Cell>
        <Cell>
          {request.complete ? null : (
            <Button
              color="green"
              basic
              loading={this.state.loading}
              onClick={this.onApprove}
            >
              Approve
            </Button>
          )}
        </Cell>
        <Cell>
          {request.complete ? null : (
            <Button
              color="teal"
              basic
              loading={this.state.loadingFinalize}
              onClick={this.onFinalize}
            >
              Finalize
            </Button>
          )}
        </Cell>
      </Row>
    );
  }
}

export default RequestRow;
