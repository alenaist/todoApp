import React from 'react';
import { auth, googleProvider, signInWithPopup } from '../../api/firebase'

const Login = ({ onLogin }) => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onLogin(user); // Notify parent component about the login
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div>
    <h1>TODO APP Quest</h1>
    <p>Complete life tasks and progress in the adventure.</p>
    <h3>- Login with google: - </h3>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default Login;