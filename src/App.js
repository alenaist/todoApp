import React, { useState, useEffect, useRef } from 'react';
import './App.scss';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import ConfirmationModal from './components/confirmation-modal/ConfirmationModal';
import Timer from './components/timer/Timer';
import TimerModal from './components/timer-modal/TimerModal';
import Login from './components/login/Login';
import { auth, googleProvider, signInWithPopup } from './api/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './api/firebase';
import { Eye } from './components/icons/OpenEyeIcon';
import { EyeClosed } from './components/icons/ClosedEyeIcon';
import { Checkmark } from './components/icons/CheckIcon';
import { Undo1 } from './components/icons/Undo';
import TaskInput from './components/task-input/TaskInput';
import { callDeepSeek } from './api/deepseekCall';
import axios from 'axios';
import AnimatedAvatar from './components/animatedAvatar/AnimatedAvatar';

import mercadopago from 'mercadopago';

// Configure the library
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});



function App() {
  const [todo, setTodo] = useState([]);
  const [completed, setCompleted] = useState([]);

  const [completedHistory, setCompletedHistory] = useState([]);

  const [newTask, setNewTask] = useState('');
  const [selectedImportance, setSelectedImportance] = useState('low');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [taskToRemove, setTaskToRemove] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [runningTaskId, setRunningTaskId] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [avatarIsOpen, setAvatarIsOpen] = useState(false);
  const isFirstRender = useRef(true);
  const [isCompletedVisible, setIsCompletedVisible] = useState(false);
  const isInitialLoad = useRef(true);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const loadUserData = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userRef);
  
      console.log('Document data:', docSnap.data());
  
      if (!docSnap.exists()) {
        console.log('No existing document - creating new one');
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          level: 1,
          progress: 0,
          tasks: [],
          completedTasks: [],
          completedHistory: [], // Initialize completedHistory
        });
      } else {
        const data = docSnap.data();
        if (data) {
          console.log('Setting state with existing data:', data);
          setTodo(data.tasks || []);
          setCompleted(data.completedTasks || []);
          setCompletedHistory(data.completedHistory || []); // Load completedHistory
          setProgress(data.progress || 0);
          setUserLevel(data.level || 1);
        } else {
          console.error('Document exists but no data found');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error in loadUserData:', error);
      return false;
    }
  };

  const saveUserData = async (user) => {
    try {
      const userRef = doc(firestore, 'users', user.uid);
  
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        level: userLevel,
        progress: progress,
        tasks: todo,
        completedTasks: completed,
        completedHistory: completedHistory,
      }, { merge: true });
  
      console.log('Firestore updated successfully with data:', {
        tasks: todo,  
        completedTasks: completed,
        completedHistory: completedHistory,
        level: userLevel,
        progress: progress,
      });
      return true;
    } catch (error) {
      console.error('Error in saveUserData:', error);
      return false;
    }
  };


  // Google Sign-In Logic
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);
      await loadUserData(user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  // Logout Logic
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setDataLoaded(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Improved auth state change handler
  useEffect(() => {
    let mounted = true;
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!mounted) return;
  
      if (user) {
        setUser(user);
        setIsLoading(true);
        try {
          const success = await loadUserData(user); // Load user data on auth state change
          if (success && mounted) {
            setDataLoaded(true);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      } else {
        setUser(null);
        setDataLoaded(false);
        setIsLoading(false);
      }
    });

   // Example usage




    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

 
useEffect(() => {
  if (!user || !dataLoaded) {
    return;
  }

  if (isInitialLoad.current) {
    isInitialLoad.current = false;
    return;
  }

  const timeoutId = setTimeout(() => {
    saveUserData(user).catch((error) => {
      console.error("Error saving user data:", error);
    });
  }, 1000);

  return () => clearTimeout(timeoutId);
}, [todo, completed, progress, userLevel, user, dataLoaded]);


  // Update progress and handle level-up
  const updateProgress = (newProgress) => {
    // Convert current total progress (level * 100 + progress)
    const currentTotalProgress = (userLevel - 1) * 100 + progress;
    const updatedTotalProgress = currentTotalProgress + (newProgress - progress);

    // Handle negative progress
    if (updatedTotalProgress < 0) {
      setProgress(0);
      setUserLevel(1);
      return;
    }

    // Calculate new level and remaining progress
    const MAX_LEVEL = 999;
    const newLevel = Math.min(Math.floor(updatedTotalProgress / 100) + 1, MAX_LEVEL);
    const remainingProgress = updatedTotalProgress % 100;

    // Update state
    setUserLevel(newLevel);
    setProgress(remainingProgress);

    console.log(`Total Progress: ${updatedTotalProgress}, New Level: ${newLevel}, Remaining Progress: ${remainingProgress}`);
  };

  // Add Task Logic
  const  addTask = async () => {
    if (!isTimerRunning && newTask.trim() !== '') {
      const newTaskObj = {
        id: uuidv4(),
        text: newTask,
        type: 'regular',
        importance: selectedImportance,
        completed: false,
      };
      setTodo([newTaskObj, ...todo]);
      setNewTask('');
    }

   
      const response = await callDeepSeek({
        role: "user",
        content: `User added a task called: ${newTask}`
      });
    setResults(response);
    console.log(results)


  };

  // Add Timed Task Logic
  const addTimedTask = async (taskName, duration, importance) => {
    if (!isTimerRunning) {
      const newTaskObj = {
        id: uuidv4(),
        text: taskName,
        type: 'timed',
        importance: 'high',
        completed: false,
        duration,
        timeRemaining: duration,
        timerRunning: false,
      };
      setTodo([newTaskObj, ...todo]);
    }

    const response = await callDeepSeek({
      role: "user",
      content: `User added a timed task called: ${taskName}`
    });
  setResults(response);

  
  };

  // Handle Remove Task Click
  const handleRemoveClick = (id) => {
    if (!isTimerRunning) {
      setTaskToRemove(id);
      setIsConfirmationModalOpen(true);
    }
  };

  // Remove Task Logic
  const removeTask = (id) => {
    if (!isTimerRunning) {
      const updatedTodo = todo.filter(task => task.id !== id);
      const updatedCompleted = completed.filter(task => task.id !== id);
      setTodo(updatedTodo);
      setCompleted(updatedCompleted);
      setIsConfirmationModalOpen(false);
    }
  };

  // Toggle Task Completion Logic
  const toggleTaskCompletion = async (id) => {
    if (!isTimerRunning) {
      const task = todo.find(task => task.id === id) || completed.find(task => task.id === id);
      if (task && task.type !== 'timed') {
        const expPoints = {
          low: 5,
          medium: 10,
          high: 20,
        }[task.importance];
  
        if (task.completed) {
          // Undo completion
          setCompleted(completed.filter(task => task.id !== id));
          setTodo([{ ...task, completed: false }, ...todo]);
          setCompletedHistory((prevHistory) => prevHistory.filter((historyTask) => historyTask.id !== id));
          updateProgress(progress - expPoints);

          const response = await callDeepSeek({
            role: "user",
            content: `User did an undo of a finished task called: ${task.text}`
          });
          setResults(response);

        } else {
          // Mark as completed
          const completedTask = { ...task, completed: true, finishedDate: new Date().toISOString() };
          setTodo(todo.filter(task => task.id !== id));
          setCompleted([completedTask, ...completed]);
          setCompletedHistory((prevHistory) => [completedTask, ...prevHistory]);
          updateProgress(progress + expPoints);

          const response = await callDeepSeek({
            role: "user",
            content: `User completed a task called: ${task.text}`
          });
          setResults(response);

        
        }
      }
    }
  };

  // Handle Timer Completion Logic
  const handleTimerComplete = (id) => {
    const task = todo.find(task => task.id === id);
    if (task) {
      // Base exp points for high importance
      const baseExpPoints = 20; // High importance
  
      // Calculate additional exp based on duration (in minutes)
      const durationInMinutes = task.duration / 60; // Convert seconds to minutes
      const timeBonus = Math.floor(durationInMinutes * 0.8); // 0.8 exp per minute
  
      // Total exp is base exp + time bonus
      const totalExpPoints = baseExpPoints + timeBonus;
  
      console.log(`Task completed! Base EXP: ${baseExpPoints}, Time Bonus: ${timeBonus}, Total: ${totalExpPoints}`);
  
      const completedTask = { ...task, completed: true, finishedDate: new Date().toISOString() };
      const updatedTodo = todo.filter(task => task.id !== id);
      setTodo(updatedTodo);
      setCompleted([completedTask, ...completed]);
  
      // Add to completedHistory
      setCompletedHistory((prevHistory) => [completedTask, ...prevHistory]);
  
      updateProgress(progress + totalExpPoints);
      setIsTimerRunning(false);
      setRunningTaskId(null);
    }
  };

  function toggleBox() {
    const box = document.querySelector('.box');
    
    if (box.style.height === '0px' || !box.style.height) {
      // Expand to full content height
      box.style.height = 'auto';
      const fullHeight = box.scrollHeight + 'px';
      box.style.height = '0px';
      
      requestAnimationFrame(() => {
        box.style.height = fullHeight;
        setAvatarIsOpen(true);
      });
    } else {
      // Collapse
      box.style.height = '0px';
      setAvatarIsOpen(false);
    }
  }

  const deleteAllCompletedTasks = () => {
    if (!isTimerRunning) {
      setCompleted([]); // Clear the completed tasks array

    }
  };

  const onDragEnd = (result) => {
    if (isTimerRunning) return;
  
    const { source, destination } = result;
  
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
  
    // Find the task in either todo or completed lists
    const task = todo.find(task => task.id === result.draggableId) ||
      completed.find(task => task.id === result.draggableId);
  
    if (!task) {
      console.error('Task not found:', result.draggableId);
      return;
    }
  
    if (task.type === 'timed' && destination.droppableId === 'completed') {
      return;
    }
  
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'todo') {
        const reorderedTodo = Array.from(todo);
        const [movedTask] = reorderedTodo.splice(source.index, 1);
        reorderedTodo.splice(destination.index, 0, movedTask);
        setTodo(reorderedTodo);
      } else {
        const reorderedCompleted = Array.from(completed);
        const [movedTask] = reorderedCompleted.splice(source.index, 1);
        reorderedCompleted.splice(destination.index, 0, movedTask);
        setCompleted(reorderedCompleted);
      }
    } else {
      // Get the task again specifically for the source list
      const sourceTask = source.droppableId === 'todo'
        ? todo.find(t => t.id === result.draggableId)
        : completed.find(t => t.id === result.draggableId);
  
      if (!sourceTask) {
        console.error('Source task not found:', result.draggableId);
        return;
      }
  
      const expPoints = {
        low: 5,
        medium: 10,
        high: 20,
      }[sourceTask.importance] || 10; // Default to 10 if importance is undefined
  
      if (source.droppableId === 'todo' && destination.droppableId === 'completed') {
        const updatedTodo = Array.from(todo);
        const [movedTask] = updatedTodo.splice(source.index, 1);
        setTodo(updatedTodo);
  
        const completedTask = { ...movedTask, completed: true, finishedDate: new Date().toISOString() };
        const updatedCompleted = Array.from(completed);
        updatedCompleted.splice(destination.index, 0, completedTask);
        setCompleted(updatedCompleted);
  
        // Add to completedHistory
        setCompletedHistory((prevHistory) => [completedTask, ...prevHistory]);
  
        // Calculate new progress when completing
        const newProgress = progress + expPoints;
        updateProgress(newProgress);
      } else if (source.droppableId === 'completed' && destination.droppableId === 'todo') {
        const updatedCompleted = Array.from(completed);
        const [movedTask] = updatedCompleted.splice(source.index, 1);
        setCompleted(updatedCompleted);
  
        const updatedTodo = Array.from(todo);
        updatedTodo.splice(destination.index, 0, { ...movedTask, completed: false });
        setTodo(updatedTodo);
  
        // Remove from completedHistory
        setCompletedHistory((prevHistory) =>
          prevHistory.filter((historyTask) => historyTask.id !== movedTask.id)
        );
  
        // Calculate new progress when undoing
        const newProgress = progress - expPoints;
        updateProgress(newProgress);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        {user ? (
          <div className="two-column-layout">
            <div className='collapsable-container'>
            <button 
    className="collapsable-button" 
    onClick={toggleBox}
  >
    {avatarIsOpen ? <EyeClosed /> : <Eye />}
  </button>
              <div className="box">
              <div className="avatar-column">
              <div className="user-profile">
                <div className="avatar"> 

                  <AnimatedAvatar message={ results } />
                </div>

               
              </div>
            </div>
            

              </div>

              <div className="username">{user.displayName}</div>
                <div className="current-level">Level: {userLevel}</div>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }} />
                  <span className="progress-text">{progress}%</span>
                </div>

                <button className="completed-tasks-history-button">Completed task history</button>
                <button className="sign-out-button" onClick={signOut}>Sign Out</button>
            </div>



            
            <div className="todo-column">
              <h1><span className="todo-h1">TODO</span> <span className="list-h1">LIST:</span></h1>
              <p className="todo-info">Add your daily chores and learning. Complete them. Progress in life and in the game.</p>


              <TaskInput newTask={newTask} setNewTask={setNewTask} selectedImportance={selectedImportance} setSelectedImportance={setSelectedImportance} addTask={addTask} setIsTimerModalOpen={setIsTimerModalOpen} isTimerRunning={isTimerRunning}/>  
              

              <DragDropContext onDragEnd={onDragEnd}>
                <div className="task-lists">
                  <Droppable droppableId="todo">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="task-list">
                        <h3>TODOs:</h3>
                        <ul>
                          {todo.length > 0 ? (
                            todo.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isTimerRunning}>
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={isTimerRunning && task.id !== runningTaskId ? 'disabled' : ''}>

{task.type === 'timed' && !task.completed && (
                                      <Timer
                                        duration={task.duration}
                                        timeRemaining={task.timeRemaining}
                                        onComplete={() => handleTimerComplete(task.id)}
                                        onStart={() => {
                                          setIsTimerRunning(true);
                                          setRunningTaskId(task.id);
                                        }}
                                        onPause={(remainingTime) => {
                                          setIsTimerRunning(false);
                                          setRunningTaskId(null);
                                          const updatedTodo = todo.map((t) =>
                                            t.id === task.id ? { ...t, timeRemaining: remainingTime } : t
                                          );
                                          setTodo(updatedTodo);
                                        }}
                                      />
                                    )}


                                    <div className="item-task-container">
                                      <p className="item-task">{task.text}</p>
                                      {task.type !== 'timed' && <p className="item-task-level"> Importance: {task.importance}</p> }
                              
                                    </div>


                                   
                                    {task.type !== 'timed' && (
                                      <button onClick={() => toggleTaskCompletion(task.id)} disabled={isTimerRunning} className={`completed ${isTimerRunning ? 'disabled' : ''}`}>
                                        {task.completed ? <Undo1 /> : <Checkmark />}
                                      </button>
                                    )}
                                    <button onClick={() => handleRemoveClick(task.id)} disabled={isTimerRunning} className={`delete ${isTimerRunning ? 'disabled' : ''}`}>
                                      
                                    </button>
                                  </li>
                                )}
                              </Draggable>
                            ))
                          ) : (
                            <li className="no-tasks">No tasks at the moment</li>
                          )}
                        </ul>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <Droppable droppableId="completed">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="task-list">
                        <div className={ 'title-container'}>
                        <h3
                          onClick={() => setIsCompletedVisible(!isCompletedVisible)}
                          className="completed-header"
                          style={{ cursor: 'pointer' }}
                        >
                          Completed Tasks ({completed.length})
                          <span className="dropdown-arrow">
                            {isCompletedVisible ? ' ▼' : ' ▶'}
                          </span>
                        </h3>
        </div>


                        {isCompletedVisible && (
                          <ul>
                            {completed.length > 0 ? (
                              completed.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isTimerRunning}>
                                  {(provided) => (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={isTimerRunning ? 'disabled' : ''}
                                    >


                                    <div className="item-task-container">
                                      <p className="item-task completed-task">{task.text}</p>
                                      {task.type !== 'timed' && <p className="item-task-level completed-task"> Importance: {task.importance}</p> }
                                    </div>


                                      <button onClick={() => toggleTaskCompletion(task.id)} disabled={isTimerRunning} className={isTimerRunning ? 'disabled' : 'undo-button'}>
                                      <Undo1 /> 
                                      </button>
                                      <button onClick={() => handleRemoveClick(task.id)} disabled={isTimerRunning}  className={`delete ${isTimerRunning ? 'disabled' : ''}`}>
                                      </button>
                                    </li>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <li className="no-tasks">Dude, go complete some tasks.</li>
                            )}
                          </ul>
                        )}
                        {provided.placeholder}
                        <div className="delete-all-button-container">
                          <button
                          onClick={() => deleteAllCompletedTasks()}
                          disabled={completed.length === 0}
                          className="delete-all-button"
                        >
                          Delete All
                        </button>
                        </div>
                      </div>
                      
                    )}
                  </Droppable>
                </div>
              </DragDropContext>
            </div>
          </div>
        ) : (
          <Login onLogin={signInWithGoogle} />
        )}
      </header>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onConfirm={() => removeTask(taskToRemove)}
        onCancel={() => setIsConfirmationModalOpen(false)}
        message="Are you sure you want to remove this item?"
      />

      <TimerModal
        isOpen={isTimerModalOpen}
        onConfirm={(taskName, duration, importance) => {
          addTimedTask(taskName, duration, importance);
          setIsTimerModalOpen(false);
        }}
        onCancel={() => setIsTimerModalOpen(false)}
      />
  </div>
  );
}

export default App;