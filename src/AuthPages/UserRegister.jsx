import { useState,useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './UserRegister.css'

const UserRegister =  () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: '',
        workEmail: ""
    })

    const [message, setMessage] = useState('')

    const { registerUser, loading } = useAuth('')
    const navigate = useNavigate()

    useEffect(() => {
        const selectedRole = localStorage.getItem('selectedRole');
        if (selectedRole) {
            setFormData(prev => ({ ...prev, role: selectedRole }))
        } else {
            navigate('/role-selection')
        }
    },
        [navigate])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')

        const submitData={
            name:formData.name,
            password:formData.password,
            role:formData.role,
            email:isClient? formData.workEmail : formData.email
        }
        console.log('Sending data to backend:', submitData)
        const result = await registerUser(submitData)
        console.log("Registration result:",result)

        if (result.success) {
            setMessage("Registration successful! Redirecting...")
            localStorage.removeItem('selectedRole')

            const token =localStorage.getItem('token')
            console.log('Token after registeration:', token)
            setTimeout(() => navigate('/dashboard'), 2000)
        } else {
            setMessage(result.error)
        }
    }

    const isClient = formData.role === 'client'



    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Create your{isClient ? 'Client' : 'Freelancer'}Account</h2>
                <div className="role-badge">
                    {isClient ? "Hiring for projects" : "Looking for work"}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value={formData.name}
                            onChange={handleChange} placeholder="Enter your name" required />
                    </div>
                    {/* Work email only for clients */}
                    {isClient ?(
                    <div className="form-group">
                        <label>Work Email</label>
                        <input
                            type="email"
                            name="workEmail"
                            value={formData.workEmail}
                            onChange={handleChange}
                            placeholder="your.company@email.com" />
                        <small className="field-note">Optional-for business communication</small>
                    </div>
                    ):(
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email}
                            onChange={handleChange} placeholder="your.email@example.com" required />
                    </div>
                      )}
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password" required minLength='6' />
                            <small className="field-note">Must be atleast 6 characters</small>
                    </div>
                    <button type="submit" disabled={loading}>{loading ? "Creating Account...":
                    `Create${isClient ?'Client':'Freelancer'} Account`}</button>
                </form>
                {message && (
                    <div className={`message ${message.includes('succesful')?"success":"error"}`}>{message}</div>
                )}
                <div className="auth-links">
                    <p>Already have an account?<Link to='/login'>Log In</Link></p>
                </div>
            </div>
        </div>
    )
}
export default UserRegister;