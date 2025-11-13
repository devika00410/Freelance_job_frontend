import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate,Link } from "react-router-dom";

const AdminRegister=()=>{
      const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [message, setMessage] = useState('')

    const { loginAdmin, loading } = useAuth()
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

        const result = await loginAdmin(formData)

        if (result.success) {
            setMessage("Admin login successful! Redirecting...")
            setTimeout(() => navigate('/admin/dashboard'), 2000)
        } else {
            setMessage(result.error)
        }
    }

   
    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Admin Access</h2>
                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Admin Email</label>
                        <input type="email" name="email" value={formData.email}
                            onChange={handleChange}  required />
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

                    <button type="submit" disabled={loading}>{loading ? "Accessing":
                   "Admin Login"}</button>
                </form>
                {message && (
                    <div className='message'>{message}</div>
                )}
            </div>
        </div>
    )
}
 export default AdminRegister;

