import React from 'react';
import { Eye } from '../icons/OpenEyeIcon';
import { EyeClosed } from '../icons/ClosedEyeIcon';

const UserProfile = ({ user, userLevel, progress, avatarIsOpen, toggleBox, signOut }) => {
  return (
    <div className="collapsable-container">
      <button className="collapsable-button" onClick={toggleBox}>
        {avatarIsOpen ? <EyeClosed /> : <Eye />}
      </button>
      <div className="box">
        <div className="avatar-column">
          <div className="user-profile">
            <div className="avatar">
              <img src={user.photoURL} alt="User Avatar" />
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
  );
};

export default UserProfile;