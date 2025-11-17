import axios from 'axios';

const api= axios.create({
    baseURL:'http://localhost:5000/api',
    headers:{
        'Content-Type':'application/json'
    }
})

// Adding request interceptor to include auth token

api.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem('token')
        if(token){
            config.headers.Authorization=`Bearer ${token}`
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
);

// Adding response interceptor to handle errors
api.interceptors.response.use(
    (response)=>{
        return response;
    },
    (error)=>{
        if(error.response?.status === 401){
            // token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user')
            window.location.href='/login'
        }

        return Promise.reject(error)
    }
);

// Auth API functions

export const authAPI={
    register:(userData)=>api.post('/auth/register',userData),
    login:(credentials)=>api.post('/auth/login',credentials),
    adminRegister:(adminData)=>api.post('/admin/register',adminData),
    adminLogin:(adminCredentials)=>api.post('/admin/login',adminCredentials)
};

// client api functions

export const clientAPI={
    getDashboard:()=>api.get('/client/dashboard'),
    getJobs:()=>api.get('/client/jobs'),
    createJob:(jobData)=>api.post('/client/jobs',jobData)
}

// freelancer api functions

export const freelancerAPI={
    getDashboard:()=>api.get('/freelancer/dashboard'),
    getJobs:()=>api.get('/freelancer/jobs')
}

// admin api functions
export const adminAPI={
    getDashboard:()=>api.get('/admin/dashboard'),
    getUsers:()=>api.get('/admin/users')
}

export default api;