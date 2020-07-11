import React, { Component } from 'react';
import { Form, Input, Message, Button, Dropdown } from 'semantic-ui-react';
import campaignInstance from '../ethereum/campaign';
import web3 from '../ethereum/web3';
import { Router } from '../routes';

class ContributeFrom extends Component {
  state = {
    paymentOption: 'ether',
    value: '',
    errorMessage: '',
    loading: false
  };

  onSubmit = async event => {
    event.preventDefault();

    const campaign = campaignInstance(this.props.address);

    this.setState({ loading: true, errorMessage: '' });

    try {
      let value = this.state.value;
      if (this.state.paymentOption == 'ether') {
        value = web3.utils.toWei(this.state.value, 'ether');
      }
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: value
      });

      Router.replaceRoute(`/campaigns/${this.props.address}`);
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  renderPaymentMethods() {
    const paymentOptions = [
      {
        key: 'ether',
        text: 'ether',
        value: 'ether'
      },
      {
        key: 'wei',
        text: 'wei',
        value: 'wei'
      }
    ];
    return (
      <Dropdown
        defaultValue="ether"
        options={paymentOptions}
        onChange={event =>
          this.setState({ paymentOption: event.target.textContent })
        }
      />
    );
  }

  render() {
    return (
      <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
        <Form.Field>
          <label>Amount to contribute</label>
          <Input
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })}
            label={this.renderPaymentMethods()}
            labelPosition="right"
          />
        </Form.Field>

        <Message
          error
          header="Oops, something went wrong!"
          content={this.state.errorMessage}
        />

        <Button primary loading={this.state.loading}>
          Contribute!
        </Button>
      </Form>
    );
  }
}

export default ContributeFrom;
