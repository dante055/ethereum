import React, { useState } from 'react';
import { Button, Form, Card } from 'semantic-ui-react';

const NewTask = ({ createTask }) => {
  const [task, setTask] = useState(undefined);
  function submit(e) {
    e.preventDefault();
    createTask(task);
  }

  function updateTask(e, field) {
    const value = e.target.value;
    setTask({ ...task, [field]: value });
  }

  return (
    <div>
      <Card.Group itemsPerRow={1} centered className="cardPadding">
        <Card fluid color="black">
          <Card.Content>
            <Card.Header content="Create Tasks" />
            <Card.Description>
              <Form onSubmit={submit}>
                <Form.Field>
                  <label>Content</label>
                  <input
                    placeholder="Content"
                    onChange={(e) => updateTask(e, 'content')}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Author</label>
                  <input
                    placeholder="Author"
                    onChange={(e) => updateTask(e, 'author')}
                  />
                </Form.Field>
                <Button type="submit" color="yellow">
                  Submit
                </Button>
              </Form>
            </Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </div>
  );
};

export default NewTask;
