import React, { PureComponent } from 'react';
import { Col, Card, Table, Button, Alert } from 'react-bootstrap';
import styles from '../css/walletDetils.module.css';

class Approve extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      transfers: [],
      isApproving: false,
      isApproveClick: false,
      isApproved: false,
    };
  }

  async componentDidMount() {
    await this.update();
  }

  // getSnapshotBeforeUpdate(prevProps, prevState) {
  //   console.log('getSnapshotBeforUpdate');
  //   if (prevProps.transfersLength != this.props.transfersLength) return true;
  //   return null;
  // }

  async componentDidUpdate(prevProps) {
    if (this.props.transfersLength !== prevProps.transfersLength)
      await this.update();
  }

  update = async () => {
    const { walletInstance, accounts } = this.props;
    const transfers = await walletInstance.methods.getAllTransfers().call();
    await this.getNewTransferArray(transfers, walletInstance, accounts);
  };

  getNewTransferArray = async (transfers, walletInstance, accounts) => {
    this.setState({ transfers: [] });
    await transfers.map(async (transfer) => {
      const isTrasferApprovedByCurrentUser = await walletInstance.methods
        .approversAppoveTransferMap(accounts[0], transfer[0])
        .call();
      const newTransferArray = {
        id: transfer[0],
        amount: transfer[1],
        from: transfer[2],
        to: transfer[3],
        noOfApprovals: transfer[4],
        sent: transfer[5],
        isTrasferApprovedByCurrentUser: isTrasferApprovedByCurrentUser,
      };
      this.setState({ transfers: [...this.state.transfers, newTransferArray] });
    });
  };

  arrroveTransfer = async (transferId) => {
    const { walletInstance, accounts } = this.props;
    await walletInstance.methods
      .approveTransfer(transferId)
      .send({ from: accounts[0] });
    const transfers = await walletInstance.methods.getAllTransfers().call();
    await this.getNewTransferArray(transfers, walletInstance, accounts);
    await this.props.updateWalletBalance();
  };

  approve = async (transferId) => {
    try {
      this.setState({ isApproveClick: false, isApproving: true });
      await this.arrroveTransfer(transferId);
      this.setState({ isApproved: true });
    } catch (error) {
      console.log(error);
      this.setState({ isApproved: false });
    } finally {
      this.setState({ isApproveClick: true, isApproving: false });
    }
  };

  renderRows = () => {
    const { isApproving, transfers } = this.state;
    return transfers.map((transfer) => {
      const titleMessage = transfer.isTrasferApprovedByCurrentUser
        ? 'You have already aprove this tranfer!'
        : 'Aprove this tranfer!';
      const color = transfer.sent ? '#155724' : 'black';
      return (
        <tr key={transfer.id} className='d-flex' style={{ color: `${color}` }}>
          <td className='col-1 font-weight-bold'>{transfer.id}</td>
          <td className='col-3'>{transfer.from}</td>
          <td className='col-3'>{transfer.to}</td>
          <td className='col-1'>{transfer.amount}</td>
          <td className='col-1'>{transfer.noOfApprovals}</td>
          <td className='col-2'>
            <Button
              variant='secondary'
              onClick={() => this.approve(transfer.id)}
              disabled={
                isApproving ||
                transfer.isTrasferApprovedByCurrentUser ||
                transfer.sent
              }
              title={titleMessage}
            >
              Approve
            </Button>
          </td>
          <td className='col-1'>{transfer.sent ? 'Yes' : 'No'}</td>
        </tr>
      );
    });
  };

  render() {
    const { isApproved, isApproveClick } = this.state;
    const alertClass = isApproved ? 'success' : 'danger';
    const alertMessage = isApproved
      ? `Successfully approved transfer!`
      : 'Something went wrong see console for more info!!';
    return (
      <Col sm='12' className='mt-5'>
        <Card>
          <Card.Header className={styles.cardHeading}>Approve</Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive className='mr-2'>
              <thead>
                <tr className='d-flex thead-dark'>
                  <th className='col-1'>Id</th>
                  <th className='col-3'>From</th>
                  <th className='col-3'>To</th>
                  <th className='col-1'>Amount</th>
                  <th className='col-1'>No of Approvals</th>
                  <th className='col-2'>Approve</th>
                  <th className='col-1'>Completed</th>
                </tr>
              </thead>
              <tbody>{this.renderRows()}</tbody>
            </Table>
            {isApproveClick ? (
              <Alert variant={alertClass} className='mt-2'>
                {alertMessage}
              </Alert>
            ) : null}
          </Card.Body>
        </Card>
      </Col>
    );
  }
}

export default Approve;
