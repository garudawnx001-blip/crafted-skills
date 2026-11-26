// All client copy below is taken word for word from craftedskills.in (Nov 2026).
// Only labels/microcopy needed by the new platform (buttons, dashboard labels) are new.

export const SITE = {
  name: 'Crafted Skills',
  altNames: ['CraftedSkills', 'Crafted Skill', 'Craftedskills.in', 'Crafted Skills Karnataka'],
  kannadaLine: 'ನಿಮ್ಮ ಕನಸುಗಳಿಗೆ ಹೊಸ ದಾರಿ!',
  tagline: 'LEARN · CREATE · GROW',
  email: 'hello.Craftedskills@gmail.com',
  phone: '+91 9008017290',
  phoneRaw: '919008017290',
  facebook: 'https://www.facebook.com/share/19bC5aq82Y/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/craftedskillsofficial',
  // Affiliate commission is not published by the client yet. Set a number (e.g. 30) once confirmed.
  commissionPercent: null as number | null,
}

export const HOME = {
  heroTitle: 'Learn Digital Skills in Kannada and Build Your Dreams from Home.',
  heroIntro:
    "Discover practical digital skills with Crafted Skills. Learn in Kannada, build your confidence, and explore new opportunities from the comfort of your home. Whether you're a homemaker, beginner,or aspiring entrepreneur, your journey starts here.",
  introTitle: 'Skills That Open New Possibilities',
  introText:
    'At Crafted Skills, we believe learning should be accessible, practical, and easy to understand. We offer digital-skills learning in Kannada to help people take their first steps, discover what they can do, and move towards their personal and professional goals.',
  aboutTitle: 'About Crafted Skills :',
  aboutLines: [
    'A learning platform built to make digital skills accessible in Kannada.',
    'We help homemakers, beginners and aspiring entrepreneurs build practical skills, confidence and explore new possibilities.',
  ],
  aboutTiles: ['Learning in Kannada', 'Practical Skills', 'New Possibilities'],
  closingTitle: 'Your Dreams Deserve A Chance',
  closingText:
    'Every new skill is a step towards new possibilities. Start learning in Kannada and discover what you can create from the comfort of your home.',
}

export const WHY = [
  { t: 'Learn in Kannada', d: 'Understand digital skills in a language that feels familiar and comfortable.' },
  { t: 'Beginner-Friendly', d: 'Take your first steps into digital learning without feeling overwhelmed.' },
  { t: 'Practical Learning', d: 'Focus on developing useful skills you can explore and practise.' },
  { t: 'Explore New Possibilities', d: 'Build confidence as you discover opportunities for personal and professional growth.' },
]

export const WHO = [
  { t: 'Homemakers', d: 'Make time for your own learning while balancing family responsibilities.', icon: 'home' },
  { t: 'Students & Beginners', d: 'Start learning and build your knowledge step by step.', icon: 'cap' },
  { t: 'Working Professionals', d: 'Explore additional skills for your personal and professional growth.', icon: 'case' },
  { t: 'Aspiring Entrepreneurs', d: 'Discover practical skills to support your business ambitions.', icon: 'idea' },
]

export type Course = { name: string; status: 'Available now' | 'Coming Soon' }
export type Bundle = { slug: string; name: string; price: number; image: string; tint: string; courses: Course[] }

const c = (name: string, live = false): Course => ({ name, status: live ? 'Available now' : 'Coming Soon' })

export const BUNDLES: Bundle[] = [
  { slug: 'crafted-digital-commerce', name: 'Crafted Digital Commerce', price: 1999, image: 'img/b-digital-commerce.webp', tint: '#cbb8ff',
    courses: [c('Video Editing'), c('Affiliate Marketing'), c('Digital Marketing')] },
  { slug: 'crafted-creators-studio', name: 'Crafted Creators Studio', price: 3499, image: 'img/b-creators-studio.webp', tint: '#ffe2a8',
    courses: [c('Graphic Designing', true), c('UGC'), c('Whishlink'), c('Personality Development')] },
  { slug: 'crafted-handmade-business', name: 'Crafted Handmade Business', price: 5999, image: 'img/b-handmade-business.webp', tint: '#cfe6c8',
    courses: [c('Soap Making'), c('Candle Making'), c('Handmade Jewels')] },
  { slug: 'crafted-venture', name: 'Crafted Venture', price: 8499, image: 'img/b-venture.webp', tint: '#ffc9df',
    courses: [c('Baking'), c('Mushroom Farming'), c('Drop Shipping'), c('Saree Business')] },
  { slug: 'crafted-career-and-finance', name: 'Crafted Career and Finance', price: 10999, image: 'img/b-career-finance.webp', tint: '#d6c6ff',
    courses: [c('Facebook Ads', true), c('Data Entry', true), c('Stock Market')] },
  { slug: 'crafted-passion', name: 'Crafted Passion', price: 13499, image: 'img/b-passion.webp', tint: '#c8dcff',
    courses: [c('Tailoring'), c('Embroidery'), c('Ary Work'), c('Content Writing with AI', true)] },
  { slug: 'crafted-beauty-and-creation', name: 'Crafted Beauty and Creation', price: 14999, image: 'img/b-beauty-creation.webp', tint: '#ffd0c4',
    courses: [c('Content Creation', true), c('Make-Up'), c('Mehandi')] },
]

export const bundleBySlug = (s: string) => BUNDLES.find((b) => b.slug === s)
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN')

export const ALL_SKILLS = BUNDLES.flatMap((b) => b.courses.map((x) => x.name))

export const FOUNDERS = [
  {
    role: 'Founder', name: 'Vaishnavi', photo: 'img/founder-vaishnavi.webp', place: 'Kodagu, Karnataka',
    bio: [
      'Hi, I’m Vaishnavi from Kodagu, Karnataka. I’m a proud homemaker turned Digital Skills Mentor with over 4 years of experience in affiliate marketing and skill development.',
      'My journey has taught me that with the right skills, proper guidance, and consistent effort, anyone can take a step towards building a better future. I started my journey with a vision to grow personally and professionally, and today, I’m passionate about helping others discover their potential and learn practical digital skills.',
      'Through CraftedSkills, my mission is to make skill-based learning accessible in Kannada, especially for beginners, homemakers, and aspiring entrepreneurs who want to explore new opportunities from the comfort of their homes.',
      'I believe that learning should be simple, practical, and accessible to everyone. That’s why I’m committed to providing valuable training, guidance, and support to help learners build confidence, develop useful skills, and move forward towards their goals.',
    ],
  },
  {
    role: 'Co-Founder', name: 'Rachana', photo: 'img/founder-rachana.webp', place: 'Mandya District, Karnataka',
    bio: [
      'Hi, I’m Rachana from Mandya District, Karnataka.',
      'With 3.5 years of experience in Affiliate Marketing and Freelancing, I have developed expertise in Digital Marketing, Lead Generation, and Personal Branding.',
      'I am passionate about helping people discover their potential, learn valuable digital skills, and explore new opportunities in the online world.',
      'As a co-founder, my vision is to build a platform that empowers individuals, especially women and aspiring entrepreneurs, with the right skills, knowledge, and guidance to work towards financial independence.',
      'I believe that with continuous learning, dedication, and the right mindset, everyone has the potential to grow and create a better future.',
      'My mission is to empower people through digital education and create opportunities for growth, confidence, and independence.',
    ],
  },
]

export const ABOUT = {
  intro: [
    'Crafted Skills is a Karnataka-based online learning and digital skills training company committed to empowering people, especially homemakers and women, to learn valuable skills, discover their potential, and work towards their dreams from the comfort of their homes.',
    'We offer skill-focused online learning in Kannada, making digital education easier to understand and accessible to those who feel more comfortable learning in their own language.',
    'Our goal goes beyond teaching skills. We want to help people build confidence, become more independent, explore online business opportunities, and take meaningful steps towards a better future for themselves and their families.',
    'We believe that everyone deserves an opportunity to learn, grow, and pursue their dreams, regardless of their background or circumstances.',
  ],
  mission: [
    'We believe that every woman has a dream, every homemaker has hidden talents, and every individual deserves an opportunity to grow.',
    'At Crafted Skills, our mission is to make skill-based learning accessible in Kannada and help people overcome the uncertainty of where to begin. Through practical learning opportunities and guidance, we aim to help learners develop useful skills, gain confidence, and explore new possibilities for their future.',
  ],
  missionLine: 'Our mission is simple: to bring skills to every home, confidence to every learner, and hope to every dreamer.',
  dreams: [
    "At Crafted Skills, we don't just focus on learning new skills — we focus on helping people believe in themselves and create new possibilities for their future.",
    "Whether you're a homemaker, a beginner, or an aspiring entrepreneur, take the first step towards learning and growth.",
    'Crafted Skills – Learn in Kannada. Grow with Skills. Build Your Dreams from Home.',
  ],
}

export const AFFILIATE = {
  title: 'Our Affiliate Program',
  line: 'Recommend Crafted Skills and earn exciting commissions for every successful signup!',
  cta: 'Click the button to sign up and start sharing today!',
}

export const CONTACT = {
  eyebrow: "WE'RE HERE TO HELP",
  title: "Let's Connect! 💜",
  text: "Have questions about our courses or need assistance? Reach out to us. We're happy to help!",
  emailNote: 'For course enquiries and support',
  callNote: 'For direct assistance',
  formNote: "Fill out the form, and we'll get back to you.",
  followTitle: 'Follow our journey',
  followText: 'Stay connected for learning tips, creative ideas and updates from Crafted Skills',
}

export type Testimonial = { name: string; photo: string; text: string }
export const TESTIMONIALS: Testimonial[] = [
  { name: 'Basamma', photo: 'img/t-basamma.webp', text:
    'ನಾನೊಬ್ಬ housewife and 2 ಮಕ್ಕಳ ತಾಯಿ.\nನಾನು ಮೊದಲಿಗೆ ನನ್ನ ಕೈಯಲ್ಲಿ ಆಗಲ್ಲ! ಇದೆಲ್ಲ ನಮಗಲ್ಲ. ಅಂತ ಅಂದುಕೊಂಡಿದ್ದೆ but ನಾನು step by step ಈ  skills ಕಲಿತು work ಮಾಡಿದೆ . ನಾನು ಕೂಡ financial independent ಆಗಿ ಬದುಕುತಿದ್ದೇನೆ.\nನಾನು ಕೂಡ ಮನೆಯಲ್ಲಿ ಕೆಲಸ ಮಾಡಿಕೊಂಡು ಅದರ ಜೊತೆ ಈ Skills ಕಲಿತು work start ಮಾಡಿದ್ದೇನೆ ❤️🙏best platform ನಿಮ್ಮ carrer build ಮಾಡೋಕೆ 😍' },
  { name: 'Rohini', photo: 'img/t-rohini.webp', text:
    'I’m from Ranebennur. I’m a homemaker and a mother of a 3-year-old baby.\n.ನಿಮ್ಮ mentorship ಗೆ join ಆದ್ಮೇಲೆ skills ನ value ಏನು ಅನ್ನೋದು ಮಾತ್ರ ಅಲ್ಲ, “I understood my own value.” ❤️\nಒಬ್ಬ homemaker ಆಗಿದ್ದ ನಾನು ಕೂಡ independent ಆಗಿ ನನ್ನದೇ ಆದ identity create ಮಾಡಬಹುದು ಅನ್ನೋ confidence ನನಗೆ ಸಿಕ್ಕಿದೆ.\nThe best part is One time ನಲ್ಲಿ ನನಗೆ guidance ಬೇಕಿತ್ತು, but today, I’m able to guide others. ಈ ಬದಲಾವಣೆ ನನಗೆ ತುಂಬಾ special. Thank you so much for changing my mindset and helping me discover my potential. ❤️🙏' },
  { name: 'Mukta', photo: 'img/t-mukta.webp', text:
    'Uttarkannad district. recently BA Final Year ಓದುತ್ತಿದ್ದೇನೆ.\nನಾನು ಒಬ್ಬ Student ಆಗಿದ್ದು,\nನಿಮ್ಮ Guidance ನಿಂದ ನಾನು Digital Skills ಬಗ್ಗೆ ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವುದರ ಜೊತೆಗೆ, ಅವುಗಳನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು ಎಂಬುದನ್ನೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ. ಮೊದಲು ನನಗೆ ಕೆಲವು ವಿಷಯಗಳ ಬಗ್ಗೆ ಹೆಚ್ಚು ತಿಳಿದಿರಲಿಲ್ಲ. ಆದರೆ ಈಗ ಪ್ರತಿದಿನ ಹೊಸದನ್ನು ಕಲಿಯುವ ಆಸಕ್ತಿ ಮತ್ತು ನನ್ನ Skills ಅನ್ನು Improve ಮಾಡಿಕೊಳ್ಳುವ Confidence ಹೆಚ್ಚಾಗಿದೆ.\nನನ್ನಂತಹ Student ಗೆ Digital Skills ಕಲಿಯಲು ಮತ್ತು ನನ್ನ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಹೊಸ ಅವಕಾಶಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತಿರುವುದಕ್ಕೆ ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದಗಳು.' },
  { name: 'Anjushree', photo: 'img/t-anjushree.webp', text:
    'I\'m a student from Devarahosahalli, Nelamangala Taluk, Bengaluru Rural District, Karnataka.\nMa’am, ನಿಮ್ಮ mentorship ನನ್ನ life ನಲ್ಲಿ ಒಂದು ದೊಡ್ಡ turning point. ನಿಮ್ಮ mentorship ಗೆ join ಆದ್ಮೇಲೆ skills ನ value ಏನು ಅನ್ನೋದು ಮಾತ್ರ ಅಲ್ಲ, ನನ್ನಲ್ಲಿರುವ potential ಏನು ಅನ್ನೋದನ್ನೂ ಅರ್ಥಮಾಡಿಕೊಂಡೆ❤️\nಒಬ್ಬ student ಆಗಿದ್ದ ನನಗೆ ಕೂಡ ಹೊಸ skills ಕಲಿತು, ನನ್ನದೇ ಆದ identity create ಮಾಡಬಹುದು ಅನ್ನೋ confidence ಸಿಕ್ಕಿದೆ. ನಿಮ್ಮ guidance ನಿಂದ ನನ್ನ mindset ಬದಲಾಗಿದೆ ಮತ್ತು ನನ್ನ goals ಬಗ್ಗೆ ಇನ್ನಷ್ಟು clarity ಸಿಕ್ಕಿದೆ.\nThe best part is, ma’am, ನಿಮ್ಮಿಂದ ಕಲಿಯುತ್ತಿರುವ skills ನನ್ನ future ಗೆ ತುಂಬಾ helpful aythu 👍' },
  { name: 'Preethi', photo: 'img/t-preethi.webp', text:
    'ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಜಾಯಿನ್ ಆಗಿದ್ದು ನನಗೆ ತುಂಬಾ ಖುಷಿಯಾಗಿದೆ.ನನ್ನ ಪ್ರಕಾರ ಇದು ಕೇವಲ ಒಂದು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅಲ್ಲ, ನಮ್ಮ ಜೀವನದಲ್ಲಿ ಹೊಸ ಬದಲಾವಣೆ ತರುವಂತಹ ಒಂದು ಅತ್ಯುತ್ತಮ ವೇದಿಕೆ. 💯✨\nಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಬಂದ ನಂತರ ನನ್ನ ಆತ್ಮವಿಶ್ವಾಸದ ಮಟ್ಟ ಹೆಚ್ಚಾಗಿದೆ. ನಾನು ಒಬ್ಬ ವಿದ್ಯಾರ್ಥಿನಿಯಾಗಿದ್ದರೂ, ನನ್ನದೇ ಆದ ಒಂದು ಗುರುತನ್ನು (Identity) ಸೃಷ್ಟಿಸಿಕೊಳ್ಳುವ ದಾರಿಯಲ್ಲಿ ಮುನ್ನಡೆಯುತ್ತಿದ್ದೇನೆ. 💪🏻❤️\nನಮ್ಮ ಕನಸುಗಳನ್ನು ನನಸು ಮಾಡಿಕೊಳ್ಳಲು, ನಮ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಲು ಮತ್ತು ನಮ್ಮದೇ ಆದ ಗುರುತನ್ನು ಸೃಷ್ಟಿಸಿಕೊಳ್ಳಲು ಇಂತಹ ಅವಕಾಶ ಸಿಕ್ಕಿರುವುದು ನಿಜಕ್ಕೂ ಹೆಮ್ಮೆಯ ವಿಷಯ. ✨\nI am so happy and proud to be a part of this company! ❤️🫶🏻' },
  { name: 'Soumya', photo: 'img/t-soumya.webp', text:
    'As a housewife and mother, managing family responsibilities and taking care of my kids is an important part of my life. ಆದರೂ, ನನ್ನದೇ ಆದ ಗುರುತನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳಬೇಕು, ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಬೇಕು ಮತ್ತು ನನ್ನ ಭವಿಷ್ಯವನ್ನು ಉತ್ತಮಗೊಳಿಸಿಕೊಳ್ಳಬೇಕು ಎಂಬ ಆಸೆ ನನ್ನಲ್ಲಿತ್ತು.\nನನ್ನ ಈ ಕಲಿಕೆಯ ಪಯಣಕ್ಕೆ ಹೊಸ ದಿಕ್ಕು ನೀಡಿದವರು ನನ್ನ ಪ್ರೀತಿಯ mentor Vaishnavi Mam. ❤️ She guided me, motivated me, and encouraged me to believe in myself. ಅವರ ಮಾರ್ಗದರ್ಶನದಿಂದ, ಗೃಹಿಣಿಯಾಗಿದ್ದರೂ ಮತ್ತು ಮಕ್ಕಳ ಜವಾಬ್ದಾರಿಗಳನ್ನು ನಿಭಾಯಿಸುತ್ತಿದ್ದರೂ ನಮ್ಮ ಕನಸುಗಳನ್ನು ನನಸಾಗಿಸಿಕೊಳ್ಳಲು ಸಾಧ್ಯ ಎಂಬ ನಂಬಿಕೆ ನನ್ನಲ್ಲಿ ಮೂಡಿತು.' },
  { name: 'Sushma', photo: 'img/t-sushma.webp', text:
    'From Bagalkot am a homemaker.  nam ಕನ್ನಡ mentorship ಅವ್ರ ಕೆಳಗಡೆ ನಾನು join ಆದ್ಮೇಲೆ ನಂಬಿಕೆ ಬಂತು. ಆಮೇಲೆ everyday am learned so much skills and be  independent. nimma ಒಂದು possitive guid ನಮಗೆ ಸ್ಫೂರ್ತಿ ಮತ್ತು ಧೈರ್ಯ. ನಿಮ್ಮ ಒಂದು mentorship nange ತುಂಬಾ help agide ತುಂಬಾ ಕಲ್ತಿದೀನಿ thank you so much your and rachana mam guidence 🙏🏻❤️✨' },
  { name: 'Kirtana', photo: 'img/t-kirtana.webp', text:
    'ಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಜಾಯಿನ್ ಆಗಿದ್ದು ನನಗೆ ತುಂಬಾ ಖುಷಿಯಾಗಿದೆ.ನನ್ನ ಪ್ರಕಾರ ಇದು ಕೇವಲ ಒಂದು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅಲ್ಲ, ನಮ್ಮ ಜೀವನದಲ್ಲಿ ಹೊಸ ಬದಲಾವಣೆ ತರುವಂತಹ ಒಂದು ಅತ್ಯುತ್ತಮ ವೇದಿಕೆ. 💯✨\nಈ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಬಂದ ನಂತರ ನನ್ನ ಆತ್ಮವಿಶ್ವಾಸದ ಮಟ್ಟ ಹೆಚ್ಚಾಗಿದೆ. ನಾನು ಒಬ್ಬ ವಿದ್ಯಾರ್ಥಿನಿಯಾಗಿದ್ದರೂ, ನನ್ನದೇ ಆದ ಒಂದು ಗುರುತನ್ನು (Identity) ಸೃಷ್ಟಿಸಿಕೊಳ್ಳುವ ದಾರಿಯಲ್ಲಿ ಮುನ್ನಡೆಯುತ್ತಿದ್ದೇನೆ. 💪🏻❤️\nನಮ್ಮ ಕನಸುಗಳನ್ನು ನನಸು ಮಾಡಿಕೊಳ್ಳಲು, ನಮ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಲು ಮತ್ತು ನಮ್ಮದೇ ಆದ ಗುರುತನ್ನು ಸೃಷ್ಟಿಸಿಕೊಳ್ಳಲು ಇಂತಹ ಅವಕಾಶ ಸಿಕ್ಕಿರುವುದು ನಿಜಕ್ಕೂ ಹೆಮ್ಮೆಯ ವಿಷಯ. ✨\nI am so happy and proud to be a part of this company! ❤️🫶🏻' },
]

export const TERMS = {
  intro: [
    'Crafted Skills is a Karnataka-based online skills training company committed to helping housewives, aspiring entrepreneurs, and individuals develop practical skills and work towards building their dreams from home. Our courses are designed to support learning, creativity, and skill development.',
    'By purchasing or enrolling in any course offered by Crafted Skills, you agree to the following Terms & Conditions.',
  ],
  sections: [
    { h: '1. Course Enrollment and Payment', list: [
      'Students must complete the applicable course payment before receiving access to the purchased course.',
      'Course prices, offers, and package details may change from time to time.',
      'Special offers and discounts are subject to the conditions communicated at the time of purchase.',
    ] },
    { h: '2. 24-Hour Refund Policy', list: [
      'Students may request a refund within 24 hours of the original payment time.',
      'Refund requests must be submitted through the official contact channel provided by Crafted Skills, along with proof of payment and enrollment details.',
      'Refund requests will be reviewed and processed in accordance with the stated policy and applicable consumer protection laws.',
      'After the 24-hour period, refunds will not ordinarily be available, except where required by applicable law or where a refund is otherwise agreed to by Crafted Skills.',
      'Approved refunds will be returned through the original payment method wherever possible. The time taken for the amount to reflect may depend on the payment provider or bank.',
    ], note: 'Important: Please review the course details, package inclusions, and terms before purchasing. This refund policy does not limit any rights you may have under applicable law.' },
    { h: '3. Course Access and Usage', list: [
      'Course access is intended for the enrolled student only.',
      'Sharing, reselling, distributing, recording, or copying course materials without written permission is prohibited.',
      'Crafted Skills may suspend access in cases of unauthorized sharing, fraud, or misuse, subject to applicable law.',
    ] },
    { h: '4. Guidance and Student Support', list: [
      'Crafted Skills aims to provide learning guidance and support to help students develop their skills.',
      'The availability, format, and duration of support may vary depending on the course or package purchased.',
      'Students are responsible for attending training, practising the lessons, and applying what they learn.',
    ] },
    { h: '5. No Guaranteed Income', list: [
      'Our courses are intended to provide education and skill development.',
      'We do not guarantee any specific income, sales, employment, business growth, or financial results.',
      'Individual results depend on factors such as effort, consistency, skill development, market conditions, and the student’s application of the training.',
    ] },
    { h: '6. Intellectual Property', text: 'All course materials, videos, documents, graphics, logos, and other learning resources provided by Crafted Skills are protected by applicable intellectual property laws. They may not be copied, republished, or commercially distributed without permission.' },
    { h: '7. Student Conduct', text: 'Students are expected to communicate respectfully with trainers and other learners. Fraudulent activity, harassment, unauthorized sharing of materials, or misuse of the platform may result in restricted access, subject to applicable law.' },
    { h: '8. Privacy', text: 'Personal information collected during enrollment or support interactions will be handled in accordance with our Privacy Policy and applicable data protection laws.' },
    { h: '9. Changes to These Terms', text: 'Crafted Skills may update these Terms & Conditions when necessary. Updated terms will be published on our website with the revised date.' },
    { h: '10. Contact Us', text: 'For course-related questions, refund requests, or support, please contact Crafted Skills through the official contact details published on our website.' },
  ],
  outro: 'By enrolling in a course, you acknowledge that you have read and understood these Terms & Conditions.',
  updated: 'Last updated: 16 October 2026',
}

export const FAQ = [
  { q: 'What is Crafted Skills?', a: ABOUT.intro[0] },
  { q: 'Who can join the courses?', a: 'Homemakers, students & beginners, working professionals and aspiring entrepreneurs. ' + WHY[1].d },
  { q: 'Are the classes in Kannada?', a: 'Yes. ' + ABOUT.intro[1] },
  { q: 'What is the refund policy?', a: TERMS.sections[1].list![0] + ' ' + TERMS.sections[1].list![1] },
  { q: 'How does the affiliate program work?', a: AFFILIATE.line + ' Sign up as an affiliate, copy your personal link from your dashboard and share it. Every sign-up and purchase from your link is tracked in your dashboard.' },
  { q: 'Is it Crafted Skills or CraftedSkills?', a: 'Both — Crafted Skills is also written CraftedSkills. Our official website is craftedskills.in.' },
]
