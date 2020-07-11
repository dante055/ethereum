import React from 'react';
import { formatDate } from './utils.js';
import { Checkbox, Header, Table, Card } from 'semantic-ui-react';

const TaskList = ({ tasks, toggleDone }) => {
  // var tasks = taskDetails;
  const renderTask = (task) => {
    return task.done ? (
      <React.Fragment key={task.id}>
        <Table.Row positive>
          <Table.Cell>
            <Header as="h4" textAlign="center">
              {task.id}
            </Header>
          </Table.Cell>
          <Table.Cell>{formatDate(task.date)}</Table.Cell>
          <Table.Cell>{task.content}</Table.Cell>
          <Table.Cell>{task.author}</Table.Cell>
          <Table.Cell>
            <Checkbox defaultChecked onChange={() => toggleDone(task.id)} />
          </Table.Cell>
          <Table.Cell>{formatDate(task.completedDate)}</Table.Cell>
        </Table.Row>
      </React.Fragment>
    ) : (
      <React.Fragment key={task.id}>
        <Table.Row negative>
          <Table.Cell>
            <Header as="h4" textAlign="center">
              {task.id}
            </Header>
          </Table.Cell>
          <Table.Cell>{formatDate(task.date)}</Table.Cell>
          <Table.Cell>{task.content}</Table.Cell>
          <Table.Cell>{task.author}</Table.Cell>
          <Table.Cell>
            <Checkbox onChange={() => toggleDone(task.id)} />
          </Table.Cell>
          <Table.Cell>-</Table.Cell>
        </Table.Row>
      </React.Fragment>
    );
  };

  return (
    <div>
      <Card.Group itemsPerRow={1} centered className="cardPadding">
        <Card fluid color="black">
          <Card.Content>
            <Card.Header content="Tasks" />
            <Card.Description>
              <Table celled padded>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Id</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Content</Table.HeaderCell>
                    <Table.HeaderCell>Author</Table.HeaderCell>
                    <Table.HeaderCell>Done</Table.HeaderCell>
                    <Table.HeaderCell>Date Completed</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {tasks.map((task) => {
                    return renderTask(task);
                  })}
                </Table.Body>
              </Table>
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </div>
  );
};

export default TaskList;
