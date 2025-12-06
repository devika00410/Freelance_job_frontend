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

    const API_BASE = 'http://localhost:3000/api';

    // Helper function to save user data with role-specific keys
    const saveUserData = (user, token) => {
        const role = user.role;
        // Save role-specific data
        localStorage.setItem(`${role}_token`, token);
        localStorage.setItem(`${role}_user`, JSON.stringify(user));
        // Save general data for compatibility
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    // Helper function to clear ALL user data - COMPREHENSIVE CLEANUP
    const clearAllUserData = () => {
        console.log('🧹 Clearing ALL user data from localStorage');
        
        // Remove all possible tokens and user data
        const itemsToRemove = [
            // General tokens
            'token', 'authToken', 'accessToken',
            
            // Role-specific tokens
            'admin_token', 'client_token', 'freelancer_token',
            
            // General user data
            'user', 'authUser', 'currentUser',
            
            // Role-specific user data
            'admin_user', 'client_user', 'freelancer_user',
            
            // Individual user fields (CRITICAL - these were missing!)
            'userId', 'userName', 'userRole', 'userEmail',
            'user_id', 'user_name', 'user_role', 'user_email',
            
            // Other session data
            'selectedRole', 'lastLogin', 'session',
            
            // Proposal/Contract data that might have wrong names
            'lastAcceptedProposal', 'contractData',
            
            // Any other user-related data
            'profile', 'userProfile', 'userInfo'
        ];
        
        itemsToRemove.forEach(item => {
            localStorage.removeItem(item);
        });
        
        // Also clear any items containing "Elsa" or "Diya" to be safe
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            if (value && (value.includes('Elsa') || value.includes('Diya'))) {
                console.log(`🧹 Removing item with name reference: ${key}`);
                localStorage.removeItem(key);
            }
        });
        
        console.log('✅ All user data cleared from localStorage');
    };

    useEffect(() => {
        console.log('🔄 AuthContext initialization started');
        
        // Check localStorage consistency on mount
        const checkLocalStorageConsistency = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const storedUserName = localStorage.getItem('userName');
                
                if (storedUser && storedUserName) {
                    const parsedUser = JSON.parse(storedUser);
                    const userActualName = parsedUser.name || parsedUser.username || '';
                    
                    if (userActualName && userActualName !== storedUserName) {
                        console.warn('⚠️ localStorage inconsistency detected!');
                        console.warn(`- user.name in storedUser: ${userActualName}`);
                        console.warn(`- localStorage userName: ${storedUserName}`);
                        console.warn('Fixing userName in localStorage...');
                        localStorage.setItem('userName', userActualName);
                    }
                }
                
                // Check for any "Elsa" references (freelancer name contamination)
                Object.keys(localStorage).forEach(key => {
                    const value = localStorage.getItem(key);
                    if (value && value.includes('Elsa') && key.includes('user')) {
                        console.warn(`⚠️ Found freelancer name "Elsa" in ${key}! This is wrong for client.`);
                    }
                });
            } catch (e) {
                console.error('Error checking localStorage consistency:', e);
            }
        };
        
        // Check for role-specific tokens first (NEW LOGIC)
        const clientToken = localStorage.getItem('client_token');
        const clientUser = localStorage.getItem('client_user');
        const freelancerToken = localStorage.getItem('freelancer_token');
        const freelancerUser = localStorage.getItem('freelancer_user');
        const adminToken = localStorage.getItem('admin_token');
        const adminUser = localStorage.getItem('admin_user');

        if (clientToken && clientUser) {
            console.log('🔑 Found client session');
            try {
                const parsedUser = JSON.parse(clientUser);
                setToken(clientToken);
                setUser(parsedUser);
                
                // Ensure individual fields match
                if (parsedUser._id) localStorage.setItem('userId', parsedUser._id);
                if (parsedUser.name || parsedUser.username) {
                    localStorage.setItem('userName', parsedUser.name || parsedUser.username);
                }
                if (parsedUser.role) localStorage.setItem('userRole', parsedUser.role);
                if (parsedUser.email) localStorage.setItem('userEmail', parsedUser.email);
                
                console.log('✅ Client session restored:', parsedUser.name || parsedUser.username);
            } catch (e) {
                console.error('Error parsing client user data:', e);
                clearAllUserData();
            }
        } else if (freelancerToken && freelancerUser) {
            console.log('🔑 Found freelancer session');
            try {
                const parsedUser = JSON.parse(freelancerUser);
                setToken(freelancerToken);
                setUser(parsedUser);
                
                // Ensure individual fields match
                if (parsedUser._id) localStorage.setItem('userId', parsedUser._id);
                if (parsedUser.name || parsedUser.username) {
                    localStorage.setItem('userName', parsedUser.name || parsedUser.username);
                }
                if (parsedUser.role) localStorage.setItem('userRole', parsedUser.role);
                if (parsedUser.email) localStorage.setItem('userEmail', parsedUser.email);
                
                console.log('✅ Freelancer session restored:', parsedUser.name || parsedUser.username);
            } catch (e) {
                console.error('Error parsing freelancer user data:', e);
                clearAllUserData();
            }
        } else if (adminToken && adminUser) {
            console.log('🔑 Found admin session');
            try {
                const parsedUser = JSON.parse(adminUser);
                setToken(adminToken);
                setUser(parsedUser);
                
                // Ensure individual fields match
                if (parsedUser._id) localStorage.setItem('userId', parsedUser._id);
                if (parsedUser.name || parsedUser.username) {
                    localStorage.setItem('userName', parsedUser.name || parsedUser.username);
                }
                if (parsedUser.role) localStorage.setItem('userRole', parsedUser.role);
                if (parsedUser.email) localStorage.setItem('userEmail', parsedUser.email);
                
                console.log('✅ Admin session restored:', parsedUser.name || parsedUser.username);
            } catch (e) {
                console.error('Error parsing admin user data:', e);
                clearAllUserData();
            }
        } 
        // Fallback to old system
        else {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                console.log('🔑 Found legacy session');
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(parsedUser);
                    
                    // Ensure individual fields exist
                    if (parsedUser._id && !localStorage.getItem('userId')) {
                        localStorage.setItem('userId', parsedUser._id);
                    }
                    if ((parsedUser.name || parsedUser.username) && !localStorage.getItem('userName')) {
                        localStorage.setItem('userName', parsedUser.name || parsedUser.username);
                    }
                    if (parsedUser.role && !localStorage.getItem('userRole')) {
                        localStorage.setItem('userRole', parsedUser.role);
                    }
                    if (parsedUser.email && !localStorage.getItem('userEmail')) {
                        localStorage.setItem('userEmail', parsedUser.email);
                    }
                    
                    console.log('✅ Legacy session restored:', parsedUser.name || parsedUser.username);
                } catch (e) {
                    console.error('Error parsing legacy user data:', e);
                    clearAllUserData();
                }
            } else {
                console.log('🔑 No session found - user is not logged in');
            }
        }
        
        // Run consistency check
        checkLocalStorageConsistency();
        
        setLoading(false);
    }, [])

    // In registerUser function, similar fix:
const registerUser = async (userData) => {
    setLoading(true);
    try {
        // Clear any existing sessions before new registration
        console.log('🧹 Clearing old sessions before registration');
        clearAllUserData();
        
        const response = await axios.post(`${API_BASE}/auth/register`, userData);
        
        if (response.data.success) {
            const { user, token } = response.data;
            
            // ⭐️ CRITICAL: Extract user ID
            const userId = user._id || user.id || user.userId;
            
            // DEBUG LOGGING
            console.log('🔐 Registration successful - Storing user data:', {
                userId: userId,
                userName: user.name || user.username,
                userRole: user.role,
                userEmail: user.email
            });
            
            // Save with role-specific keys
            saveUserData(user, token);
            
            // ⭐️ CRITICAL: Also save individual user fields
            localStorage.setItem('userId', userId || '');
            localStorage.setItem('userName', user.name || user.username || '');
            localStorage.setItem('userRole', user.role || '');
            localStorage.setItem('userEmail', user.email || '');
            
            // Update state
            setUser(user);
            setToken(token);
            
            console.log(`✅ ${user.role} registration successful:`, user.name || user.username);
            return { success: true, user };
        } else {
            return {
                success: false,
                error: response.data.error || "Registration failed"
            };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { 
            success: false, 
            error: error.response?.data?.error || error.response?.data?.message || "Registration failed" 
        };
    } finally {
        setLoading(false);
    }
};
    // Admin Registration (hidden route)
    const registerAdmin = async (adminData) => {
        setLoading(true)
        try {
            // Clear any existing sessions
            console.log('🧹 Clearing old sessions before admin registration');
            clearAllUserData();
            
            console.log("Sending admin registration:", adminData);
            
            const response = await axios.post(`${API_BASE}/auth/admin/register`, adminData);
            console.log("Admin registration response:", response.data);
            
            if (response.data.success) {
                const { user, token } = response.data;
                
                // DEBUG LOGGING
                console.log('🔐 Admin registration successful - Storing user data:', {
                    userId: user._id,
                    userName: user.name || user.username,
                    userRole: user.role,
                    userEmail: user.email
                });
                
                // Save admin-specific items
                saveUserData(user, token);
                
                // ⭐️ CRITICAL: Also save individual user fields
                localStorage.setItem('userId', user._id);
                localStorage.setItem('userName', user.name || user.username);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('userEmail', user.email);
                
                // Update state
                setUser(user);
                setToken(token);
                
                console.log('✅ Admin registration successful');
                return { success: true, user };
            } else {
                return {
                    success: false,
                    error: response.data.error || "Admin registration failed"
                };
            }
        } catch (error) {
            console.error("Admin registration error:", error);
            return {
                success: false,
                error: error.response?.data?.error || 
                       error.response?.data?.message || 
                       "Admin registration failed. Check server connection."
            };
        } finally {
            setLoading(false);
        }
    }

    // AuthContext.jsx - Fix in loginUser function
const loginUser = async (credentials) => {
    setLoading(true);
    try {
        // Clear any existing sessions before new login
        console.log('🧹 Clearing old sessions before login');
        clearAllUserData();
        
        const response = await axios.post(`${API_BASE}/auth/login`, credentials);
        
        if (response.data.success) {
            const { user, token } = response.data;
            
            // ⭐️ CRITICAL FIX: Check user object structure
            console.log('🔐 Login successful - Full response:', response.data);
            console.log('🔐 User object structure:', user);
            
            // Extract user ID properly - try different possible fields
            const userId = user._id || user.id || user.userId;
            
            if (!userId) {
                console.error('❌ NO USER ID FOUND in response!');
                console.error('User object:', user);
            }
            
            // DEBUG LOGGING - CRITICAL FOR DIAGNOSIS
            console.log('🔐 Login successful - Storing user data:', {
                userId: userId,
                userName: user.name || user.username,
                userRole: user.role,
                userEmail: user.email,
                profileName: user.profile?.name,
                rawUserData: user
            });
            
            // Save with role-specific keys
            saveUserData(user, token);
            
            // ⭐️ CRITICAL: Also save individual user fields for CreateContractPage
            localStorage.setItem('userId', userId || '');
            localStorage.setItem('userName', user.name || user.username || '');
            localStorage.setItem('userRole', user.role || '');
            localStorage.setItem('userEmail', user.email || '');
            
            // Log what was actually stored
            console.log('✅ Stored in localStorage:', {
                userId: localStorage.getItem('userId'),
                userName: localStorage.getItem('userName'),
                userRole: localStorage.getItem('userRole')
            });
            
            // Update state
            setUser(user);
            setToken(token);
            
            console.log(`✅ ${user.role} login successful:`, user.name || user.username);
            return { success: true, user };
        } else {
            return {
                success: false,
                error: response.data.error || "Login failed"
            };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { 
            success: false, 
            error: error.response?.data?.error || error.response?.data?.message || "Login failed" 
        };
    } finally {
        setLoading(false);
    }
};
    // Admin login
    const loginAdmin = async (loginData) => {
        setLoading(true)
        try {
            // Clear any existing sessions
            console.log('🧹 Clearing old sessions before admin login');
            clearAllUserData();
            
            const response = await axios.post(`${API_BASE}/auth/admin/login`, loginData)
            
            if (response.data.success) {
                const { user, token } = response.data;

                // DEBUG LOGGING
                console.log('🔐 Admin login successful - Storing user data:', {
                    userId: user._id,
                    userName: user.name || user.username,
                    userRole: user.role,
                    userEmail: user.email
                });

                // Save admin-specific items
                saveUserData(user, token);
                
                // ⭐️ CRITICAL: Also save individual user fields
                localStorage.setItem('userId', user._id);
                localStorage.setItem('userName', user.name || user.username);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('userEmail', user.email);

                // Update state
                setUser(user);
                setToken(token);

                console.log('✅ Admin login successful');
                return { success: true, user };
            } else {
                return {
                    success: false,
                    error: response.data.error || "Admin login failed"
                };
            }
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.response?.data?.message || "Admin login failed"
            }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        if (user) {
            console.log('🚪 Logging out user:', {
                role: user?.role,
                name: user?.name || user?.username,
                id: user?._id
            });
        }
        
        // Clear all user data from localStorage - COMPREHENSIVE
        clearAllUserData();
        
        // Reset state
        setUser(null);
        setToken(null);
        
        console.log('✅ User logged out successfully');
        
        // Optional: Redirect to login page
        // window.location.href = '/login';
    };

    // Function to manually check localStorage (for debugging)
    const checkLocalStorage = () => {
        console.log('🔍 Current localStorage state:');
        Object.keys(localStorage).forEach(key => {
            try {
                const value = localStorage.getItem(key);
                console.log(`  ${key}:`, value);
            } catch (e) {
                console.log(`  ${key}: [Error reading]`);
            }
        });
    };

    const value = {
        user,
        token,
        loading,
        registerUser,
        registerAdmin,
        loginUser,
        loginAdmin,
        logout,
        isAuthenticated: !!user && !!token,
        checkLocalStorage // Add for debugging
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};