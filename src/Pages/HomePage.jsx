import HeroSection from '../HomeComponents/HeroSection'
import HowWorks from '../HomeComponents/HowWorks'
import IndustryInnovation from '../HomeComponents/IndustryInnovation'
import ProjectMatchmaker from '../HomeComponents/ProjectMatchMaker'
import Stats from '../HomeComponents/Stats'
import SuccessStories from '../HomeComponents/SuccessStories'
import Testimonials from '../HomeComponents/Testimonials'
import AboutSnippet from '../HomeComponents/AboutSnippet'
import HomeCommunitySection from '../HomeComponents/HomeCommunitySection'
import HomeFaqSnippet from '../HomeComponents/HomeFaqSnippet'
import HomepageQuote from '../HomeComponents/HomePageQuote'

const HomePage = () => {
  console.log('HomePage is rendering') 
  
  return (
    <div className="homepage" style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      <HeroSection />
      <HowWorks/>
       <Stats/>
       <br></br>
      <Testimonials/>
      
      <AboutSnippet/>
      <ProjectMatchmaker/>
      <HomeCommunitySection/>
      <HomepageQuote/>
      <br></br>
      <HomeFaqSnippet/>
      

    </div>
  )
}

export default HomePage