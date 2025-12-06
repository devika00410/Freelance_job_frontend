import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    FaArrowLeft,
    FaCheck,
    FaSave,
    FaPaperPlane,
    FaFileContract,
    FaUser,
    FaCalendarAlt,
    FaDollarSign,
    FaPlus,
    FaTimes,
    FaDownload,
    FaSignature,
    FaFileAlt,
    FaSpinner,
    FaExclamationTriangle,
    FaStar
} from 'react-icons/fa';
import './CreateContractPage.css';



const CreateContractPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { proposalId: urlProposalId } = useParams();

    // ⭐️ CRITICAL DEBUGGING - Add this early
    useEffect(() => {
        console.log('🧑‍💼 CURRENT USER INFO (CreateContractPage):', {
            localStorageUserName: localStorage.getItem('userName'),
            localStorageUserId: localStorage.getItem('userId'),
            localStorageUserRole: localStorage.getItem('userRole'),
            localStorageUserEmail: localStorage.getItem('userEmail'),
            localStorageToken: localStorage.getItem('token') ? 'present' : 'missing'
        });
        
        // Also log any other user data that might be cached
        console.log('🔄 All localStorage items:');
        Object.keys(localStorage).forEach(key => {
            if (key.includes('user') || key.includes('token')) {
                console.log(`  ${key}:`, localStorage.getItem(key));
            }
        });
    }, []);
   
    // State variables
    const [proposalId, setProposalId] = useState(urlProposalId || '');
    const [proposalData, setProposalData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signature, setSignature] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [dataStatus, setDataStatus] = useState({
        loading: true,
        valid: false,
        error: null
    });

    // Form data state
    const [formData, setFormData] = useState({
        // Basic Information
        title: '',
        serviceType: 'Web Development',
        projectId: '',

        // Parties Information
        clientId: '',
        freelancerId: '',
        freelancerName: '',
        proposalId: '',

        // Contract Terms
        terms: '',

        // Financial Information
        totalBudget: 0,
        timeline: '30 days',

        // Dates
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',

        // Milestone Structure
        milestoneStructure: 'Payments linked to milestone completion as specified below.',

        // Phases
        phases: [
            { phase: 1, title: 'Initial Planning & Design', amount: 0, status: 'pending' },
            { phase: 2, title: 'Development Phase', amount: 0, status: 'pending' },
            { phase: 3, title: 'Testing & Delivery', amount: 0, status: 'pending' }
        ]
    });

    // Standard Indian IT Service Clauses
    const standardClauses = {
        confidentiality: `CONFIDENTIALITY: Both parties agree to maintain the confidentiality of all proprietary information shared during the term of this Agreement and for three years thereafter. The Freelancer shall not disclose any confidential information to any third party without the prior written consent of the Client.`,

        intellectualProperty: `INTELLECTUAL PROPERTY: All intellectual property rights, including but not limited to copyrights, patents, trademarks, and trade secrets, in the work product delivered under this Agreement shall be the sole property of the Client. Upon full payment, the Freelancer hereby assigns all rights, title, and interest in the work product to the Client.`,

        dataProtection: `DATA PROTECTION: The Freelancer shall comply with the provisions of the Information Technology Act, 2000 and related data protection laws. All client data shall be stored securely and used only for the purpose of providing the services under this Agreement.`,

        liability: `LIMITATION OF LIABILITY: The total liability of either party under this Agreement shall not exceed the total contract value. Neither party shall be liable for any indirect, special, or consequential damages arising out of or in connection with this Agreement.`,

        termination: `TERMINATION: Either party may terminate this Agreement with 30 days written notice. Upon termination, the Client shall pay for all services rendered up to the termination date. All confidential information shall be returned or destroyed.`,

        governingLaw: `GOVERNING LAW AND JURISDICTION: This Agreement shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [City], India.`,

        independentContractor: `INDEPENDENT CONTRACTOR: The Freelancer is an independent contractor and not an employee of the Client. The Freelancer is responsible for their own taxes, insurance, and statutory compliances under Indian laws.`
    };

    // Initialize data on component mount
    // Initialize data on component mount
useEffect(() => {
    const initializeData = async () => {
        setDataStatus({ loading: true, valid: false, error: null });

        try {
            console.log('=== DEBUG: INITIALIZING CONTRACT DATA ===');
            
            // ⭐️⭐️⭐️ KEY FIX: Check localStorage FIRST ⭐️⭐️⭐️
            const savedProposalData = localStorage.getItem('acceptedProposalData');
            if (savedProposalData) {
                try {
                    const parsedData = JSON.parse(savedProposalData);
                    console.log('✅ FOUND localStorage backup! Using this data:', parsedData);
                    
                    // Initialize form with this data
                    initializeFormData(parsedData);
                    setDataStatus({ loading: false, valid: true, error: null });
                    return; // ⭐️ CRITICAL: Stop here, skip API call
                } catch (e) {
                    console.error('Error parsing localStorage data:', e);
                    // Continue to API fallback
                }
            }
            
            console.log('No localStorage backup found, trying API...');
            console.log('URL Proposal ID:', urlProposalId);
            console.log('Location State:', location.state);
            console.log('User ID:', localStorage.getItem('userId'));
            console.log('User Token present:', !!localStorage.getItem('token'));

            let dataSource = 'none';
            let extractedData = {};

            // Priority 1: Data from location state (from ProposalsPage)
            if (location.state) {
                dataSource = 'location state';
                extractedData = location.state;
                console.log('📋 Using location state:', extractedData);
            }

            // Priority 2: URL parameter (direct access)
            if (!extractedData.proposalId && urlProposalId) {
                dataSource = 'URL parameter';
                extractedData.proposalId = urlProposalId;
                console.log('📋 Using proposal ID from URL:', urlProposalId);
            }

            // Priority 3: Local storage (backup from ProposalsPage)
            if (!extractedData.proposalId) {
                const savedData = localStorage.getItem('lastAcceptedProposal');
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        if (parsed.proposalId) {
                            dataSource = 'local storage';
                            extractedData = { ...extractedData, ...parsed };
                            console.log('📋 Using data from localStorage:', parsed);
                        }
                    } catch (e) {
                        console.error('Error parsing localStorage data:', e);
                    }
                }
            }

            if (!extractedData.proposalId) {
                throw new Error('No proposal data found. Please accept a proposal first from the Proposals page.');
            }

            console.log(`✅ Data source: ${dataSource}`, extractedData);

            // Set proposal ID
            setProposalId(extractedData.proposalId);

            // Try to fetch proposal details from API to get complete data
            await fetchProposalDetails(extractedData.proposalId, extractedData);

        } catch (error) {
            console.error('❌ Error initializing data:', error);
            setDataStatus({
                loading: false,
                valid: false,
                error: error.message || 'Failed to load proposal data'
            });
        }
    };

    initializeData();
}, [location.state, urlProposalId]);
 

   // Fetch proposal details from API - FIXED ENDPOINT
const fetchProposalDetails = async (proposalId, fallbackData = {}) => {
    try {
        const token = localStorage.getItem('token');
        console.log(`📡 Fetching proposal details for ID: ${proposalId}`);

        const response = await axios.get(
            `http://localhost:3000/api/client/proposals/${proposalId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('📡 Proposal API response:', response.data);

        if (response.data.success && response.data.proposal) {
            const proposal = response.data.proposal;

            // CHECK: Is proposal accepted?
            if (proposal.status !== 'accepted') {
                console.warn(`⚠️ Proposal status is "${proposal.status}", not "accepted"`);

                // Try to accept it automatically
                try {
                    console.log('🔄 Attempting to accept proposal...');
                    const acceptResponse = await axios.put(
                        `http://localhost:3000/api/client/proposals/${proposalId}/accept`,
                        {},
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );

                    if (acceptResponse.data.success) {
                        console.log('✅ Proposal accepted successfully');
                        // Re-fetch the proposal
                        return fetchProposalDetails(proposalId, fallbackData);
                    }
                } catch (acceptError) {
                    console.error('Failed to accept proposal:', acceptError.message);
                }

                throw new Error(`Proposal is not accepted. Current status: "${proposal.status}". Please accept the proposal first.`);
            }

            // Extract data from API response
            const apiData = extractProposalData(proposal);

            // Merge with fallback data (API data takes priority)
            const finalData = { ...fallbackData, ...apiData };

            console.log('Final proposal data:', finalData);

            // Set proposal data
            setProposalData(finalData);

            // Initialize form with this data
            initializeFormData(finalData);

            // Mark as valid
            setDataStatus({
                loading: false,
                valid: true,
                error: null
            });

        } else {
            throw new Error(response.data.message || 'Failed to fetch proposal details');
        }

    } catch (error) {
        console.error('Error fetching proposal details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // ⭐️⭐️⭐️ IMPROVED FALLBACK: Use localStorage backup if API fails ⭐️⭐️⭐️
        const savedProposalData = localStorage.getItem('acceptedProposalData');
        if (savedProposalData) {
            try {
                const parsedData = JSON.parse(savedProposalData);
                console.log('✅ Using localStorage backup since API failed:', parsedData);
                
                setProposalData(parsedData);
                initializeFormData(parsedData);
                
                setDataStatus({
                    loading: false,
                    valid: true,
                    error: `Using cached data: ${error.message}`
                });
                return; // Exit function, we have data
            } catch (parseError) {
                console.error('Error parsing localStorage backup:', parseError);
            }
        }

        // ⭐️ If API fails but we have fallback data, use it with warning
        if (fallbackData.proposalId && fallbackData.freelancerId) {
            console.log('⚠️ Using fallback data since API failed:', fallbackData);
            setProposalData(fallbackData);
            initializeFormData(fallbackData);
            setDataStatus({
                loading: false,
                valid: true,
                error: `Using fallback data: ${error.message}`
            });
        } else {
            throw new Error(`Failed to fetch proposal details: ${error.message}`);
        }
    }
};
   // In extractProposalData function in CreateContractPage.jsx:
const extractProposalData = (proposal) => {
    console.log('📊 Extracting data from proposal object:', proposal);

    // ⭐️ CRITICAL FIX 1: Always get CLIENT info from localStorage ONLY
    const clientName = localStorage.getItem('userName') || 'Client';
    const clientId = localStorage.getItem('userId') || '';
    
    console.log('✅ Client info (from localStorage):', {
        clientName,
        clientId,
        localStorageUserName: localStorage.getItem('userName'),
        localStorageUserId: localStorage.getItem('userId')
    });

    // ⭐️ CRITICAL FIX 2: Get FREELANCER info from proposal
    let freelancerName = 'Freelancer';
    let freelancerId = '';

    // Check multiple possible locations for freelancer info
    if (proposal.freelancerId && typeof proposal.freelancerId === 'object') {
        freelancerName = proposal.freelancerId.name || proposal.freelancerId.username || 'Freelancer';
        freelancerId = proposal.freelancerId._id || '';
        console.log('✅ Got freelancer from freelancerId object:', freelancerName);
    }
    else if (proposal.freelancer && typeof proposal.freelancer === 'object') {
        freelancerName = proposal.freelancer.name || proposal.freelancer.username || 'Freelancer';
        freelancerId = proposal.freelancer._id || '';
        console.log('✅ Got freelancer from freelancer field:', freelancerName);
    }
    else if (proposal.freelancerName) {
        freelancerName = proposal.freelancerName;
        freelancerId = proposal.freelancerId || '';
        console.log('✅ Got freelancer from freelancerName field:', freelancerName);
    }
    else if (typeof proposal.freelancerId === 'string') {
        freelancerId = proposal.freelancerId;
        console.log('⚠️ Freelancer ID is string, need to fetch name:', freelancerId);
    }

    // ⭐️ CRITICAL FIX 3: WARN if names look swapped
    if (clientName === freelancerName) {
        console.warn('⚠️ WARNING: Client and freelancer names are the same!');
        console.warn(`- localStorage userName: ${clientName}`);
        console.warn(`- Proposal freelancerName: ${freelancerName}`);
        console.warn('This suggests a session/persistence issue!');
        
        // Try to get freelancer name from other sources
        if (proposal.clientId && typeof proposal.clientId === 'object') {
            console.log('Checking proposal.clientId for freelancer info:', proposal.clientId);
        }
        if (proposal.client && typeof proposal.client === 'object') {
            console.log('Checking proposal.client for freelancer info:', proposal.client);
        }
    }

    // Get project info
    let projectTitle = 'Project';
    let projectId = '';
    let serviceType = 'Web Development';

    if (proposal.projectId && typeof proposal.projectId === 'object') {
        projectTitle = proposal.projectId.title || 'Project';
        projectId = proposal.projectId._id || '';
        serviceType = proposal.projectId.category || serviceType;
    } else if (proposal.project && typeof proposal.project === 'object') {
        projectTitle = proposal.project.title || 'Project';
        projectId = proposal.project._id || '';
        serviceType = proposal.project.category || serviceType;
    } else {
        projectId = proposal.projectId || '';
        projectTitle = proposal.projectTitle || 'Project';
    }

    const extractedData = {
        proposalId: proposal._id || proposal.id || proposal.proposalId,
        freelancerId: freelancerId,
        freelancerName: freelancerName,
        projectTitle: projectTitle,
        projectId: projectId,
        bidAmount: proposal.bidAmount || proposal.amount || proposal.totalBudget || 3000,
        estimatedTimeline: proposal.estimatedTimeline || `${proposal.estimatedDays || 30} days`,
        serviceType: serviceType,
        clientId: clientId, // From localStorage
        clientName: clientName, // From localStorage - NEVER from proposal
        status: proposal.status || 'accepted'
    };

    console.log('✅ Final extracted data:', extractedData);
    return extractedData;
};

    // Initialize form with proposal data - CORRECTED
const initializeFormData = (data) => {
    console.log('🔄 Initializing form data from:', data);

    // ⭐️ CRITICAL: Client name from localStorage (logged-in user)
    const clientName = localStorage.getItem('userName') || 'Client';
    const clientId = localStorage.getItem('userId') || data.clientId || '';
    
    console.log('✅ Client Name (from localStorage):', clientName);
    console.log('✅ Freelancer Name (from proposal):', data.freelancerName);

    // Debug: Check if names are swapped
    if (clientName === data.freelancerName) {
        console.warn('⚠️ WARNING: Client and freelancer names might be swapped!');
        console.warn(`- localStorage userName: ${localStorage.getItem('userName')}`);
        console.warn(`- Proposal freelancerName: ${data.freelancerName}`);
    }

    const initialTerms = `This Freelance Services Agreement ("Agreement") is made and entered into on ${new Date().toLocaleDateString()} between:

CLIENT: ${clientName} (ID: ${clientId})
FREELANCER: ${data.freelancerName} (ID: ${data.freelancerId})

WHEREAS, Client desires to engage Freelancer to provide services related to: ${data.projectTitle || 'Project'}

SCOPE OF WORK:
The Freelancer shall provide the following services: [Describe specific services in detail]

DELIVERABLES:
[List specific deliverables with acceptance criteria]

TERMS AND CONDITIONS:

${standardClauses.confidentiality}

${standardClauses.intellectualProperty}

${standardClauses.dataProtection}

${standardClauses.liability}

${standardClauses.termination}

${standardClauses.governingLaw}

${standardClauses.independentContractor}

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

Client: ${clientName}
Freelancer: ${data.freelancerName}`;

    const newFormData = {
        title: `${data.projectTitle || 'Project'} Contract`,
        serviceType: data.serviceType || 'Web Development',
        projectId: data.projectId || '',
        clientId: clientId, // From localStorage
        freelancerId: data.freelancerId || '',
        freelancerName: data.freelancerName,  // From proposal
        proposalId: data.proposalId || '',
        terms: initialTerms,
        totalBudget: data.bidAmount || 10000,
        timeline: data.estimatedTimeline || '30 days',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        milestoneStructure: 'Payments linked to milestone completion as specified below.',
        phases: [
            { phase: 1, title: 'Initial Planning & Design', amount: 0, status: 'pending' },
            { phase: 2, title: 'Development Phase', amount: 0, status: 'pending' },
            { phase: 3, title: 'Testing & Delivery', amount: 0, status: 'pending' }
        ]
    };

    // Calculate phase amounts
    if (newFormData.totalBudget > 0) {
        const phaseAmount = Math.floor(newFormData.totalBudget / newFormData.phases.length);
        newFormData.phases = newFormData.phases.map(phase => ({
            ...phase,
            amount: phaseAmount
        }));
    }

    setFormData(newFormData);
    console.log('✅ Form data initialized correctly:', {
        clientName: newFormData.clientName || clientName,
        freelancerName: newFormData.freelancerName,
        clientId: newFormData.clientId,
        freelancerId: newFormData.freelancerId
    });
};
    // Form handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhaseChange = (index, field, value) => {
        const updatedPhases = [...formData.phases];
        updatedPhases[index] = {
            ...updatedPhases[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            phases: updatedPhases
        }));
    };

    const addPhase = () => {
        const newPhase = {
            phase: formData.phases.length + 1,
            title: `Phase ${formData.phases.length + 1}`,
            amount: 0,
            status: 'pending'
        };
        setFormData(prev => ({
            ...prev,
            phases: [...prev.phases, newPhase]
        }));
    };

    const removePhase = (index) => {
        if (formData.phases.length > 1) {
            const updatedPhases = formData.phases.filter((_, i) => i !== index)
                .map((phase, idx) => ({ ...phase, phase: idx + 1 }));
            setFormData(prev => ({
                ...prev,
                phases: updatedPhases
            }));
        }
    };

    // Form validation
    const validateForm = () => {
        console.log('🔍 Validating form data...');

        if (!formData) {
            return { isValid: false, message: 'Form data not loaded' };
        }

        // Check required fields
        const requiredFields = [
            { field: 'title', label: 'Contract Title' },
            { field: 'freelancerId', label: 'Freelancer ID' },
            { field: 'proposalId', label: 'Proposal ID' },
            { field: 'clientId', label: 'Client ID' }
        ];

        for (const { field, label } of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return { isValid: false, message: `${label} is required` };
            }
        }

        // Check terms
        if (!formData.terms || formData.terms.trim().length < 50) {
            return { isValid: false, message: 'Terms & Conditions must be at least 50 characters long' };
        }

        // Check budget
        if (!formData.totalBudget || formData.totalBudget <= 0) {
            return { isValid: false, message: 'Please enter a valid total budget (greater than 0)' };
        }

        // Check start date
        if (!formData.startDate) {
            return { isValid: false, message: 'Please select start date' };
        }

        // Check phases
        if (formData.phases.length === 0) {
            return { isValid: false, message: 'At least one payment phase is required' };
        }

        for (const phase of formData.phases) {
            if (!phase.title || phase.title.trim() === '') {
                return { isValid: false, message: 'All phases must have a title' };
            }
            if (!phase.amount || phase.amount <= 0) {
                return { isValid: false, message: 'All phases must have a valid amount' };
            }
        }

        console.log('✅ Form validation passed');
        return { isValid: true, message: 'Form is valid' };
    };

    // Save as draft - FIXED ENDPOINT
    const handleSaveDraft = async () => {
        const validation = validateForm();
        if (!validation.isValid) {
            alert(`❌ ${validation.message}`);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            const contractData = {
                proposalId: formData.proposalId,
                freelancerId: formData.freelancerId,
                clientId: formData.clientId,
                projectId: formData.projectId,
                title: formData.title,
                serviceType: formData.serviceType,
                terms: formData.terms,
                totalBudget: formData.totalBudget,
                timeline: formData.timeline,
                startDate: formData.startDate,
                endDate: formData.endDate || calculateEndDate(formData.startDate, formData.timeline),
                milestoneStructure: formData.milestoneStructure,
                phases: formData.phases,
                status: 'draft'
            };

            console.log('📤 Saving draft contract:', contractData);

            // FIXED: Use correct contract endpoint
            const response = await axios.post(
                'http://localhost:3000/api/client/contracts',
                contractData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                alert('✅ Contract saved as draft successfully!');
                navigate('/contracts');
            } else {
                throw new Error(response.data.message || 'Failed to save draft');
            }

        } catch (error) {
            console.error('❌ Error saving draft:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(`❌ ${error.response?.data?.message || error.message || 'Failed to save contract as draft'}`);
        } finally {
            setLoading(false);
        }
    };

    // Send contract

    const handleSendContract = async () => {
        console.log('=== SEND CONTRACT BUTTON CLICKED ===');

        // 1. Validate form
        const validation = validateForm();
        if (!validation.isValid) {
            alert(`❌ ${validation.message}`);
            return;
        }

        console.log('✅ Form validated');

        // 2. SHOW SIGNATURE MODAL IMMEDIATELY
        setSignature(''); // Clear any previous signature
        setShowSignatureModal(true);

        console.log('Modal state set to true');

        // 3. Force UI update (React might batch updates)
        setTimeout(() => {
            console.log('Modal should be visible now');

            // Debug: Check if modal is in DOM
            const modal = document.querySelector('.signature-modal');
            console.log('Modal element found:', !!modal);

            if (!modal) {
                console.error('❌ Modal not found in DOM!');
                // Force create modal
                const modalContainer = document.querySelector('.create-contract-page');
                if (modalContainer) {
                    const forcedModal = document.createElement('div');
                    forcedModal.className = 'modal-overlay';
                    forcedModal.innerHTML = `
                    <div class="signature-modal">
                        <h3>EMERGENCY MODAL</h3>
                        <p>Please sign to send contract</p>
                    </div>
                `;
                    modalContainer.appendChild(forcedModal);
                    console.log('✅ Emergency modal created');
                }
            }
        }, 100);
    };
    const handleDigitalSignature = async () => {
        if (!signature.trim()) {
            alert('❌ Please provide your digital signature');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            const clientName = localStorage.getItem('userName') || 'Client';

            // ⭐️ FIRST: Save the contract as draft
            const contractData = {
                proposalId: formData.proposalId,
                freelancerId: formData.freelancerId,
                clientId: formData.clientId,
                projectId: formData.projectId,
                title: formData.title,
                serviceType: formData.serviceType,
                terms: formData.terms,
                totalBudget: formData.totalBudget,
                timeline: formData.timeline,
                startDate: formData.startDate,
                endDate: formData.endDate || calculateEndDate(formData.startDate, formData.timeline),
                milestoneStructure: formData.milestoneStructure,
                phases: formData.phases,
                clientSignature: signature,
                clientName: clientName,
                freelancerName: formData.freelancerName,
                status: 'draft' // ⭐️ Start as draft, then send
            };

            console.log('📤 Creating contract draft...', contractData);

            // ⭐️ 1. CREATE CONTRACT FIRST
            const createResponse = await axios.post(
                'http://localhost:3000/api/client/contracts',
                contractData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (createResponse.data.success) {
                const contractId = createResponse.data.contract?.contractId;

                if (!contractId) {
                    throw new Error('No contract ID returned from server');
                }

                console.log('✅ Contract created, ID:', contractId);

                // ⭐️ 2. NOW SEND THE CONTRACT TO FREELANCER
                console.log('📤 Sending contract to freelancer...');

                const sendResponse = await axios.put(
                    `http://localhost:3000/api/client/contracts/${contractId}/send`,
                    {}, // Empty body for send action
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (sendResponse.data.success) {
                    alert(`✅ Contract sent successfully to ${formData.freelancerName}! The freelancer has been notified.`);

                    // Clear localStorage backup
                    localStorage.removeItem('lastAcceptedProposal');

                    // Navigate to contracts page
                    navigate('/contracts');
                } else {
                    throw new Error(sendResponse.data.message || 'Failed to send contract');
                }

            } else {
                throw new Error(createResponse.data.message || 'Failed to create contract');
            }

        } catch (error) {
            console.error('❌ Error in contract process:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.response?.status === 400) {
                alert(`❌ Invalid data: ${error.response.data.message || 'Please check all fields'}`);
            } else if (error.response?.status === 401) {
                alert('❌ Session expired. Please login again.');
                navigate('/login');
            } else {
                alert(`❌ Failed to process contract: ${error.response?.data?.message || error.message || 'Network error'}`);
            }
        } finally {
            setLoading(false);
            setShowSignatureModal(false);
            setSignature('');
        }
    };
    // Test API connection
    const testApiConnection = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No authentication token found. Please login.');
                return;
            }

            console.log('🔍 Testing API connections...');

            // Test client proposals endpoint
            try {
                const testRes = await axios.get(
                    'http://localhost:3000/api/client/proposals',
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                console.log('✅ Client proposals endpoint works:', testRes.data);
            } catch (error) {
                console.error('❌ Client proposals endpoint failed:', error.response?.status);
            }

            // Test specific proposal if we have ID
            if (proposalId) {
                try {
                    const testRes2 = await axios.get(
                        `http://localhost:3000/api/client/proposals/${proposalId}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    console.log('✅ Single proposal endpoint works:', testRes2.data);
                } catch (error) {
                    console.error('❌ Single proposal endpoint failed:', {
                        status: error.response?.status,
                        data: error.response?.data
                    });
                }
            }

            // Test contracts endpoint
            try {
                const testRes3 = await axios.get(
                    'http://localhost:3000/api/contracts/client/contracts',
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                console.log('✅ Client contracts endpoint works:', testRes3.data);
            } catch (error) {
                console.error('❌ Client contracts endpoint failed:', error.response?.status);
            }

            alert('✅ API tests completed. Check console for details.');
        } catch (error) {
            console.error('API test failed:', error);
            alert(`❌ API test failed: ${error.message}`);
        }
    };

    // Helper functions
    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const calculateEndDate = (startDate, timeline) => {
        const days = parseInt(timeline) || 30;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        return endDate.toISOString().split('T')[0];
    };

    // Loading state
    if (dataStatus.loading) {
        return (
            <div className="create-contract-page">
                <div className="contract-container">
                    <div className="loading-state">
                        <FaSpinner className="spinner-icon" />
                        <p>Loading contract data...</p>
                        <small>Checking for proposal information...</small>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (!dataStatus.valid) {
        return (
            <div className="create-contract-page">
                <div className="contract-container">
                    <div className="contract-header">
                        <button
                            className="back-navigation"
                            onClick={() => navigate('/proposals')}
                        >
                            <FaArrowLeft />
                            Back to Proposals
                        </button>
                        <div className="header-content">
                            <h1 className="page-title">Create New Contract</h1>
                            <p className="page-subtitle">Unable to load proposal data</p>
                        </div>
                    </div>

                    <div className="data-error">
                        <FaExclamationTriangle className="error-icon" />
                        <h3>Unable to Create Contract</h3>
                        <p>{dataStatus.error || 'Missing proposal information'}</p>
                        <p>Please accept a proposal first from the Proposals page to create a contract.</p>

                        <div className="action-buttons">
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/proposals')}
                            >
                                ← Go to Proposals
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate('/contracts')}
                            >
                                View Existing Contracts
                            </button>
                            <button
                                className="btn-test"
                                onClick={testApiConnection}
                            >
                                Test API Connection
                            </button>
                        </div>
                        {/* Emergency Debug Section */}
                        <div className="emergency-debug">
                            <button
                                className="btn-debug"
                                onClick={() => {
                                    console.log('🚨 EMERGENCY DEBUG - Forcing modal to show');
                                    console.log('Current state:', {
                                        showSignatureModal,
                                        formData: {
                                            freelancerName: formData.freelancerName,
                                            totalBudget: formData.totalBudget
                                        },
                                        signature
                                    });

                                    // Force modal to show
                                    setShowSignatureModal(true);

                                    // Force immediate re-render
                                    setTimeout(() => {
                                        console.log('After force - showSignatureModal:', showSignatureModal);

                                        // Check if modal element exists
                                        const modal = document.querySelector('.modal-overlay');
                                        console.log('Modal element in DOM:', !!modal);
                                        console.log('Modal display style:', modal?.style?.display);
                                        console.log('Modal opacity:', modal?.style?.opacity);

                                        // Force it to be visible
                                        if (modal) {
                                            modal.style.display = 'flex';
                                            modal.style.opacity = '1';
                                            console.log('✅ Forced modal to be visible');
                                        }
                                    }, 50);
                                }}
                            >
                                🚨 EMERGENCY: Force Modal & Check
                            </button>
                        </div>
                        {dataStatus.error && (
                            <div className="debug-info">
                                <p><strong>Debug Information:</strong></p>
                                <ul>
                                    <li><small>URL Proposal ID: {urlProposalId || 'none'}</small></li>
                                    <li><small>Location State: {location.state ? 'present' : 'empty'}</small></li>
                                    <li><small>LocalStorage backup: {localStorage.getItem('lastAcceptedProposal') ? 'present' : 'none'}</small></li>
                                    <li><small>User Token: {localStorage.getItem('token') ? 'present' : 'missing'}</small></li>
                                    <li><small>Error: {dataStatus.error}</small></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="create-contract-page">
            <div className="contract-container">
                {/* Header */}
                <div className="contract-header">
                    <button
                        className="back-navigation"
                        onClick={() => navigate('/contracts')}
                    >
                        <FaArrowLeft />
                        Back to Contracts
                    </button>
                    <div className="header-content">
                        <h1 className="page-title">Create New Contract</h1>
                        <p className="page-subtitle">
                            Creating contract with {formData.freelancerName}
                            {proposalData && ` (from proposal: ${proposalData.proposalId?.substring(0, 8)}...)`}
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="progress-tracker">
                    <div className="tracker-container">
                        <div className="tracker-steps">
                            {[
                                { number: 1, label: 'Basic Info', icon: FaFileContract },
                                { number: 2, label: 'Terms & Conditions', icon: FaFileAlt },
                                { number: 3, label: 'Payment Schedule', icon: FaDollarSign },
                                { number: 4, label: 'Review & Sign', icon: FaSignature }
                            ].map((step, index) => {
                                const StepIcon = step.icon;
                                const isCompleted = currentStep > step.number;
                                const isActive = currentStep === step.number;
                                const isUpcoming = currentStep < step.number;

                                return (
                                    <div key={step.number} className={`tracker-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
                                        <div className="step-content">
                                            <div className="step-indicator">
                                                <div className="step-icon">
                                                    <StepIcon />
                                                </div>
                                                {isCompleted && (
                                                    <div className="step-checkmark">
                                                        <FaCheck />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="step-text">
                                                <span className="step-label">{step.label}</span>
                                            </div>
                                        </div>
                                        {index < 3 && <div className="step-connector"></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Contract Form */}
                <div className="contract-form">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h2>Basic Contract Information</h2>

                            <div className="info-card">
                                <h4>Contract Details</h4>
                                <p><strong>Freelancer:</strong> {formData.freelancerName}</p>
                                <p><strong>Project:</strong> {proposalData?.projectTitle || 'Project'}</p>
                                <p><strong>Proposal ID:</strong> {formData.proposalId?.substring(0, 12)}...</p>
                                {proposalData?.bidAmount && (
                                    <p><strong>Original Bid:</strong> ₹{proposalData.bidAmount.toLocaleString()}</p>
                                )}
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Contract Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., E-commerce Website Development"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Service Type *</label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                                    >
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile App Development">Mobile App Development</option>
                                        <option value="Software Development">Software Development</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                        <option value="Digital Marketing">Digital Marketing</option>
                                        <option value="IT Consulting">IT Consulting</option>
                                        <option value="Data Analysis">Data Analysis</option>
                                        <option value="Content Writing">Content Writing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Total Budget (INR) *</label>
                                    <div className="input-with-symbol">
                                        <span className="currency-symbol">₹</span>
                                        <input
                                            type="number"
                                            value={formData.totalBudget}
                                            onChange={(e) => handleInputChange('totalBudget', parseFloat(e.target.value) || 0)}
                                            placeholder="Enter total contract value"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Timeline *</label>
                                    <input
                                        type="text"
                                        value={formData.timeline}
                                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                                        placeholder="e.g., 30 days, 2 months"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => {
                                            handleInputChange('startDate', e.target.value);
                                            if (formData.timeline) {
                                                const endDate = calculateEndDate(e.target.value, formData.timeline);
                                                handleInputChange('endDate', endDate);
                                            }
                                        }}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate || calculateEndDate(formData.startDate, formData.timeline)}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" onClick={() => navigate('/contracts')}>
                                    Cancel
                                </button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Next: Terms & Conditions
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Terms & Conditions */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2>Terms & Conditions</h2>
                            <p className="step-description">
                                Standard Indian IT service clauses are included. You can modify the terms as needed.
                            </p>

                            <div className="form-group">
                                <label>Contract Terms & Conditions *</label>
                                <textarea
                                    value={formData.terms}
                                    onChange={(e) => handleInputChange('terms', e.target.value)}
                                    rows="20"
                                    placeholder="Enter detailed terms and conditions..."
                                    required
                                />
                            </div>

                            <div className="standard-clauses">
                                <h4>Standard Clauses (Click to Add)</h4>
                                <div className="clauses-list">
                                    {Object.entries(standardClauses).map(([key, clause]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className="clause-btn"
                                            onClick={() => handleInputChange('terms', formData.terms + '\n\n' + clause)}
                                        >
                                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" onClick={prevStep}>
                                    Previous
                                </button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Next: Payment Schedule
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment Schedule */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2>Payment Schedule & Milestones</h2>

                            <div className="form-group">
                                <label>Milestone Structure Description</label>
                                <textarea
                                    value={formData.milestoneStructure}
                                    onChange={(e) => handleInputChange('milestoneStructure', e.target.value)}
                                    rows="4"
                                    placeholder="Describe how payments are linked to milestones..."
                                />
                            </div>

                            <div className="phases-section">
                                <div className="section-header">
                                    <h4>Payment Phases</h4>
                                    <button type="button" className="btn-add-phase" onClick={addPhase}>
                                        <FaPlus />
                                        Add Phase
                                    </button>
                                </div>

                                {formData.phases.map((phase, index) => (
                                    <div key={index} className="phase-card">
                                        <div className="phase-header">
                                            <h5>Phase {phase.phase}</h5>
                                            {formData.phases.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove-phase"
                                                    onClick={() => removePhase(index)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                        <div className="phase-fields">
                                            <div className="form-group">
                                                <label>Phase Title</label>
                                                <input
                                                    type="text"
                                                    value={phase.title}
                                                    onChange={(e) => handlePhaseChange(index, 'title', e.target.value)}
                                                    placeholder="e.g., Design Phase, Development Phase"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Amount (INR)</label>
                                                <div className="input-with-symbol">
                                                    <span className="currency-symbol">₹</span>
                                                    <input
                                                        type="number"
                                                        value={phase.amount}
                                                        onChange={(e) => handlePhaseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="payment-summary">
                                    <h4>Payment Summary</h4>
                                    <p>Total Budget: <strong>₹{formData.totalBudget.toLocaleString()}</strong></p>
                                    <p>Allocated to Phases: <strong>₹{formData.phases.reduce((sum, phase) => sum + phase.amount, 0).toLocaleString()}</strong></p>
                                    <p>Balance: <strong>₹{(formData.totalBudget - formData.phases.reduce((sum, phase) => sum + phase.amount, 0)).toLocaleString()}</strong></p>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" onClick={prevStep}>
                                    Previous
                                </button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Next: Review & Sign
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Sign */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <h2>Review Contract & Sign</h2>

                            <div className="contract-preview">
                                <div className="preview-section">
                                    <h4>Contract Overview</h4>
                                    <div className="preview-grid">
                                        <div><strong>Title:</strong> {formData.title}</div>
                                        <div><strong>Service Type:</strong> {formData.serviceType}</div>
                                        <div><strong>Total Budget:</strong> ₹{formData.totalBudget.toLocaleString()}</div>
                                        <div><strong>Timeline:</strong> {formData.timeline}</div>
                                        <div><strong>Start Date:</strong> {formData.startDate}</div>
                                        <div><strong>End Date:</strong> {formData.endDate || calculateEndDate(formData.startDate, formData.timeline)}</div>
                                        <div><strong>Freelancer:</strong> {formData.freelancerName}</div>
                                        <div><strong>Client:</strong> {localStorage.getItem('userName') || 'You'}</div>
                                        <div><strong>Proposal ID:</strong> {formData.proposalId?.substring(0, 16)}...</div>
                                    </div>
                                </div>

                                <div className="preview-section">
                                    <h4>Payment Phases</h4>
                                    {formData.phases.map((phase, index) => (
                                        <div key={index} className="phase-preview">
                                            <strong>Phase {phase.phase}:</strong> {phase.title} - ₹{phase.amount.toLocaleString()}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="debug-section">
                                <button
                                    type="button"
                                    className="btn-debug"
                                    onClick={() => {
                                        console.log('DEBUG: Modal state -', showSignatureModal);
                                        console.log('Forcing modal to show...');
                                        setShowSignatureModal(true);

                                        // Force CSS update
                                        setTimeout(() => {
                                            const modal = document.querySelector('.modal-overlay');
                                            if (modal) {
                                                modal.style.display = 'flex';
                                                modal.style.opacity = '1';
                                                modal.style.visibility = 'visible';
                                                console.log('✅ Modal CSS forced');
                                            }
                                        }, 50);
                                    }}
                                >
                                    🚨 DEBUG: Force Show Signature Modal
                                </button>
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" onClick={prevStep}>
                                    Previous
                                </button>
                                <button
                                    className="btn-draft"
                                    onClick={handleSaveDraft}
                                    disabled={loading}
                                >
                                    <FaSave />
                                    {loading ? 'Saving...' : 'Save as Draft'}
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSendContract}
                                    disabled={loading}
                                >
                                    <FaPaperPlane />
                                    {loading ? 'Sending...' : 'Send Contract'}
                                </button>
                            </div>
                        </div>
                    )}
                </div> {/* ⭐️ This closes .contract-form ⭐️ */}
            </div> {/* ⭐️ This closes .contract-container ⭐️ */}

            {/* ===== SIGNATURE MODAL ===== */}
            {/* ⭐️⭐️⭐️ MUST BE OUTSIDE ALL CONTAINERS ⭐️⭐️⭐️ */}
            {showSignatureModal && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        // Close only if clicking the overlay background
                        if (e.target.classList.contains('modal-overlay')) {
                            setShowSignatureModal(false);
                        }
                    }}
                >
                    <div
                        className="signature-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            display: 'block',
                            opacity: 1,
                            visibility: 'visible',
                            position: 'relative'
                        }}
                    >
                        <div className="modal-header">
                            <h3>Digital Signature Required</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowSignatureModal(false)}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-content">
                            <div className="signature-alert">
                                <strong>Contract Summary:</strong>
                                <p>You are sending a contract to <strong>{formData.freelancerName || 'Freelancer'}</strong></p>
                                <p>Amount: ₹{formData.totalBudget?.toLocaleString() || '0'}</p>
                            </div>

                            <div className="signature-pad">
                                <label>Type your full name as digital signature *</label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    placeholder="Enter your full name exactly"
                                    className="signature-input"
                                    disabled={loading}
                                    autoFocus
                                />
                                <p className="signature-hint">
                                    This will serve as your legally binding digital signature
                                </p>
                            </div>

                            <div className="signature-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowSignatureModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handleDigitalSignature}
                                    disabled={loading || !signature.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="spinner-icon" />
                                            Signing...
                                        </>
                                    ) : (
                                        <>
                                            <FaSignature />
                                            Sign & Send Contract
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ===== END SIGNATURE MODAL ===== */}

            {/* Emergency test button - Keep at very bottom */}
            <div className="emergency-debug">
                <button
                    className="btn-debug"
                    onClick={() => {
                        console.log('🚨 EMERGENCY: Manually showing modal');
                        setShowSignatureModal(true);

                        // Force DOM update
                        setTimeout(() => {
                            // Create modal if doesn't exist
                            let modal = document.querySelector('.modal-overlay');
                            if (!modal) {
                                console.log('Creating emergency modal...');
                                const page = document.querySelector('.create-contract-page');
                                if (page) {
                                    page.insertAdjacentHTML('beforeend', `
                            <div class="modal-overlay" style="
                                position: fixed !important;
                                top: 0 !important;
                                left: 0 !important;
                                right: 0 !important;
                                bottom: 0 !important;
                                background: rgba(0,0,0,0.7) !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                z-index: 999999 !important;
                            ">
                                <div class="signature-modal" style="
                                    background: white !important;
                                    padding: 30px !important;
                                    border-radius: 12px !important;
                                    max-width: 500px !important;
                                    width: 90% !important;
                                ">
                                    <h3>Emergency Modal</h3>
                                    <p>Modal created manually!</p>
                                </div>
                            </div>
                        `);
                                    console.log('✅ Emergency modal created');
                                }
                            }
                        }, 100);
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        zIndex: 999998
                    }}
                >
                    🚨 EMERGENCY MODAL TEST
                </button>
            </div>
        </div>
    );
};

export default CreateContractPage;