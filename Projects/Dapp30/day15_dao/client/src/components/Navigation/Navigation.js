import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <div>
      <Navbar bg='dark' variant='dark' sticky='top'>
        <Container>
          <Navbar.Brand>Logo</Navbar.Brand>
          <Nav className='menu ml-auto'>
            <Link className='nav-link' to='/'>
              Home
            </Link>
            <Link className='nav-link' to='/create'>
              Create Proposal
            </Link>
            <Link className='nav-link' to='/proposals'>
              Proposals
            </Link>
          </Nav>
          {/* <Search ballotsDetail={this.props.ballotsDetail} /> */}
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;
