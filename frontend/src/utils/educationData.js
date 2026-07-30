// ============================================================
// COMPREHENSIVE INDIA EDUCATION DATA
// Structure: Category → Subcategory → [items]
// Each item is selectable as a skill/subject to teach or learn
// ============================================================

export const EDUCATION_DATA = {
  "🏆 Competitive Exams": {
    "SSC Exams": [
      "SSC CGL", "SSC CHSL", "SSC CPO (SI)", "SSC GD Constable",
      "SSC MTS", "SSC Stenographer", "SSC JHT", "SSC JE", "SSC Selection Post"
    ],
    "UPSC / Civil Services": [
      "UPSC CSE (IAS/IPS/IFS)", "UPSC CDS", "UPSC NDA", "UPSC CAPF (AC)",
      "UPSC ESE (Engineering Services)", "UPSC CISF AC", "UPSC Geologist"
    ],
    "State PSC Exams": [
      "APPSC Group 1/2/3", "TSPSC Group 1/2/3", "KPSC KAS",
      "TNPSC Group 1/2/4", "MPPSC", "UPPSC PCS", "RPSC RAS",
      "BPSC", "WBPSC", "JPSC", "GPSC", "CGPSC", "OPSC", "APSC (Assam)"
    ],
    "Banking Exams": [
      "IBPS PO", "IBPS Clerk", "IBPS RRB PO", "IBPS RRB Clerk",
      "IBPS SO", "SBI PO", "SBI Clerk", "SBI SO",
      "RBI Grade B", "RBI Assistant", "NABARD Grade A/B",
      "SEBI Grade A", "SIDBI Grade A"
    ],
    "Railway Exams": [
      "RRB NTPC", "RRB Group D", "RRB JE", "RRB ALP",
      "RRB SSE", "RPF Constable", "RPF SI", "RRB Technician"
    ],
    "Defence Exams": [
      "NDA (Army/Navy/Air Force)", "CDS", "AFCAT",
      "Indian Navy AA/SSR", "Agniveer Army", "Agniveer Navy",
      "Agniveer Air Force", "MNS (Military Nursing)", "Indian Coast Guard"
    ],
    "Police & Para-Military": [
      "CISF Head Constable", "BSF", "CRPF", "ITBP",
      "SSB Sub-Inspector", "State Police SI", "State Police Constable",
      "Telangana Police SI", "AP Police SI", "Delhi Police Constable"
    ],
    "Teaching Exams": [
      "CTET (Paper 1 & 2)", "DSSSB TGT/PGT", "KVS TGT/PGT/PRT",
      "NVS TGT/PGT", "UGC NET", "SET/SLET", "AP TET", "TS TET",
      "HTET", "REET", "UPTET", "MPTET"
    ],
    "Insurance Exams": [
      "LIC AAO", "LIC ADO", "LIC HFL", "NIACL AO", "NICL AO",
      "UIIC AO", "GIC Scale-I", "OICL AO"
    ],
    "Other Central Govt": [
      "DRDO CEPTAM", "ISRO Technician/Scientist",
      "BARC (Scientific Officer)", "AAI Junior Executive",
      "FCI AGM/JE/Watchman", "India Post GDS/PA/SA",
      "ESIC", "NHM Staff Nurse", "ECGC PO", "ONGC GT"
    ],
    "GATE": [
      "GATE CS/IT", "GATE ECE", "GATE EE", "GATE ME",
      "GATE CE", "GATE CH", "GATE IN (Instrumentation)",
      "GATE BT (Biotechnology)", "GATE XE (Engineering Sciences)",
      "GATE MA (Mathematics)", "GATE PH (Physics)"
    ],
    "Management Entrance": [
      "CAT", "XAT", "SNAP", "NMAT", "CMAT", "MAT",
      "IIFT", "TISSNET", "MICAT", "IBSAT", "GMAT"
    ],
    "Law Entrance": [
      "CLAT", "AILET", "LSAT India", "SLAT (Symbiosis)",
      "CULEE", "MH CET Law", "MHCET 3-Year LLB"
    ],
    "National Level Other": [
      "CUET UG", "CUET PG", "NET/JRF (Humanities)",
      "CSIR NET JRF", "SET/SLET (State)", "JEST",
      "IIT JAM", "JGEEBILS", "TIFR GS"
    ]
  },

  "⚙️ Engineering & Technology": {
    "Engineering Entrance Exams": [
      "JEE Main", "JEE Advanced", "BITSAT", "VITEEE",
      "SRMJEEE", "MET (Manipal)", "COMEDK", "TS EAMCET",
      "AP EAMCET", "KCET", "MHT CET", "WBJEE", "UPSEE/AKTU",
      "TNEA", "KEAM (Kerala)"
    ],
    "Computer Science – Core": [
      "Data Structures & Algorithms (DSA)", "Operating Systems",
      "Database Management Systems (DBMS)", "Computer Networks",
      "Theory of Computation (TOC)", "Compiler Design",
      "Computer Architecture & Organization", "Software Engineering",
      "Object Oriented Programming (OOP)", "Discrete Mathematics"
    ],
    "Computer Science – Advanced": [
      "System Design", "Design Patterns", "Distributed Systems",
      "Microservices Architecture", "Cloud Computing",
      "Cybersecurity & Ethical Hacking", "Blockchain Technology",
      "Internet of Things (IoT)", "AR/VR Development",
      "Quantum Computing Basics"
    ],
    "Programming Languages": [
      "Python", "Java", "C Programming", "C++", "C#",
      "JavaScript", "TypeScript", "Kotlin", "Swift",
      "Go (Golang)", "Rust", "R Programming",
      "MATLAB", "PHP", "Ruby", "Scala"
    ],
    "Web Development": [
      "HTML & CSS", "React.js", "Next.js", "Vue.js",
      "Angular", "Node.js", "Express.js", "Django",
      "Flask", "FastAPI", "Spring Boot", "Laravel",
      "GraphQL", "REST API Design", "WebSockets"
    ],
    "Data Science & AI": [
      "Machine Learning", "Deep Learning", "Natural Language Processing (NLP)",
      "Computer Vision", "TensorFlow", "PyTorch",
      "Data Analysis with Pandas", "SQL & NoSQL Databases",
      "Power BI", "Tableau", "Apache Spark",
      "Feature Engineering", "Model Deployment (MLOps)"
    ],
    "Cloud & DevOps": [
      "AWS (Amazon Web Services)", "Microsoft Azure", "Google Cloud (GCP)",
      "Docker & Containers", "Kubernetes",
      "CI/CD Pipelines", "Terraform (IaC)",
      "Linux Administration", "Networking Fundamentals",
      "Site Reliability Engineering (SRE)"
    ],
    "Electronics & Communication (ECE)": [
      "Digital Electronics", "Analog Circuits", "VLSI Design",
      "Signal Processing", "Embedded Systems",
      "Microprocessors & Microcontrollers", "Communication Systems",
      "Control Systems", "Microwave Engineering", "Antenna Theory",
      "FPGA Design", "PCB Design"
    ],
    "Electrical Engineering (EE)": [
      "Circuit Theory", "Power Systems", "Electrical Machines",
      "Power Electronics", "Control Systems EE",
      "High Voltage Engineering", "Renewable Energy Systems",
      "Instrumentation & Measurement",
      "Electric Vehicles (EV) Technology"
    ],
    "Mechanical Engineering": [
      "Thermodynamics", "Fluid Mechanics", "Strength of Materials (SOM)",
      "Manufacturing Processes", "Heat & Mass Transfer",
      "Machine Design", "Theory of Machines (TOM)",
      "CAD/CAM", "Industrial Engineering",
      "Robotics & Automation", "Automobile Engineering",
      "Finite Element Analysis (FEA)"
    ],
    "Civil Engineering": [
      "Structural Analysis", "RCC Design", "Steel Structure Design",
      "Geotechnical Engineering (Soil Mechanics)",
      "Transportation Engineering", "Fluid Mechanics Civil",
      "Environmental Engineering", "Surveying",
      "Construction Planning & Management",
      "Hydrology & Water Resources"
    ],
    "Chemical Engineering": [
      "Chemical Reaction Engineering (CRE)",
      "Mass Transfer Operations",
      "Heat Transfer Chemical",
      "Thermodynamics Chemical",
      "Process Control & Instrumentation",
      "Fluid Mechanics Chemical",
      "Petroleum Refining",
      "Polymer Technology"
    ],
    "Other Engineering Branches": [
      "Aerospace Engineering", "Biotechnology Engineering",
      "Agricultural Engineering", "Mining Engineering",
      "Textile Engineering", "Food Technology",
      "Production Engineering", "Ceramic Engineering",
      "Metallurgical Engineering", "Marine Engineering"
    ]
  },

  "🏥 Medical & Health Sciences": {
    "Medical Entrance Exams": [
      "NEET UG", "NEET PG", "AIIMS PG", "JIPMER",
      "FMGE (MCI Screening)", "INI CET", "NEET SS",
      "UPSC CMS", "AFMS Medical"
    ],
    "MBBS – Pre-Clinical (1st & 2nd Year)": [
      "Anatomy", "Physiology", "Biochemistry"
    ],
    "MBBS – Para-Clinical (2nd & 3rd Year)": [
      "Pathology", "Microbiology", "Pharmacology",
      "Forensic Medicine & Toxicology", "Community Medicine (PSM)"
    ],
    "MBBS – Clinical (Final Year)": [
      "General Medicine", "General Surgery",
      "Obstetrics & Gynaecology", "Paediatrics",
      "Orthopaedics", "Ophthalmology", "ENT",
      "Radiology", "Anaesthesiology", "Dermatology",
      "Psychiatry", "Emergency Medicine"
    ],
    "Nursing": [
      "GNM (General Nursing & Midwifery)",
      "B.Sc Nursing", "M.Sc Nursing",
      "AIIMS Nursing Officer Exam",
      "JIPMER Nursing",
      "DSSSB Nursing", "Critical Care Nursing"
    ],
    "Pharmacy": [
      "D.Pharm", "B.Pharm", "M.Pharm",
      "GPAT", "Pharmacology (Detail)",
      "Pharmaceutical Chemistry",
      "Pharmacognosy", "Pharmaceutical Analysis",
      "Drug Regulatory Affairs"
    ],
    "Dental (BDS/MDS)": [
      "BDS", "MDS", "NEET MDS",
      "Oral Surgery", "Prosthodontics",
      "Orthodontics", "Pedodontics",
      "Oral Pathology", "Periodontology"
    ],
    "Allied Health Sciences": [
      "DMLT / BMLT (Medical Lab Tech)",
      "Physiotherapy (BPT)", "Occupational Therapy",
      "Radiography & Imaging", "Optometry",
      "Nutrition & Dietetics", "Cardiac Technology",
      "Dialysis Technology", "Operation Theatre Technology"
    ],
    "Ayurveda, Yoga & Naturopathy": [
      "BAMS (Ayurveda)", "BHMS (Homeopathy)",
      "BUMS (Unani)", "BNYS (Naturopathy & Yoga)",
      "Ayurvedic Medicine & Surgery",
      "Panchakarma Therapy", "Yoga Therapy"
    ]
  },

  "💼 Management, Commerce & Finance": {
    "MBA Entrance Exams": [
      "CAT", "XAT", "SNAP", "NMAT", "CMAT",
      "MAT", "IIFT", "TISSNET", "MICAT", "GMAT", "IBSAT"
    ],
    "MBA/BBA Subjects": [
      "Marketing Management", "Financial Management",
      "Human Resource Management (HRM)",
      "Operations Management", "Business Analytics",
      "Strategic Management", "Entrepreneurship & Innovation",
      "Supply Chain Management",
      "International Business",
      "Organisational Behaviour (OB)",
      "Business Communication",
      "Consumer Behaviour"
    ],
    "BBA Entrance": [
      "IPM IIM Indore/Rohtak", "NPAT (NMIMS)",
      "SET (Symbiosis)", "DU JAT",
      "BHU UET", "CUET (Commerce)"
    ],
    "Commerce – Class 11 & 12": [
      "Accountancy (Class 11-12)",
      "Business Studies (Class 11-12)",
      "Economics (Class 11-12)",
      "Mathematics for Commerce",
      "Statistics for Economics",
      "Entrepreneurship (Class 11-12)"
    ],
    "CA – Chartered Accountancy": [
      "CA Foundation – Principles of Accounting",
      "CA Foundation – Business Laws",
      "CA Foundation – Business Maths & Stats",
      "CA Foundation – Business Economics",
      "CA Intermediate – Advanced Accounting",
      "CA Intermediate – Corporate & Other Laws",
      "CA Intermediate – Taxation (Income Tax + GST)",
      "CA Intermediate – Cost & Management Accounting",
      "CA Intermediate – Auditing & Assurance",
      "CA Intermediate – Financial Management & Economics for Finance",
      "CA Final – Financial Reporting",
      "CA Final – SFM (Strategic Financial Management)",
      "CA Final – Advanced Auditing",
      "CA Final – Direct Tax Laws",
      "CA Final – Indirect Tax Laws"
    ],
    "CMA – Cost Accountancy": [
      "CMA Foundation", "CMA Intermediate", "CMA Final",
      "Cost Accounting", "Management Accounting",
      "Financial Accounting CMA"
    ],
    "CS – Company Secretary": [
      "CS Foundation", "CS Executive (Module 1 & 2)",
      "CS Professional", "Company Law",
      "Securities Laws & Capital Market",
      "Corporate Governance"
    ],
    "Finance & Investments": [
      "CFA Level 1", "CFA Level 2", "CFA Level 3",
      "FRM Part 1 & 2", "CFP (Financial Planning)",
      "NISM Certifications",
      "Stock Market & Equity Analysis",
      "Mutual Funds", "Derivatives & Options",
      "Personal Finance & Budgeting",
      "Real Estate Investment"
    ],
    "Taxation & GST": [
      "Income Tax (Direct Tax)",
      "GST (Goods & Services Tax)",
      "Customs Law", "International Taxation",
      "Tax Planning & Filing (ITR)",
      "Transfer Pricing"
    ]
  },

  "🎨 Arts, Humanities & Social Sciences": {
    "BA Entrance & CUET": [
      "CUET (Arts/Humanities)", "DU Entrance BA",
      "BHU UET (Arts)", "JNU Entrance",
      "HCU Entrance (Humanities)"
    ],
    "History": [
      "Ancient Indian History", "Medieval Indian History",
      "Modern Indian History", "World History",
      "History of Art", "Indian Culture & Heritage",
      "Post-Independence India", "Freedom Struggle"
    ],
    "Geography": [
      "Physical Geography", "Human Geography",
      "Geography of India", "Economic Geography",
      "Climatology", "Map Reading & GIS",
      "Environmental Geography", "Oceanography"
    ],
    "Political Science": [
      "Indian Polity & Constitution",
      "Comparative Politics",
      "International Relations",
      "Political Theory",
      "Public Administration",
      "Panchayati Raj & Local Governance",
      "Foreign Policy of India"
    ],
    "Sociology & Psychology": [
      "Introduction to Sociology",
      "Social Stratification",
      "Social Change & Movements",
      "Indian Society",
      "General Psychology",
      "Developmental Psychology",
      "Abnormal Psychology",
      "Social Psychology",
      "Counselling Basics"
    ],
    "Philosophy & Ethics": [
      "Introduction to Philosophy",
      "Ethics & Human Values",
      "Indian Philosophy",
      "Western Philosophy",
      "Logic & Critical Thinking"
    ],
    "Economics (Arts/BA)": [
      "Microeconomics", "Macroeconomics",
      "Indian Economy", "Development Economics",
      "International Economics",
      "Fiscal Policy & Monetary Policy",
      "Agricultural Economics"
    ],
    "Literature & Languages": [
      "English Literature", "Hindi Literature",
      "Telugu Literature", "Tamil Literature",
      "Kannada Literature", "Malayalam Literature",
      "Bengali Literature", "Marathi Literature",
      "Sanskrit", "Urdu Literature",
      "Punjabi Literature", "Gujarati Literature"
    ],
    "Foreign Languages": [
      "French (Beginner to Advanced)",
      "German (Beginner to Advanced)",
      "Japanese (JLPT N5–N1)",
      "Spanish (Beginner to Advanced)",
      "Mandarin / Chinese (HSK)",
      "Korean (TOPIK)",
      "Arabic", "Russian Basics"
    ],
    "Law": [
      "Constitutional Law", "Criminal Law (IPC/CrPC)",
      "Civil Procedure Code (CPC)",
      "Contract Law", "Corporate & Company Law",
      "Intellectual Property Rights (IPR)",
      "International Law",
      "Labour & Industrial Law",
      "Environmental Law", "Family Law",
      "Evidence Act", "Tort Law"
    ],
    "Fine Arts & Design": [
      "Drawing & Sketching", "Painting (Watercolor/Oil)",
      "Sculpture", "Photography",
      "Graphic Design", "Motion Graphics",
      "Film Making & Direction",
      "Interior Design", "Fashion Design",
      "Jewellery Design"
    ],
    "Performing Arts": [
      "Music – Hindustani Classical",
      "Music – Carnatic Classical",
      "Music – Western (Piano/Guitar/Violin)",
      "Dance – Bharatanatyam",
      "Dance – Kathak", "Dance – Kuchipudi",
      "Dance – Odissi", "Dance – Mohiniyattam",
      "Theatre & Drama", "Stand-up Comedy Writing"
    ],
    "Mass Communication & Journalism": [
      "Journalism (Print & Digital)",
      "Broadcast Journalism (TV/Radio)",
      "Public Relations", "Advertising & Media Planning",
      "Event Management",
      "Content Writing & Blogging",
      "Social Media Strategy",
      "Film & Documentary Making"
    ]
  },

  "🔬 Pure Sciences & Research": {
    "BSc Entrance": [
      "IIT JAM Mathematics", "IIT JAM Physics",
      "IIT JAM Chemistry", "IIT JAM Biotechnology",
      "IIT JAM Geology", "IIT JAM Economics",
      "TIFR GS", "JEST (Physics)", "JGEEBILS (Biology)"
    ],
    "Mathematics": [
      "Algebra (Class 11-12)", "Calculus (Differential)",
      "Calculus (Integral)", "Coordinate Geometry",
      "Trigonometry", "Vectors & 3D Geometry",
      "Complex Numbers", "Probability & Statistics",
      "Linear Algebra", "Differential Equations",
      "Number Theory", "Discrete Mathematics",
      "Real Analysis", "Abstract Algebra"
    ],
    "Physics": [
      "Mechanics (Classical)", "Thermodynamics",
      "Electrostatics", "Current Electricity",
      "Magnetism & Magnetic Effects",
      "Electromagnetic Induction (EMI)",
      "Optics (Ray & Wave)", "Modern Physics (Class 12)",
      "Semiconductor Physics",
      "Quantum Mechanics", "Nuclear Physics",
      "Astrophysics Basics"
    ],
    "Chemistry": [
      "Physical Chemistry – Thermodynamics",
      "Physical Chemistry – Electrochemistry",
      "Physical Chemistry – Chemical Kinetics",
      "Physical Chemistry – Solutions",
      "Organic Chemistry – IUPAC Nomenclature",
      "Organic Chemistry – Reactions & Mechanisms",
      "Organic Chemistry – Biomolecules",
      "Inorganic Chemistry – Periodic Table",
      "Inorganic Chemistry – Chemical Bonding",
      "Inorganic Chemistry – Coordination Compounds",
      "Analytical Chemistry"
    ],
    "Biology (Class 11-12 & BSc)": [
      "Cell Biology & Cell Division",
      "Genetics & Heredity",
      "Molecular Biology (DNA/RNA)",
      "Human Physiology – Digestion & Circulation",
      "Human Physiology – Excretion & Neural Control",
      "Plant Physiology",
      "Ecology & Ecosystems",
      "Biodiversity & Conservation",
      "Evolution", "Biotechnology & Applications",
      "Reproduction in Plants & Animals",
      "Microorganisms"
    ],
    "Research & Fellowship": [
      "CSIR NET JRF (Life Sciences)",
      "CSIR NET JRF (Chemical Sciences)",
      "CSIR NET JRF (Mathematical Sciences)",
      "CSIR NET JRF (Physical Sciences)",
      "DBT JRF", "ICMR JRF",
      "UGC NET Science Papers",
      "DST Inspire Fellowship"
    ]
  },

  "📚 School & Board Exams": {
    "Class 6–8 Foundation": [
      "Mathematics (Class 6-8)",
      "Science (Class 6-8)",
      "Social Science (Class 6-8)",
      "English (Class 6-8)",
      "Hindi (Class 6-8)"
    ],
    "Class 9–10 (Boards)": [
      "Mathematics (Class 9-10)",
      "Physics (Class 9-10)",
      "Chemistry (Class 9-10)",
      "Biology (Class 9-10)",
      "Social Science – History (9-10)",
      "Social Science – Geography (9-10)",
      "Social Science – Political Science (9-10)",
      "Social Science – Economics (9-10)",
      "English Language & Literature (9-10)",
      "Hindi (Class 9-10)",
      "CBSE Class 10 Board Preparation",
      "ICSE Class 10 Board Preparation",
      "AP State Board Class 10",
      "TS State Board Class 10"
    ],
    "Class 11–12 Science": [
      "Physics (Class 11)", "Physics (Class 12)",
      "Chemistry (Class 11)", "Chemistry (Class 12)",
      "Mathematics (Class 11)", "Mathematics (Class 12)",
      "Biology (Class 11)", "Biology (Class 12)",
      "Computer Science (Class 11-12)",
      "CBSE Class 12 Science Board Prep",
      "ICSE Class 12 Science"
    ],
    "Class 11–12 Commerce": [
      "Accountancy (Class 11)", "Accountancy (Class 12)",
      "Business Studies (Class 11-12)",
      "Economics (Class 11-12)",
      "Mathematics – Commerce (Class 11-12)",
      "CBSE Class 12 Commerce Board Prep"
    ],
    "Class 11–12 Arts/Humanities": [
      "History (Class 11-12)",
      "Political Science (Class 11-12)",
      "Geography (Class 11-12)",
      "Sociology (Class 11-12)",
      "Psychology (Class 11-12)",
      "English Core (Class 11-12)",
      "CBSE Class 12 Arts Board Prep"
    ],
    "Olympiads & Talent Tests": [
      "Mathematics Olympiad (IMO/RMO/IOQM)",
      "Physics Olympiad (IPhO/NSEP)",
      "Chemistry Olympiad (IChO/NSEC)",
      "Biology Olympiad (ISMO/NSEB)",
      "Astronomy Olympiad (IOAA/NSEA)",
      "Computer Olympiad (IOI/IOQCS)",
      "Science Olympiad (NSO)",
      "NTSE", "KVPY / Inspire Award"
    ]
  },

  "💻 Digital Skills & Certifications": {
    "Mobile Development": [
      "Android Development (Java/Kotlin)",
      "iOS Development (Swift/SwiftUI)",
      "Flutter (Cross-platform)",
      "React Native", "Xamarin", "Ionic"
    ],
    "Cybersecurity": [
      "Ethical Hacking Basics",
      "Penetration Testing",
      "CEH (Certified Ethical Hacker)",
      "CISSP", "CompTIA Security+",
      "Network Security & Firewalls",
      "OSCP", "SOC Analyst",
      "Bug Bounty Hunting", "VAPT"
    ],
    "Cloud Certifications": [
      "AWS Solutions Architect Associate",
      "AWS Developer Associate",
      "AWS SysOps Administrator",
      "Microsoft Azure AZ-900",
      "Microsoft Azure AZ-104",
      "Google Cloud ACE",
      "Google Cloud Professional Data Engineer"
    ],
    "Project Management & Agile": [
      "PMP (Project Management Professional)",
      "Scrum Master (CSM)",
      "Agile & Kanban",
      "ITIL 4 Foundation",
      "Six Sigma Green Belt",
      "PRINCE2"
    ],
    "Design Tools": [
      "Figma (UI/UX Design)",
      "Adobe XD", "Sketch",
      "Adobe Photoshop", "Adobe Illustrator",
      "Canva Pro", "Adobe Premiere Pro",
      "Adobe After Effects", "DaVinci Resolve",
      "Blender (3D Modeling)"
    ],
    "Data & Analytics Tools": [
      "Microsoft Excel (Advanced)",
      "SQL (MySQL/PostgreSQL/Oracle)",
      "Power BI", "Tableau",
      "Google Analytics", "Looker Studio",
      "Python for Data Analysis (Pandas/NumPy)",
      "R for Statistics", "SPSS"
    ],
    "Digital Marketing": [
      "SEO (Search Engine Optimisation)",
      "Google Ads (PPC)", "Facebook & Instagram Ads",
      "Content Marketing",
      "Email Marketing (Mailchimp)",
      "Affiliate Marketing",
      "YouTube Growth & Monetization",
      "Copywriting", "Social Media Management"
    ]
  },

  "🌟 Soft Skills & Aptitude": {
    "Aptitude & Reasoning (For All Exams)": [
      "Quantitative Aptitude – Number System",
      "Quantitative Aptitude – Percentages",
      "Quantitative Aptitude – Ratio & Proportion",
      "Quantitative Aptitude – Profit & Loss",
      "Quantitative Aptitude – Time, Speed & Distance",
      "Quantitative Aptitude – Time & Work",
      "Quantitative Aptitude – Simple & Compound Interest",
      "Quantitative Aptitude – Algebra",
      "Quantitative Aptitude – Geometry & Mensuration",
      "Quantitative Aptitude – Data Interpretation",
      "Logical Reasoning – Coding-Decoding",
      "Logical Reasoning – Blood Relations",
      "Logical Reasoning – Syllogisms",
      "Logical Reasoning – Seating Arrangement",
      "Logical Reasoning – Puzzles",
      "Verbal Ability – Grammar",
      "Verbal Ability – Vocabulary (Synonyms/Antonyms)",
      "Verbal Ability – Reading Comprehension",
      "Verbal Ability – Para Jumbles",
      "Abstract Reasoning", "General Knowledge",
      "Current Affairs & Static GK"
    ],
    "Communication & Presentation": [
      "Public Speaking (Confidence Building)",
      "Presentation Skills (PowerPoint/Canva)",
      "Business English Writing",
      "Email & Professional Writing",
      "Group Discussion (GD) Techniques",
      "Technical Report Writing"
    ],
    "Career Development": [
      "Resume / CV Writing",
      "LinkedIn Profile Optimization",
      "Interview Preparation (HR + Technical)",
      "Job Application Strategy",
      "Freelancing & Gig Economy",
      "Startup Ideation & Pitching",
      "Personality Development",
      "Time Management & Productivity",
      "Leadership & Team Building",
      "Negotiation Skills"
    ],
    "Language Improvement": [
      "Spoken English (Beginner)",
      "Spoken English (Advanced – Fluency)",
      "IELTS Preparation",
      "TOEFL Preparation",
      "GRE Verbal & Quant",
      "Hindi Speaking (for Non-Hindi Speakers)",
      "Telugu Speaking (for Non-Telugu Speakers)"
    ]
  },

  "🏛️ Vocational, Diploma & Other": {
    "Polytechnic & ITI": [
      "Polytechnic Entrance (DOTE/TS POLYCET/AP POLYCET)",
      "ITI – Electrician Trade",
      "ITI – Fitter Trade", "ITI – Mechanic (Motor Vehicle)",
      "ITI – Welder", "ITI – Computer Operator (COPA)",
      "ITI – Electronics Mechanic",
      "Diploma Civil Engineering",
      "Diploma Mechanical Engineering",
      "Diploma Electrical Engineering",
      "Diploma Computer Science"
    ],
    "Certificate & Short Courses": [
      "Tally Prime (Accounting Software)",
      "AutoCAD (2D & 3D)", "CATIA", "SolidWorks", "ANSYS",
      "MS Office (Word, Excel, PowerPoint)",
      "Hardware & Networking (A+ / CCNA)",
      "Web Designing (Basic)",
      "E-Commerce Basics"
    ],
    "Agriculture & Veterinary": [
      "ICAR AIEEA (Agriculture Entrance)",
      "Agriculture Science (BSc Ag)",
      "Animal Husbandry & Veterinary (BVSc)",
      "Horticulture", "Agronomy",
      "Agricultural Economics",
      "Soil Science", "Plant Pathology"
    ]
  }
};

// Flat list for AI matching
export const ALL_FLAT_OPTIONS = Object.entries(EDUCATION_DATA).flatMap(([cat, subs]) =>
  Object.entries(subs).flatMap(([sub, items]) =>
    items.map(i => ({ category: cat, subcategory: sub, value: i, label: i }))
  )
);

// Extract just the string values for AI reference
export const ALL_SUBJECTS_LIST = [...new Set(ALL_FLAT_OPTIONS.map(o => o.value))];

export const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday'
];

export const PREP_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Detailed subject suggestions mapped to categories (for SubjectSearch context-awareness)
export const SUBJECT_SUGGESTIONS_BY_CONTEXT = {
  "JEE Main": ["Mechanics", "Thermodynamics", "Electrostatics", "Optics", "Modern Physics", "Algebra", "Calculus", "Coordinate Geometry", "Trigonometry", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
  "JEE Advanced": ["Mechanics Advanced", "Electrodynamics", "Modern Physics Advanced", "Complex Numbers", "Integral Calculus", "3D Geometry", "Organic Chemistry Advanced", "Electrochemistry", "Coordination Compounds"],
  "NEET UG": ["Mechanics (NEET)", "Thermodynamics (NEET)", "Optics (NEET)", "Electrostatics (NEET)", "Organic Chemistry (NEET)", "Inorganic Chemistry (NEET)", "Physical Chemistry (NEET)", "Cell Biology", "Genetics", "Human Physiology", "Plant Physiology", "Ecology", "Biotechnology", "Reproduction", "Evolution"],
  "UPSC CSE (IAS/IPS/IFS)": ["Indian History", "World History", "Indian Polity", "Constitution of India", "Indian Economy", "Geography of India", "Physical Geography", "Environment & Ecology", "Science & Technology", "Current Affairs", "Ethics & Integrity", "Essay Writing", "International Relations", "Disaster Management"],
  "SSC CGL": ["Quantitative Aptitude", "Reasoning (Verbal + Non-Verbal)", "English Language", "General Awareness", "Data Interpretation", "Number System", "Percentage", "Algebra", "Geometry", "Trigonometry SSC", "Reading Comprehension"],
  "SSC CHSL": ["Quantitative Aptitude SSC", "Logical Reasoning", "English Grammar", "General Knowledge", "Computer Basics"],
  "GATE CS/IT": ["Data Structures", "Algorithms", "Operating Systems", "DBMS", "Computer Networks", "Theory of Computation", "Compiler Design", "Computer Architecture", "Digital Logic", "Programming in C", "Engineering Mathematics", "General Aptitude GATE"],
  "GATE ECE": ["Electronic Devices", "Analog Circuits GATE", "Digital Circuits", "Signals & Systems", "Control Systems GATE", "Communication Systems GATE", "Electromagnetics", "Network Theory", "Engineering Mathematics", "General Aptitude GATE"],
  "IBPS PO": ["Quantitative Aptitude Banking", "Reasoning Ability", "English Language Banking", "General/Economy Awareness", "Computer Aptitude", "Data Analysis Banking"],
  "SBI PO": ["Data Interpretation SBI", "Puzzles & Seating Arrangement", "English Language SBI", "Current Affairs", "Banking Awareness"],
  "CAT": ["Quantitative Ability CAT", "Data Interpretation & LR", "Verbal Ability & RC", "Reading Comprehension CAT", "Para Jumbles", "Sentence Correction"],
  "CA Foundation": ["Principles of Accounting", "Mercantile Laws", "General Economics", "Quantitative Aptitude CA"],
  "CA Intermediate": ["Advanced Accounting", "Corporate Laws", "Taxation", "Cost Accounting CA Inter", "Auditing CA", "Financial Management CA"],
  "Python": ["Variables & Data Types", "Control Flow (if/for/while)", "Functions & Recursion", "OOP in Python", "File Handling", "Exception Handling", "Libraries: NumPy, Pandas", "Flask/Django Basics", "Data Structures in Python"],
  "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Linear Regression", "Logistic Regression", "Decision Trees", "Random Forests", "SVM", "KNN", "Neural Networks Basics", "Model Evaluation", "Feature Engineering", "Cross Validation"],
  "Data Structures & Algorithms (DSA)": ["Arrays", "Linked Lists", "Stacks & Queues", "Trees (BST, AVL)", "Graphs (BFS/DFS)", "Sorting Algorithms", "Searching Algorithms", "Dynamic Programming", "Greedy Algorithms", "Hashing", "Heaps", "Segment Trees", "Tries"],
  "default": ["Quantitative Aptitude", "Reasoning", "English Grammar", "General Knowledge", "Current Affairs", "Problem Solving", "Critical Thinking"]
};
