import { useState,useEffect } from "react";
import{
    FaFileAlt,
    FaUsers,
    FaCheckCircle,
    FaCreditCard,
    FaUserTie,
    FaSearch,
    FaPaperPlane,
    FaMoneyBillWave,
    FaRocket
} from 'react-icons/fa'
import './HowWorks.css'
const HowWorks=()=>{
    const[activeView,setActiveView] = useState('client')
    const clientSteps = [
    {
      title: "Post Your Project",
      description: "Describe your needs and set your budget. It's free to post.",
      icon: <FaFileAlt className="step-icon" />
    },
    {
      title: "Review Proposals",
      description: "Compare freelancer profiles, ratings, and proposals.",
      icon: <FaUsers className="step-icon" />
    },
    {
      title: "Hire the Best Fit",
      description: "Interview candidates and hire your preferred freelancer.",
      icon: <FaCheckCircle className="step-icon" />
    }, {
      title: "Pay Securely",
      description: "Release payment only when work is completed to your satisfaction.",
      icon: <FaCreditCard className="step-icon" />
    }
  ];



const freelancerSteps = [
    {
      title: "Create Your Profile",
      description: "Showcase your skills, portfolio, and experience.",
      icon: <FaUserTie className="step-icon" />
    },
    {
      title: "Find Ideal Projects",
      description: "Browse jobs that match your expertise and interests.",
      icon: <FaSearch className="step-icon" />
    },
    {
      title: "Submit Winning Proposals",
      description: "Stand out with tailored proposals and competitive bids.",
      icon: <FaPaperPlane className="step-icon" />
    },  {
      title: "Get Paid for Great Work",
      description: "Deliver quality work and receive secure payments.",
      icon: <FaMoneyBillWave className="step-icon" />
    }
  ];

  const handleViewChange=(view)=>{
    setActiveView(view)
  }
//   Scroll animation handler
  useEffect(()=>{
const observer= new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add('in-view')
        }
    })
},{threshold:0.3})
const section = document.querySelector('.how-it-works')
if(section){
    observer.observe(section)
}
return ()=>{
    if(section){
        observer.unobserve(section)
    }
}
  },[])

//   const currentSteps=activeView === 'client' ? clientSteps:freelancerSteps

  return(
    <section className="how-it-works">
<div className="container">
    <h2 className="section-title">How It Works</h2>

    <div className="view-toggle">
        <button className={`toggle-btn ${activeView === 'client' ? 'active': ''}`}
        onClick={()=>handleViewChange('client')}>For Clients</button>

        <button className={`toggle-btn ${activeView === 'freelancer' ? 'active': ''}`}
        onClick={()=>handleViewChange('freelancer')}>For Freelancer</button>
    </div>


    <div className="steps-container">
        {(activeView === 'client' ? clientSteps:freelancerSteps).map((step,index)=>(
            <div  key={index} className="step-card">
{/* <div className="steps-number">{index+1}</div> */}
<div className="steps-icon-wrapper">
    {step.icon}
</div>
<h3 className="steps-title">{step.title}</h3>
<p className="steps-description">{step.description}</p>
            </div>

        ))}
    </div>
    <div className="promo-banner">
        <div className="promo-icon">
            <FaRocket/>
        </div>
        <h3>Special Offer for New Clients</h3>
        <p> Get $800 in credit when you spend $1000 as a new Business Plus member.</p>
        <button className="cta-button">Get Started</button>
        <div className="promo-content">
            
        </div>
    </div>
</div>
    </section>
  )
}

export default HowWorks;