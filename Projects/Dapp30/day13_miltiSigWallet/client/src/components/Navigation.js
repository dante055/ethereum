import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Navbar,
  Nav,
  Form,
  FormControl,
  Button,
} from 'react-bootstrap';

export class Navigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchId: '',
    };
  }

  handelChange = e => {
    this.setState({ searchId: e.target.value });
  };

  hadelInput = e => {
    if (e.key === 'Enter') e.preventDefault();
  };

  // handelClick = () => {
  //   this.setState({ searchId: '' });
  // };
  render() {
    const { searchId } = this.state;
    // console.log(searchId);
    return (
      <Navbar bg='dark' variant='dark' sticky='top'>
        <Container>
          <Navbar.Brand>Logo</Navbar.Brand>
          <Nav className='ml-auto'>
            <Link className='nav-link' to='/'>
              Home
            </Link>
            <Link className='nav-link' to='/create'>
              Create Wallet
            </Link>
            <Link className='nav-link' to='/wallet'>
              Wallets
            </Link>
          </Nav>
          <Form inline>
            <FormControl
              type='text'
              placeholder='Search wallet with address'
              className='mr-sm-2'
              value={searchId}
              onChange={this.handelChange}
              onKeyDown={this.hadelInput}
            />
            <Link to={`/wallet/${searchId}`}>
              <Button variant='outline-info' onClick={this.handelClick}>
                Search
              </Button>
            </Link>
          </Form>
        </Container>
      </Navbar>
    );
  }
}

export default Navigation;
