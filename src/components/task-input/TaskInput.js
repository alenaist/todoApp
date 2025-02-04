import React from 'react';
import { SkillLevelBasic } from '../icons/LowLevel';
import { SkillLevelIntermediate } from '../icons/MediumLevel';
import { SkillLevelAdvanced } from '../icons/HighLevel';
import CustomDropdown from '../custom-dropdown/CustomDropdown';

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

        
        <CustomDropdown selectedImportance={selectedImportance} setSelectedImportance={setSelectedImportance} />
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