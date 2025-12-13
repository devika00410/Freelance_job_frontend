import React from 'react';
import {
  // Web & Development
  FaCode,
  FaServer,
  FaDatabase,
  FaHtml5,
  FaJsSquare,
  FaReact,
  FaNodeJs,
  
  // Design & Creative
  FaPalette,
  FaPencilRuler,
  FaPaintBrush,
  FaImage,
  FaVideo,
  
  // Mobile & Apps
  FaMobileAlt,
  FaTabletAlt,
  FaAndroid,
  FaApple,
  
  // Content & Writing
  FaPenAlt,
  FaFileAlt,
  FaEdit,
  FaNewspaper,
  FaBlog,
  
  // Marketing & Business
  FaChartLine,
  FaBullhorn,
  FaShoppingCart,
  FaAd,
  FaHashtag,
  
  // Virtual & Support
  FaUserTie,
  FaHeadset,
  FaCalendarAlt,
  FaInbox,
  
  // SEO & Analytics
  FaSearch,
  FaChartBar,
  FaGoogle,
  
  // General
  FaStar,
  FaCheckCircle,
  FaRocket,
  FaUsers,
  FaGlobe,
  FaClock,
  FaDollarSign
} from 'react-icons/fa';

// React Icons Map
const iconMap = {
  // Web Development
  'web-development': FaCode,
  'backend-development': FaServer,
  'database-design': FaDatabase,
  'frontend-development': FaHtml5,
  'javascript-development': FaJsSquare,
  'react-development': FaReact,
  'nodejs-development': FaNodeJs,
  
  // UI/UX Design
  'ui-ux-design': FaPalette,
  'graphic-design': FaPaintBrush,
  'logo-design': FaImage,
  'branding': FaPencilRuler,
  'illustration': FaImage,
  
  // Mobile Development
  'mobile-app-development': FaMobileAlt,
  'ios-development': FaApple,
  'android-development': FaAndroid,
  'flutter-development': FaMobileAlt,
  'react-native': FaMobileAlt,
  
  // Content Services
  'content-writing': FaPenAlt,
  'copywriting': FaFileAlt,
  'blog-writing': FaBlog,
  'technical-writing': FaEdit,
  'proofreading': FaEdit,
  
  // Marketing
  'digital-marketing': FaBullhorn,
  'social-media-marketing': FaHashtag,
  'seo': FaSearch,
  'email-marketing': FaInbox,
  'ppc-advertising': FaAd,
  
  // Virtual Assistance
  'virtual-assistance': FaUserTie,
  'administrative-support': FaHeadset,
  'data-entry': FaEdit,
  'customer-support': FaHeadset,
  'project-management': FaCalendarAlt,
  
  // Business
  'business-consulting': FaChartLine,
  'market-research': FaChartBar,
  'ecommerce': FaShoppingCart,
  
  // Default
  'default': FaStar
};

// Get React Icon Component
export const getServiceIcon = (serviceId, props = {}) => {
  const IconComponent = iconMap[serviceId] || iconMap['default'];
  const defaultProps = {
    className: "service-icon",
    size: 24,
    color: "#0284c7",
    ...props
  };
  return React.createElement(IconComponent, defaultProps);
};

// React Component for Service Icons
export const ServiceIcon = ({ serviceId, className = "service-icon", size = 24, color = "#0284c7" }) => {
  const IconComponent = iconMap[serviceId] || iconMap['default'];
  return <IconComponent className={className} size={size} color={color} />;
};

// For Service Cards (with consistent styling)
export const ServiceCardIcon = ({ serviceId }) => {
  const IconComponent = iconMap[serviceId] || iconMap['default'];
  return (
    <div className="service-card-icon-wrapper">
      <IconComponent 
        className="service-card-icon"
        size={32}
        color="#0284c7"
      />
    </div>
  );
};

// Hero/Featured Service Icon (larger)
export const FeaturedServiceIcon = ({ serviceId }) => {
  const IconComponent = iconMap[serviceId] || iconMap['default'];
  return (
    <div className="featured-service-icon-wrapper">
      <IconComponent 
        className="featured-service-icon"
        size={48}
        color="#ffffff"
      />
    </div>
  );
};

// Small icon for lists/compact views
export const SmallServiceIcon = ({ serviceId }) => {
  const IconComponent = iconMap[serviceId] || iconMap['default'];
  return <IconComponent size={16} color="#64748b" />;
};

// Utility: Get icon name for debugging
export const getIconName = (serviceId) => {
  return Object.keys(iconMap).find(key => key === serviceId) || 'default';
};

// Export all available icons for reference
export const AVAILABLE_ICONS = Object.keys(iconMap);

// Default export
export default {
  getServiceIcon,
  ServiceIcon,
  ServiceCardIcon,
  FeaturedServiceIcon,
  SmallServiceIcon,
  getIconName,
  AVAILABLE_ICONS
};