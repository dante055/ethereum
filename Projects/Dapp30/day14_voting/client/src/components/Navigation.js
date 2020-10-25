import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/Nav.css';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Search from './Search';

class Navigation extends Component {
  render() {
    return (
      <Navbar bg='dark' variant='dark' sticky='top'>
        <Container>
          <Navbar.Brand>Logo</Navbar.Brand>
          <Nav className='menu ml-auto'>
            <Link className='nav-link' to='/'>
              Home
            </Link>
            <Link className='nav-link' to='/create'>
              Create Ballot
            </Link>
            <Link className='nav-link' to='/ballots'>
              Ballots
            </Link>
            {/* <Link className='nav-link' to='/results'>
              Results
            </Link> */}
          </Nav>
          <Search ballotsDetail={this.props.ballotsDetail} />
        </Container>
      </Navbar>
    );
  }
}

export default Navigation;
