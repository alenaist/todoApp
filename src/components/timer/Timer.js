import React, { useState, useEffect } from 'react';

const Timer = ({ duration, timeRemaining: initialTimeRemaining, onComplete, onStart, onPause }) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining || duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeRemaining > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      onComplete(); // Trigger completion when timer reaches 0
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, isPaused, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    onStart(); // Notify parent that the timer has started
  };

  const pauseTimer = () => {
    setIsPaused(true);
    onPause(timeRemaining); // Pass the remaining time to the parent
  };

  const resumeTimer = () => {
    setIsPaused(false);
    onStart(); // Notify parent that the timer has resumed
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer">
       <div className="time-display">{formatTime(timeRemaining)}</div>
      {!isRunning && timeRemaining > 0 && (
        <button onClick={startTimer} className="start-timer-button">
          Start Timer
        </button>
      )}
      {isRunning && !isPaused && (
        <button onClick={pauseTimer} className="pause-timer-button">
          Pause
        </button>
      )}
      {isRunning && isPaused && (
        <button onClick={resumeTimer} className="resume-timer-button">
          Resume
        </button>
      )}
     
    </div>
  );
};

export default Timer;