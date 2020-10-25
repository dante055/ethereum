import React, { Component } from 'react';
import {
  Form,
  FormControl,
  Button,
  OverlayTrigger,
  Popover,
  ListGroup,
  Dropdown,
  ButtonGroup,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Search extends Component {
  state = {
    searchId: '',
    searchName: '',
    searchBy: 'searchId',
    filteredIds: [],
  };

  handelChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  hadelInput = e => {
    if (e.key === 'Enter') e.preventDefault();
  };

  popover = () => {
    const { ballotsDetail } = this.props;
    const { searchName } = this.state;

    const filteredIds = ballotsDetail.filter(ballot => {
      if (ballot.name === searchName) {
        return ballot;
      }
    });
    this.setState({ filteredIds });
  };

  reset = () => {
    this.setState({
      searchId: '',
      searchName: '',
      filteredIds: [],
    });
  };

  render() {
    const { searchId, searchName, searchBy, filteredIds } = this.state;

    const searchValue = searchBy === 'searchId' ? searchId : searchName;
    const placeholder =
      searchBy === 'searchId'
        ? 'Search ballot with id'
        : 'Search ballot with name';

    const popover = (
      <Popover id='popover-basic'>
        <Popover.Title as='h3'>Search Result</Popover.Title>
        {/* <Popover.Content> */}
        <ListGroup variant='flush'>
          {filteredIds.length ? (
            filteredIds.map(ballot => (
              <Link
                key={ballot.ballotId}
                to={`/ballot/${ballot.ballotId}`}
                onClick={this.reset}
              >
                <ListGroup.Item className='text-secondary'>
                  {ballot.name} (id: {ballot.ballotId})
                </ListGroup.Item>
              </Link>
            ))
          ) : (
            <ListGroup.Item className='text-secondary'>
              No ballot with this name
            </ListGroup.Item>
          )}
        </ListGroup>
        {/* </Popover.Content> */}
      </Popover>
    );

    return (
      <React.Fragment>
        <Form inline>
          <FormControl
            type='text'
            placeholder={placeholder}
            className='mr-sm-2'
            name={searchBy}
            value={searchValue}
            onChange={this.handelChange}
            onKeyDown={this.hadelInput}
          />

          <Dropdown as={ButtonGroup}>
            {searchBy === 'searchId' ? (
              <Link to={`/ballot/${searchId}`}>
                <Button variant='outline-info'>Search with id</Button>
              </Link>
            ) : (
              <OverlayTrigger
                trigger='focus'
                placement='bottom'
                overlay={popover}
              >
                <Button variant='outline-info' onMouseEnter={this.popover}>
                  Search with name
                </Button>
              </OverlayTrigger>
            )}
            
            <Dropdown.Toggle
              split
              variant='outline-info'
              id='dropdown-split-basic'
            />
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => this.setState({ searchBy: 'searchId' })}
              >
                Search By Id
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => this.setState({ searchBy: 'searchName' })}
              >
                Search By Name
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Form>
      </React.Fragment>
    );
  }
}

export default Search;
