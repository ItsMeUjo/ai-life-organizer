// Updated page.tsx file

import React from 'react';

const SignupPage = () => {
  return (
    <div>
      <h1>Signup</h1>
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Username" />
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" />
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" />
      <button type="submit">Sign Up</button>
    </div>
  );
};

export default SignupPage;
