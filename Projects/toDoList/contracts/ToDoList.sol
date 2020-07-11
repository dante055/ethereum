pragma solidity ^0.6.0;

contract ToDoList {
    struct task {
        bool taskExist;
        bool done;
        uint256 completedDate;
    }

    uint256 lastTaskId;
    mapping(uint256 => task) public taskDetails;
    uint256 public totalTasks;
    uint256 public deletedTasks;

    event TaskInfo(
        uint256 indexed id,
        uint256 date,
        string content,
        string author,
        string indexed authorFilter
    );

    event TaskStatusToggled(uint256 id, bool done, uint256 date);

    // (id, date, content, author, done);
    // remember if you are indexing string then it is stored in the form of hash or bytes bytes(_author);

    function createTask(string calldata _content, string calldata _author)
        external
    {
        emit TaskInfo(lastTaskId, now, _content, _author, _author);
        taskDetails[lastTaskId].taskExist = true;
        taskDetails[lastTaskId].done = false;
        lastTaskId++;
        totalTasks++;
    }

    function deleteTask(uint256 _id) external {
        taskDetails[_id].taskExist = false;
        deletedTasks++;
    }

    function toggleCheckBox(uint256 _id) external {
        taskDetails[_id].done = !taskDetails[_id].done;
        taskDetails[_id].completedDate = taskDetails[_id].done ? now : 0;
        emit TaskStatusToggled(
            _id,
            taskDetails[_id].done,
            taskDetails[_id].completedDate
        );
    }
}
