import React from 'react';
import Layout from '../Layout';

const SignupPage = () => {
  return (
    <Layout>
      <div className="signup-container">
        <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input type="email" id="email" className="input text-gray-900" required />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input type="password" id="password" className="input text-gray-900" required />
          </div>
          <button type="submit" className="btn">Sign Up</button>
        </form>
      </div>
    </Layout>
  );
};

export default SignupPage;