import React, { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa';
import './Testimonials.css';
  import video1 from '../assets/videos/Woman-feedback-1.mp4'
  import video2 from '../assets/videos/man-feedback-2.mp4'
  import video3 from '../assets/videos/Woman-feedback-2.mp4'
  import video4 from '../assets/videos/Man-feedback-1.mp4'
  import video5 from '../assets/videos/Woman-feedback-3.mp4'
  import video6 from '../assets/videos/Man-feedback-3.mp4'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);


  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      service: "Website Building",
      text: "The website they built exceeded our expectations. User engagement increased by 45% in the first month!",
      videoUrl: video1,
      rating: 5
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Startup Founder",
      company: "InnovateLabs",
      service: "Digital Marketing",
      text: "Our online presence transformed completely. ROI increased by 300% in just 3 months!",
      videoUrl: video2,
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Creative Director",
      company: "Design Studio Co.",
      service: "Graphic Design",
      text: "Their designs perfectly captured our brand identity. The visual assets boosted our social media engagement by 200%.",
      videoUrl: video3,
      rating: 4
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Content Manager",
      company: "Media Solutions",
      service: "Content Writing",
      text: "The content strategy and writing services helped us rank #1 for multiple keywords. Quality is exceptional!",
      videoUrl: video4,
      rating: 5
    },
    {
      id: 5,
      name: "Priya Sharma",
      role: "Video Producer",
      company: "Creative Media",
      service: "Video Editing",
      text: "Their video editing team turned our raw footage into compelling stories. Client satisfaction skyrocketed!",
      videoUrl: video5,
      rating: 5
    },
    {
      id: 6,
      name: "James Wilson",
      role: "E-commerce Manager",
      company: "ShopOnline",
      service: "SEO Services",
      text: "Organic traffic increased by 400% after implementing their SEO strategy. Absolutely phenomenal results!",
      videoUrl: video6,
      rating: 4
    }
  ];

  const testimonialsPerView = 3;
  const maxIndex = Math.ceil(testimonials.length / testimonialsPerView) - 1;

  useEffect(() => {
    // Auto-play all visible videos
    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.play().catch(error => {
          console.log('Auto-play prevented:', error);
        });
        video.loop = true;
        video.muted = true;
      }
    });
  }, [currentIndex]);


   useEffect(()=>{
const observer= new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add('in-view')
        }
    })
},{threshold:0.3})
const section = document.querySelector('.testimonials')
if(section){
    observer.observe(section)
}
return ()=>{
    if(section){
        observer.unobserve(section)
    }
}
  },[])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const getVisibleTestimonials = () => {
    const startIndex = currentIndex * testimonialsPerView;
    return testimonials.slice(startIndex, startIndex + testimonialsPerView);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={index < rating ? 'star filled' : 'star'} 
      />
    ));
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <h2 className="section-titles">What Our Clients Say</h2>
        <p className="section-subtitle">Real stories from businesses we've helped grow</p>
        
        <div className="testimonials-carousel-container">
          <button className="carousel-btn prev" onClick={prevTestimonial}>
            <FaChevronLeft />
          </button>
          
          <div className="testimonials-grid">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="video-container">
                  <video
                    ref={el => videoRefs.current[index] = el}
                    className="testimonial-video"
                    muted
                    loop
                    playsInline
                  >
                    <source src={testimonial.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Testimonial Box Overlay */}
                  <div className="testimonial-overlay">
                    <div className="companys-logo">
                      {testimonial.company.split(' ')[0]}
                    </div>
                    <div className="testimonial-quote">
                      "{testimonial.text}"
                    </div>
                    <div className="testimonial-footer">
                      <div className="client-info">
                        <div className="client-name">{testimonial.name}</div>
                        <div className="client-role">{testimonial.role}</div>
                      </div>
                      <div className="rating-stars">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                    <div className="service-tag">
                      {testimonial.service}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-btn next" onClick={nextTestimonial}>
            <FaChevronRight />
          </button>
        </div>

        <div className="carousel-indicators">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>

        <div className="services-showcase">
          <h3>Perfect Solutions for Every Business</h3>
          <p className="services-subtitle">Get started fast with out-of-the-box solutions. Easily customize as your business grows!</p>
          <div className="services-grid">
            {['Website Building', 'Digital Marketing', 'Graphic Design', 'Content Writing', 'Video Editing', 'SEO Services'].map((service) => (
              <div key={service} className="service-item">
                {service}
              </div>
            ))}
          </div>
          
           <a href='/' className='show'>Show more</a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;