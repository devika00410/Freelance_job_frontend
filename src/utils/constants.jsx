export const SERVICES = [
    'web-development',
    'ui-ux-design',
    'mobile-app-development',
    'content-writing',
    'graphic-design',
    'seo',
    'digital-marketing',
    'virtual-assistance',
    'copywriting'
];

export const SERVICE_NAMES = {
    'web-development': 'Web Development',
    'ui-ux-design': 'UI/UX Design',
    'mobile-app-development': 'Mobile App Development',
    'content-writing': 'Content Writing',
    'graphic-design': 'Graphic Design',
    'seo': 'SEO Services',
    'digital-marketing': 'Digital Marketing',
    'virtual-assistance': 'Virtual Assistance',
    'copywriting': 'Copywriting'
};

export const FILTER_OPTIONS = {
    experienceLevel: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'expert', label: 'Expert' }
    ],
    availability: [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'not-available', label: 'Not Available' }
    ],
    sortBy: [
        { value: 'popularity', label: 'Most Popular' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'rate-low', label: 'Rate: Low to High' },
        { value: 'rate-high', label: 'Rate: High to Low' },
        { value: 'projects', label: 'Most Projects' }
    ]
};

export const PRICE_RANGES = [
    { min: 0, max: 25, label: 'Under $25/hr' },
    { min: 25, max: 50, label: '$25 - $50/hr' },
    { min: 50, max: 100, label: '$50 - $100/hr' },
    { min: 100, max: 200, label: '$100+/hr' }
];