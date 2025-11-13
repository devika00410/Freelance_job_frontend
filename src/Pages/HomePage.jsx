// Pages/HomePage.jsx
import HeroSection from '../HomeComponents/HeroSection'

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
    </div>
  )
}

export default HomePage