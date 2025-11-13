import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate,Link } from "react-router-dom";
import './AdminRegister.css'

const AdminRegister=()=>{
      const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
      secretKey:''
    })

    const [message, setMessage] = useState('')

    const { registerAdmin, loading } = useAuth()
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
        const result = await registerAdmin(formData)

        if (result.success) {
            setMessage("Admin account created! Redirecting...")
            setTimeout(() => navigate('/admin/dashboard'), 2000)
        } else {
            setMessage(result.error)
        }
    }

   
    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Setup Admin Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Admin Name</label>
                        <input type="text" name="name" value={formData.name}
                            onChange={handleChange} placeholder="Enter your name" required />
                    </div>
            

                    <div className="form-group">
                        <label>Admin Email</label>
                        <input type="email" name="email" value={formData.email}
                            onChange={handleChange} placeholder="your.email@example.com" required />
                    </div>
                    <div className="form-group">
                        <label>Admin Password</label>
                        <input type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a strong password" required minLength='8' />
                            <small className="field-note">Must be atleast 8 characters</small>
                    </div>
<div className="form-group">
    <label>Security Key</label>
    <input
    type="password"
    name="secretKey"
    value={formData.secretKey}
    onChange={handleChange}
    required
    placeholder="Enter installation key"/>
</div>

                    <button type="submit" disabled={loading}>{loading ? "Setting Up...":
                   "Setup Admin Account"}</button>
                </form>
                {message && (
                    <div className='message'>{message}</div>
                )}
            </div>
        </div>
    )
}
 export default AdminRegister;

