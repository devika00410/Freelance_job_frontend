import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext)
}
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    const API_BASE = 'http://localhost:5000/api';


       
   useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedAdminToken = localStorage.getItem('admin_token')
    
    if (storedToken) {
        setToken(storedToken)
        setLoading(false)
    } else if (storedAdminToken) {
        setToken(storedAdminToken)
        setLoading(false)
    } else {
        setLoading(false)
    }
}, [])


    // User registration(public)
    const registerUser = async (userData) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/user/register`, userData);
            const { user, token } = response.data;
            localStorage.setItem('token', token)
            setUser(user);
            setToken(token)

            return { success: true, user }
        }
        catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        } finally {
            setLoading(false)
        }
    }

    // Admin Registartion(hidden)
    const registerAdmin = async (adminData) => {
        setLoading(true)
        try {
            const response = await axios.post(`${API_BASE}/admin/register`, adminData)
            const { user, token } = response.data;

            localStorage.setItem('admin_token', token)
            setUser(user);
            setToken(token);
            return { success: true, user }
        } catch (error) {
            return {
                success: false,
                error:error.response?.data?.error || "Admin registration failed"
    }
        }
         finally{
            setLoading(false)
        }
    }
//    Userlogin (public-no admin allowed)

const loginUser=async(loginData)=>{
    setLoading(true);
    try{
        const response= await axios.post(`${API_BASE}/auth/login`,loginData)
        const{user,token}=response.data;
        // Prevent admin login through user endpoint
        if(user.role==="admin"){
            return{
                success:false,
                error:"Please use admin login"
            }
        }
        localStorage.setItem('token',token)
        setUser(user)
        setToken(token)

        return {success:true,user}
    } catch(error){
        return{
            success:false,
            error:error.response?.data?.error || 'Login failed'
        }
    } finally{
        setLoading(false)
    }
}

// Admin login

const loginAdmin=async(loginData)=>{
    setLoading(true)
    try{
        const response= await axios.post(`${API_BASE}/auth/admin/login`,loginData)
        const {user,token}=response.data

        localStorage.setItem('admin_token',token)
        setUser(user)
        setToken(token)

        return {success:true,user}
    } catch(error){
        return{
            success:false,
            error:error.response?.data?.error || "Admin login failed"
        }
    }
    finally{
        setLoading(false)
    }
}
const logout=()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('admin_token')
    setUser(null)
    setToken(null)
};
const value={
    user,token,loading,registerUser,registerAdmin,loginUser,loginAdmin,logout
}
return(
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);
};