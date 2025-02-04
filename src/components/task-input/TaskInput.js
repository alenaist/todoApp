import React from 'react';

const TaskInput = ({
  newTask,
  setNewTask,
  selectedImportance,
  setSelectedImportance,
  addTask,
  setIsTimerModalOpen,
  isTimerRunning,
}) => {
  return (
    <div className="task-input">
      <div className="input-container">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isTimerRunning && newTask.trim()) {
              e.preventDefault();
              addTask();
            }
          }}
          placeholder="Que tenes que hacer?"
          disabled={isTimerRunning}
        />
        <select
          value={selectedImportance}
          onChange={(e) => setSelectedImportance(e.target.value)}
          disabled={isTimerRunning}
        >
          <option value="low">Low Importance</option>
          <option value="medium">Medium Importance</option>
          <option value="high">High Importance</option>
        </select>
      </div>
      <div className="button-container">
        <button
          onClick={addTask}
          disabled={isTimerRunning || !newTask.trim()}
          className={isTimerRunning || !newTask.trim() ? 'disabled' : ''}
        >
          Add Task
        </button>
        <button
          onClick={() => setIsTimerModalOpen(true)}
          disabled={isTimerRunning}
          className={`add-button ${isTimerRunning ? 'disabled' : ''}`}
        >
          Add Timed Task
        </button>
      </div>
    </div>
  );
};

export default TaskInput;