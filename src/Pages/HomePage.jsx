// Pages/HomePage.jsx
import HeroSection from '../HomeComponents/HeroSection'
import HowWorks from '../HomeComponents/HowWorks'
import IndustryInnovation from '../HomeComponents/IndustryInnovation'
import ProjectMatchmaker from '../HomeComponents/ProjectMatchMaker'
import Stats from '../HomeComponents/Stats'
import SuccessStories from '../HomeComponents/SuccessStories'
import Testimonials from '../HomeComponents/Testimonials'

const HomePage = () => {
  console.log('HomePage is rendering') // Check if this logs in browser console
  
  return (
    <div className="homepage" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Simple test to see if HomePage works */}
      {/* <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>HomePage is working!</h1>
        <p>If you can see this, then HomePage is rendering correctly.</p>
      </div>
       */}
      {/* Comment out HeroSection for now */}
      <HeroSection />
      <HowWorks/>
       <Stats/>
       <br></br>
      <Testimonials/>
      <ProjectMatchmaker/>
      <IndustryInnovation/>
      <SuccessStories/>
    </div>
  )
}

export default HomePage