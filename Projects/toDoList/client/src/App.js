import React, { Component } from 'react';
import { getWeb3, getToDoList } from './utils.js';
import './Header';
import './App.css';
import Header from './Header.js';
import Footer from './Footer.js';
import NewTask from './NewTask.js';
import TaskList from './TaskList.js';
import { Card } from 'semantic-ui-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: undefined,
      toDoList: undefined,
      accounts: [],
      address: null,
      totalTasks: 0,
      taskIds: [],
      tasks: [],
    };
    this.getweb3 = this.getweb3.bind(this);
    this.getToDoList = this.getToDoList.bind(this);
    this.getTotalTasks = this.getTotalTasks.bind(this);
    this.getTaskIds = this.getTaskIds.bind(this);
    this.getTasks = this.getTasks.bind(this);
    this.createTask = this.createTask.bind(this);
    this.toggleDone = this.toggleDone.bind(this);
  }

  async getweb3() {
    const web3 = await getWeb3();
    return web3;
  }

  async getToDoList(web3) {
    const toDoList = await getToDoList(web3);
    return toDoList;
  }

  async getTotalTasks(toDoList) {
    // const { toDoList } = this.props;
    return await toDoList.methods.totalTasks().call();
  }

  async getTaskIds(toDoList, totalTasks) {
    // const { toDoList, totalTasks } = this.props;
    var task = [];
    for (var i = 0; i < totalTasks; i++) {
      var taskDetails = await toDoList.methods.taskDetails(i).call();
      if (taskDetails.taskExist) {
        task.push(i);
      }
    }
    return task;
  }

  getTasks(toDoList, taskIds) {
    let taskInfo = [];
    toDoList.events
      .TaskInfo({ filter: { id: taskIds }, fromBlock: 0 })
      .on('data', async function (event) {
        var taskDetails = await toDoList.methods
          .taskDetails(event.returnValues.id)
          .call();
        taskInfo.push({
          id: event.returnValues.id,
          date: event.returnValues.date,
          content: event.returnValues.content,
          authorFilter: event.returnValues.authorFilter,
          author: event.returnValues.author,
          done: taskDetails.done,
          completedDate: taskDetails.completedDate,
        });
      });
    // This is a timing issue.
    //The first time you ask for the length it is indeed 0,
    //but when you inspect the object a few seconds later with Chrome Dev Tools
    // you are inspecting the live object which has now been filled.
    // so use settimeout function

    return taskInfo;
  }

  async createTask(task) {
    const { toDoList, web3 } = this.state;
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts });
    const receipt = await toDoList.methods
      .createTask(task.content, task.author)
      .send({
        from: this.state.accounts[0],
        gas: 1000000,
      });
    console.log(receipt);
    const totalTasks = await this.getTotalTasks(toDoList);
    const taskIds = await this.getTaskIds(toDoList, totalTasks);
    const tasks = await this.getTasks(toDoList, taskIds);
    setTimeout(() => {
      this.setState({ tasks });
    }, 500);
    this.setState({
      totalTasks,
      taskIds,
    });
  }

  async toggleDone(id) {
    const { toDoList, taskIds, web3 } = this.state;
    const accounts = await web3.eth.getAccounts();
    this.setState({ accounts });
    const receipt = await toDoList.methods.toggleCheckBox(id).send({
      from: this.state.accounts[0],
      gas: 1000000,
    });
    console.log(receipt);
    const tasks = await this.getTasks(toDoList, taskIds);
    setTimeout(() => {
      this.setState({ tasks });
    }, 1000);
  }

  async componentDidMount() {
    const web3 = await this.getweb3();
    const toDoList = await this.getToDoList(web3);
    const accounts = await web3.eth.getAccounts();
    const totalTasks = await this.getTotalTasks(toDoList);
    const taskIds = await this.getTaskIds(toDoList, totalTasks);
    const tasks = await this.getTasks(toDoList, taskIds);
    // You are loosing context.
    // Use arrow function as simple way to preserve proper execution context:
    // that anonymous function will have context window inside
    // or use this method setTimeout(() => {}.bind(this), 1000);
    setTimeout(() => {
      this.setState({ tasks });
    }, 1000);

    this.setState({
      web3,
      toDoList,
      accounts,
      address: toDoList._address,
      totalTasks,
      taskIds,
    });
  }

  render() {
    const { accounts, address, tasks } = this.state;
    if (accounts.length === 0) return <div>Loading...</div>;
    return (
      <div>
        <Header address={address} />
        <NewTask createTask={this.createTask} />
        {tasks.length === 0 ? (
          <Card.Group itemsPerRow={1} centered className="cardPadding">
            <Card fluid color="black">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3>No tasks present</h3>
              </div>
            </Card>
          </Card.Group>
        ) : (
          <TaskList tasks={tasks} toggleDone={this.toggleDone} />
        )}
        <Footer />
      </div>
    );
  }
}

export default App;
