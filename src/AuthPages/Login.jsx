import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate,Link } from "react-router-dom";

const Login=()=>{
    const[formData,setFormData]=useState({
        email:'',
        password:''
    })
    const[message,setMessage]=useState('')
    const { loginUser, loading } = useAuth('')
    const navigate = useNavigate()

    

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        const result = await loginUser(formData)

        if (result.success) {
            setMessage("Login successful! Redirecting...")
            localStorage.removeItem('selectedRole')
            setTimeout(() => navigate('/dashboard'), 2000)
        } else {
            setMessage(result.error)
        }
    }

    



    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Sign in</h2>
                <form onSubmit={handleSubmit}>
                   
                   

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email}
                            onChange={handleChange} placeholder="your.email@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password" required minLength='6' />
                            <small className="field-note">Must be atleast 6 characters</small>
                    </div>
                    <button type="submit" disabled={loading}>{loading ? 'Signing In...':'Sign in'}</button>
                </form>
                {message && (
                    <div className='message'>{message}</div>
                )}
                <div className="auth-links">
                    <p>Don't have an account?<Link to='/register'>Signup</Link></p>
                </div>
            </div>
        </div>
    )

}

export default Login;
