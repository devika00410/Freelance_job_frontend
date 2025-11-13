import React from "react";
import { useNavigate, Link } from "react-router-dom";
import './RoleSelection.css'

const RoleSelection = () => {
    const navigate = useNavigate()


    const handleRoleSelect = (role) => {
        localStorage.setItem('selectedRole', role)
        navigate('/register')
    }

    return (
        <div className="role-selection-container">
            <div className="role-selection-card">
                <h1 className="logo">Website</h1>
                <h2>Join as a client or freelancer</h2>
                <div className="role-options">
                    <div className="role-card client-card" onClick={() => handleRoleSelect('client')}>
                        <div className="role-icon">👔</div>
                        <h3>I'm a client, hiring for a project</h3>
                        <p>Find skilled freelancers for your project</p>
                    </div>
                    <div className="role-card freelancer-card" onClick={handleRoleSelect('freelancer')}>
                        <div className="role-icon">💼 </div>
                        <h3>I'm a freelancer, looking for work</h3>
                        <p>Find prjects and build your career</p>
                    </div>
                    <button className="create-account-btn"
                        onClick={() => {
                            const role = localStorage.getItem('selectedRole')
                            if (role) {
                                navigate('/register')
                            } else {
                                alert('Please select your role first')
                            }
                        }}>Create Account</button>
                    <div className="auth-links">
                        <p>Already have an account?<Link to='/login'>Log In</Link></p>
                    </div>
                    <div className="footer-links">
                        <span>Privacy</span>
                        <span>Terms</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleSelection;
