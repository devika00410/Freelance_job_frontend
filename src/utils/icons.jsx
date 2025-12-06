import { 
    FaCode, FaPalette, FaMobileAlt, FaPenAlt, 
    FaPaintBrush, FaSearch, FaBullhorn, 
    FaAssistiveListeningSystems, FaFileAlt 
} from 'react-icons/fa';

export const SERVICE_ICONS = {
    'web-development': FaCode,
    'ui-ux-design': FaPalette,
    'mobile-app-development': FaMobileAlt,
    'content-writing': FaPenAlt,
    'graphic-design': FaPaintBrush,
    'seo': FaSearch,
    'digital-marketing': FaBullhorn,
    'virtual-assistance': FaAssistiveListeningSystems,
    'copywriting': FaFileAlt
};

export const getServiceIcon = (serviceId) => {
    const IconComponent = SERVICE_ICONS[serviceId] || FaCode;
    return <IconComponent className="service-icon" />;
};