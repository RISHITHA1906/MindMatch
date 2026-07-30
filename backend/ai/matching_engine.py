"""
MindMatch AI Matching Engine
Weighted composite score using:
  - Subject/exam overlap (cosine on encoded vectors + Jaccard on raw strings)
  - Skill barter quality (what A can teach B wants, and vice versa)
  - Detailed subject-level matching (specific chapters/topics)
  - Availability overlap
  - Preparation level compatibility
  - Reputation bonus
"""

import numpy as np

# ── Reference vocabulary for vector encoding ───────────────────
ALL_SUBJECTS = [
    # Competitive
    'JEE Main','JEE Advanced','NEET UG','NEET PG','GATE','UPSC CSE',
    'SSC CGL','SSC CHSL','SSC CPO','SSC GD','SSC MTS','SSC JE',
    'IBPS PO','IBPS Clerk','SBI PO','SBI Clerk','RBI Grade B',
    'RRB NTPC','RRB Group D','RRB JE','NDA','CDS','AFCAT','CLAT',
    'CAT','XAT','SNAP','CMAT','IIFT','GMAT','NET JRF','CSIR NET',
    'CTET','DSSSB','KVS','NVS','UGC NET','APPSC','TSPSC','KPSC',
    'CA Foundation','CA Intermediate','CA Final','CMA','CS Foundation',
    'LIC AAO','NIACL','NABARD','SEBI','DRDO','ISRO BARC',
    # Engineering core
    'Data Structures','Algorithms','Operating Systems','DBMS',
    'Computer Networks','Theory of Computation','Compiler Design',
    'Computer Architecture','Software Engineering','OOP',
    'Machine Learning','Deep Learning','Data Science','NLP',
    'Computer Vision','Python','JavaScript','Java','C++','C',
    'React','Node.js','Django','Flask','System Design',
    'Cloud Computing','AWS','Azure','GCP','DevOps','Docker','Kubernetes',
    'Cybersecurity','Ethical Hacking','Blockchain','IoT',
    'Digital Electronics','Analog Circuits','VLSI Design',
    'Signal Processing','Embedded Systems','Communication Systems',
    'Control Systems','Power Systems','Electrical Machines','Power Electronics',
    'Fluid Mechanics','Heat Transfer','Thermodynamics','Manufacturing',
    'Machine Design','Structural Analysis','Geotechnical Engineering',
    'Chemical Reaction Engineering','Mass Transfer',
    # Science
    'Mathematics','Physics','Chemistry','Biology',
    'Organic Chemistry','Inorganic Chemistry','Physical Chemistry',
    'Mechanics','Optics','Electrostatics','Electromagnetism',
    'Calculus','Linear Algebra','Statistics','Probability',
    'Algebra','Trigonometry','Coordinate Geometry','Vectors',
    'Cell Biology','Genetics','Evolution','Ecology','Human Physiology',
    'Plant Physiology','Biotechnology','Microbiology',
    # Commerce/Management
    'Economics','Finance','Accounting','Marketing','Management',
    'Business Law','Taxation','GST','Auditing','Cost Accounting',
    'Financial Management','Strategic Management','HRM',
    'CFA','FRM','Stock Market','Mutual Funds',
    # Arts/Humanities
    'History','Geography','Political Science','Sociology',
    'Psychology','Philosophy','English Literature','Hindi Literature',
    'International Relations','Public Administration','Current Affairs',
    # Skills
    'Public Speaking','Content Writing','UI/UX Design','SQL',
    'Excel','Power BI','Tableau','Digital Marketing','SEO',
    'Quantitative Aptitude','Logical Reasoning','Verbal Ability',
    'General Knowledge','English Grammar','Reading Comprehension',
    # Languages
    'English','Hindi','Telugu','Tamil','French','German','Japanese',
]

DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
LEVELS = {'Beginner': 1, 'Intermediate': 2, 'Advanced': 3}

# ── Vector helpers ──────────────────────────────────────────────

def _to_vector(items, reference):
    """Convert a list of strings to a presence vector over reference list.
    Exact match → 1.0, partial/substring match → 0.5."""
    v = [0.0] * len(reference)
    items_lower = [str(i).lower() for i in items]
    for idx, ref in enumerate(reference):
        ref_lower = ref.lower()
        for item_lower in items_lower:
            if item_lower == ref_lower:
                v[idx] = 1.0
                break
            elif item_lower in ref_lower or ref_lower in item_lower:
                v[idx] = max(v[idx], 0.45)
    return v


def _cosine(a, b):
    a, b = np.array(a, dtype=float), np.array(b, dtype=float)
    na, nb = np.linalg.norm(a), np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def _jaccard(set_a, set_b):
    """Jaccard similarity with case-insensitive normalisation."""
    a = {str(x).lower().strip() for x in set_a}
    b = {str(x).lower().strip() for x in set_b}
    if not a and not b:
        return 0.0
    return len(a & b) / len(a | b)


def _partial_jaccard(list_a, list_b):
    """Partial string overlap — good for detailed topics."""
    if not list_a or not list_b:
        return 0.0
    a = [str(x).lower().strip() for x in list_a]
    b = [str(x).lower().strip() for x in list_b]
    hits = 0
    for ia in a:
        for ib in b:
            if ia == ib or ia in ib or ib in ia:
                hits += 1
                break
    return hits / max(len(a), len(b))


def _barter_score(a_have, a_want, b_have, b_want):
    """
    Mutual barter quality:
    - What A can teach  ∩  what B wants
    - What B can teach  ∩  what A wants
    Normalised over total wants.
    """
    a_have_l = {str(x).lower().strip() for x in a_have}
    a_want_l = {str(x).lower().strip() for x in a_want}
    b_have_l = {str(x).lower().strip() for x in b_have}
    b_want_l = {str(x).lower().strip() for x in b_want}

    # Direct matches
    a_can_give = a_have_l & b_want_l
    b_can_give = b_have_l & a_want_l

    # Partial matches (substring) — catches "JEE Main" vs "JEE" etc.
    for ah in a_have_l:
        for bw in b_want_l:
            if (ah in bw or bw in ah) and ah != bw:
                a_can_give.add(ah)
    for bh in b_have_l:
        for aw in a_want_l:
            if (bh in aw or aw in bh) and bh != aw:
                b_can_give.add(bh)

    total_want = len(a_want_l | b_want_l)
    if total_want == 0:
        return 0.0
    return (len(a_can_give) + len(b_can_give)) / (total_want * 2.0)


# ── Main scoring function ───────────────────────────────────────

def compute_match_score(user_a, user_b):
    """
    Composite match score → 0..100

    Weights:
      35%  Subject / exam overlap  (cosine + Jaccard hybrid)
      25%  Skill barter quality    (mutual exchange value)
      15%  Detailed topic match    (chapter-level similarity)
      15%  Availability overlap    (shared free days)
      05%  Preparation level compat
      05%  Reputation bonus
    """

    # Collect all skill fields for each user
    a_all = (user_a.get('subjects', []) +
             user_a.get('skills_have', []) +
             user_a.get('skills_want', []))
    b_all = (user_b.get('subjects', []) +
             user_b.get('skills_have', []) +
             user_b.get('skills_want', []))

    # 1. Subject/Exam overlap
    av = _to_vector(a_all, ALL_SUBJECTS)
    bv = _to_vector(b_all, ALL_SUBJECTS)
    cosine_sim = _cosine(av, bv)

    # Raw Jaccard on subjects for strings not in reference list
    jaccard_subj = _jaccard(user_a.get('subjects', []), user_b.get('subjects', []))
    subject_score = 0.65 * cosine_sim + 0.35 * jaccard_subj

    # 2. Skill barter quality
    barter_broad = _barter_score(
        user_a.get('skills_have', []), user_a.get('skills_want', []),
        user_b.get('skills_have', []), user_b.get('skills_want', []),
    )
    # Barter on detailed topics (higher weight if available)
    barter_detail = _barter_score(
        user_a.get('teachSubjectDetails', []), user_a.get('learnSubjectDetails', []),
        user_b.get('teachSubjectDetails', []), user_b.get('learnSubjectDetails', []),
    )
    barter_score = max(barter_broad, 0.5 * barter_broad + 0.5 * barter_detail)

    # 3. Detailed topic / chapter-level similarity
    a_details = (user_a.get('subjectDetails', []) +
                 user_a.get('teachSubjectDetails', []) +
                 user_a.get('learnSubjectDetails', []))
    b_details = (user_b.get('subjectDetails', []) +
                 user_b.get('teachSubjectDetails', []) +
                 user_b.get('learnSubjectDetails', []))
    detail_score = _partial_jaccard(a_details, b_details) if a_details and b_details else 0.0

    # 4. Availability overlap
    avail_score = _jaccard(user_a.get('availability', []), user_b.get('availability', []))

    # 5. Preparation level compatibility
    al = LEVELS.get(user_a.get('preparation_level', 'Beginner'), 1)
    bl = LEVELS.get(user_b.get('preparation_level', 'Beginner'), 1)
    diff = abs(al - bl)
    level_score = [1.0, 0.55, 0.15][diff]  # Same / adjacent / far

    # 6. Reputation bonus (normalised)
    rep_a = min(user_a.get('reputation_score', 0) / 5.0, 1.0)
    rep_b = min(user_b.get('reputation_score', 0) / 5.0, 1.0)
    rep_score = (rep_a + rep_b) / 2.0

    # Weighted composite
    final = (
        subject_score  * 0.35 +
        barter_score   * 0.25 +
        detail_score   * 0.15 +
        avail_score    * 0.15 +
        level_score    * 0.05 +
        rep_score      * 0.05
    )

    return round(final * 100, 1)


# ── Human-readable match reasons ───────────────────────────────

def get_match_reasons(user_a, user_b):
    """Return up to 4 bullet reasons why these two users match well."""
    reasons = []

    # Shared subjects/exams
    a_subj = {str(x).lower().strip() for x in user_a.get('subjects', [])}
    b_subj = {str(x).lower().strip() for x in user_b.get('subjects', [])}
    shared = a_subj & b_subj
    if shared:
        display = [x.title() for x in list(shared)[:3]]
        reasons.append(f"Preparing for same: {', '.join(display)}")

    # What A can teach that B wants
    a_have_l = {str(x).lower() for x in user_a.get('skills_have', [])}
    b_want_l = {str(x).lower() for x in user_b.get('skills_want', [])}
    you_teach = a_have_l & b_want_l
    if you_teach:
        display = [x.title() for x in list(you_teach)[:2]]
        reasons.append(f"You can teach them: {', '.join(display)}")

    # What B can teach that A wants
    b_have_l = {str(x).lower() for x in user_b.get('skills_have', [])}
    a_want_l = {str(x).lower() for x in user_a.get('skills_want', [])}
    they_teach = b_have_l & a_want_l
    if they_teach:
        display = [x.title() for x in list(they_teach)[:2]]
        reasons.append(f"They can teach you: {', '.join(display)}")

    # Shared availability
    shared_days = set(user_a.get('availability', [])) & set(user_b.get('availability', []))
    if shared_days:
        days_display = list(shared_days)[:3]
        reasons.append(f"Both free on: {', '.join(days_display)}")

    # Detailed chapter-level match
    a_teach_detail = {str(x).lower() for x in user_a.get('teachSubjectDetails', [])}
    b_learn_detail = {str(x).lower() for x in user_b.get('learnSubjectDetails', [])}
    chapter_match = set()
    for td in a_teach_detail:
        for ld in b_learn_detail:
            if td == ld or td in ld or ld in td:
                chapter_match.add(td.title())
    if chapter_match:
        display = list(chapter_match)[:2]
        reasons.append(f"Topic match: {', '.join(display)}")

    # Same prep level
    if user_a.get('preparation_level') == user_b.get('preparation_level'):
        reasons.append(f"Same level: {user_a.get('preparation_level', 'Beginner')}")

    return reasons[:4]


# ── Skill recommendation helper ────────────────────────────────

def recommend_skills_for_user(user, all_users, limit=12):
    """
    Recommend skills the user might want to learn,
    based on what popular matched users are teaching.
    Returns list of { skill, frequency, teachers: [...] }
    """
    my_have = {str(x).lower() for x in user.get('skills_have', [])}
    my_want = {str(x).lower() for x in user.get('skills_want', [])}

    skill_freq = {}
    skill_teachers = {}

    for u in all_users:
        if str(u.get('_id', '')) == str(user.get('_id', '')):
            continue
        score = compute_match_score(user, u)
        if score < 5:  # Skip very poor matches
            continue

        for skill in u.get('skills_have', []):
            sl = str(skill).lower().strip()
            if sl in my_have:
                continue
            skill_freq[sl] = skill_freq.get(sl, 0) + 1
            if sl not in skill_teachers:
                skill_teachers[sl] = []
            skill_teachers[sl].append({
                'id': str(u.get('_id', '')),
                'name': u.get('name', ''),
                'reputation_score': u.get('reputation_score', 0),
                'avatar': u.get('avatar', ''),
                'match_score': score,
            })

    recs = []
    for skill, freq in sorted(skill_freq.items(), key=lambda x: x[1], reverse=True):
        priority = 3 if skill in my_want else (2 if freq > 2 else 1)
        teachers = sorted(
            skill_teachers[skill],
            key=lambda x: (x['reputation_score'], x['match_score']),
            reverse=True
        )[:3]
        recs.append({
            'skill': skill.title(),
            'frequency': freq,
            'priority': priority,
            'teachers': teachers,
            'in_wanted': skill in my_want,
        })

    recs.sort(key=lambda x: (x['priority'], x['frequency']), reverse=True)
    return recs[:limit]
