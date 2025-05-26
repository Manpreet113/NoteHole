import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserAuth } from '../utils/AuthContext';

function Signup() {
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState("");
  const [ loading, setLoading ] = useState("");

  const {session, signUpNewUser} = UserAuth();

  console.log(session);

  return (
    <div className='mt-24'>
        <form className='max-w-md m-auto p-6 border rounded-2xl dark:border-amber-50' >
          <h2 className='font-bold pb-2'>Sign up now!</h2>
          <p>Existing User? <Link to={"/login"}>Log In</Link></p>
          <div className='flex flex-col py-4'>
            <input placeholder='Email' className='p-3 mt-6' type="email" />
            <input placeholder='Password' className='p-3 mt-6' type="password" />
            <button type='submit' disabled={loading} className='width-full mt-6'>Sign Up</button>
          </div>
        </form>
    </div>
  )
}

export default Signup