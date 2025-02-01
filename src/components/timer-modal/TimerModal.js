import React, { useState } from 'react';
import './TimerModal.scss'; // Add styles for the modal

const TimerModal = ({ isOpen, onConfirm, onCancel }) => {
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [importance, setImportance] = useState('medium'); // Default importance

  if (!isOpen) return null;

  const handleConfirm = () => {
    const durationInSeconds = parseInt(duration, 10) * 60; // Convert minutes to seconds
    if (taskName.trim() && !isNaN(durationInSeconds) && durationInSeconds > 0) {
      onConfirm(taskName, durationInSeconds, importance); // Pass importance to onConfirm
      setTaskName('');
      setDuration('');
      setImportance('medium'); // Reset importance to default
    } else {
      alert('Please enter a valid task name and duration.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add Timed Task</h3>
        <p class="info">Add a timer for your practice. Start the timer and focus. Gain experience in game and in life.</p>
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
        <div class="time-task-button-container">
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="duration-dropdown"
          >
            <option value="" disabled>Select duration</option>
            <option value="1">1 minute</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
          </select>
        </div> 
        <div className="modal-buttons">
          <button onClick={handleConfirm} className="confirm-button">
            Add task
          </button>
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;