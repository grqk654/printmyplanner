import { useState, useEffect, useRef } from 'react'

// ─── URL ROUTING ──────────────────────────────────────────────────────────────
const urlToPage = (pathname) => pathname.replace(/^\//, '') || 'home'
const pageToUrl = (page) => page === 'home' ? '/' : '/' + page

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  green:  { name: 'Forest green', main: '#2D5A1B', mid: '#3B6D11', light: '#639922', pale: '#EAF3DE', border: '#C0DD97', text: '#2D5A1B' },
  coral:  { name: 'Terracotta',   main: '#993C1D', mid: '#D85A30', light: '#E87A50', pale: '#FAECE7', border: '#F0997B', text: '#993C1D' },
  violet: { name: 'Violet',       main: '#534AB7', mid: '#7F77DD', light: '#A09AEF', pale: '#EEEDFE', border: '#AFA9EC', text: '#534AB7' },
  navy:   { name: 'Navy',         main: '#185FA5', mid: '#378ADD', light: '#5BA8DD', pale: '#E6F1FB', border: '#85B7EB', text: '#185FA5' },
}

// ─── PLANNER TYPE DATA ────────────────────────────────────────────────────────
const PLANNER_TYPES = {
  weekly: {
    id: 'weekly', name: 'Weekly Planner', icon: '📅',
    tagline: 'Daily schedule, priorities, habit tracker & notes',
    badge: 'Most popular',
    desc: 'Starts with your week at a glance — priorities, a habit tracker customized to your goals, and space for daily tasks and notes.',
    features: ['Personalized week grid with your dates', 'AI-built habit tracker from your answers', 'Priority blocks & weekly intention space', 'Print-ready · No account · No watermarks'],
    stages: [
      { name: 'About you', sub: 'Who is this planner for?', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Sarah', required: true },
        { id: 'focus', q: "What's your main life focus right now?", type: 'single', options: [
          { label: 'Work & career', desc: 'Deadlines, projects & meetings' },
          { label: 'Home & family', desc: 'Household, kids & routines' },
          { label: 'Personal growth', desc: 'Goals, health & habits' },
        ]},
        { id: 'pace', q: 'How would you describe your typical week?', type: 'single', options: [
          { label: 'Packed', desc: 'Always busy, lots of moving parts' },
          { label: 'Balanced', desc: 'Mix of work and downtime' },
          { label: 'Flexible', desc: 'No fixed schedule, free-flowing' },
        ]},
        { id: 'starttime', q: 'When does your day typically start?', type: 'single', options: [
          { label: 'Early bird', desc: '5am – 7am start' },
          { label: 'Morning person', desc: '7am – 9am start' },
          { label: 'Mid-morning', desc: '9am – 11am start' },
          { label: 'Afternoon / night', desc: 'After 11am' },
        ]},
      ]},
      { name: 'Your week', sub: 'How your days are structured', questions: [
        { id: 'habits', q: 'Which habits do you want to track?', type: 'multi', hint: 'Your top selections become the tracker rows in your planner.', options: ['Exercise','Water intake','Reading','Meditation','Sleep 8hrs','Journaling','No social media','Cook at home','Vitamins','Stretch / yoga','Walk 10k steps','Savings deposit'] },
        { id: 'tasks', q: 'How many key tasks do you usually complete per day?', type: 'single', options: [
          { label: '1–3 tasks', desc: 'Focused, high-priority only' },
          { label: '4–6 tasks', desc: 'Solid daily output' },
          { label: '7+ tasks', desc: 'Full task list every day' },
        ]},
        { id: 'layout', q: 'Do you prefer time-blocking or an open task list?', type: 'single', options: [
          { label: 'Time-blocking', desc: 'Assign tasks to specific time slots' },
          { label: 'Open task list', desc: 'Flexible list to check off throughout the day' },
        ]},
        { id: 'reflect', q: 'Would you like a reflection or gratitude section?', type: 'single', options: [
          { label: 'Both', desc: 'Reflection + gratitude prompts' },
          { label: 'Just gratitude', desc: '3 things I\'m grateful for' },
          { label: 'Skip it', desc: 'Keep it purely practical' },
        ]},
      ]},
      { name: 'Your style', sub: 'Visual preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'weekstart', q: 'Which day starts your week?', type: 'single', options: [
          { label: 'Monday', desc: 'Mon – Sun layout' },
          { label: 'Sunday', desc: 'Sun – Sat layout' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  meal: {
    id: 'meal', name: 'Meal Planner', icon: '🥗',
    tagline: '7-day meals, shopping list, macros & prep schedule',
    desc: '7-day personalized meal plan with breakfast, lunch and dinner slots, smart shopping list, and optional macro tracking.',
    features: ['7-day breakfast, lunch & dinner grid', 'AI-generated shopping list from your meals', 'Prep schedule & batch cooking notes', 'Optional macro / calorie tracking columns'],
    stages: [
      { name: 'About you', sub: 'Your kitchen context', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Maria', required: true },
        { id: 'people', q: 'How many people are you meal planning for?', type: 'single', options: [
          { label: 'Just me', desc: 'Single-serve portions' },
          { label: 'Me + partner', desc: 'Cooking for two' },
          { label: 'Family of 3–4', desc: 'Family-sized portions' },
          { label: 'Family of 5+', desc: 'Large family cooking' },
        ]},
        { id: 'diet', q: 'Any dietary preferences or restrictions?', type: 'multi', options: ['Vegetarian','Vegan','Gluten-free','Dairy-free','Low carb','Keto','Halal','None / no restrictions'] },
        { id: 'skill', q: 'How confident are you in the kitchen?', type: 'single', options: [
          { label: 'Beginner', desc: 'Simple recipes only' },
          { label: 'Comfortable', desc: 'Most recipes are fine' },
          { label: 'Experienced', desc: 'Happy to try anything' },
          { label: 'Love to cook', desc: 'The more complex the better' },
        ]},
      ]},
      { name: 'Your meals', sub: 'What goes in your plan', questions: [
        { id: 'mealsperday', q: 'How many meals per day do you want planned?', type: 'single', options: [
          { label: '2 meals', desc: 'Lunch & dinner' },
          { label: '3 meals', desc: 'Breakfast, lunch & dinner' },
          { label: '3 meals + snacks', desc: 'Full day including snacks' },
        ]},
        { id: 'cooktime', q: 'How much time can you spend cooking per day?', type: 'single', options: [
          { label: 'Under 20 mins', desc: 'Quick & easy only' },
          { label: '20–40 mins', desc: 'Moderate prep time' },
          { label: '40–60 mins', desc: 'Happy to cook properly' },
          { label: '60+ mins', desc: 'Love a long cook session' },
        ]},
        { id: 'shopping', q: 'Do you want a shopping list included?', type: 'single', options: [
          { label: 'Yes — by aisle', desc: 'Organized by store section' },
          { label: 'Yes — simple list', desc: 'All items together' },
          { label: 'No thanks', desc: 'Meal plan only' },
        ]},
        { id: 'tracking', q: 'Would you like macro or calorie tracking columns?', type: 'single', options: [
          { label: 'Yes — calories', desc: 'Calorie count per meal' },
          { label: 'Yes — macros', desc: 'Protein, carbs & fat' },
          { label: 'No tracking', desc: 'Keep it simple' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'weeks', q: 'How many weeks do you want to plan?', type: 'single', options: [
          { label: '1 week', desc: 'Single week plan' },
          { label: '2 weeks', desc: 'Two week rotation' },
          { label: 'Full month', desc: '4 weeks at a glance' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  fitness: {
    id: 'fitness', name: 'Fitness Planner', icon: '🏃',
    tagline: 'Workouts, rest days, progress tracking & goals',
    desc: 'Weekly workout schedule built around your goals and fitness level — with rest days, progress tracking and optional nutrition log.',
    features: ['Custom workout schedule by day', 'Cardio + strength split based on your goals', 'Progress & body measurement tracker', 'Rest day & recovery planning'],
    stages: [
      { name: 'About you', sub: 'Your fitness starting point', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Jordan', required: true },
        { id: 'level', q: 'How would you describe your current fitness level?', type: 'single', options: [
          { label: 'Just starting', desc: 'New to regular exercise' },
          { label: 'Getting back into it', desc: 'Had a break, rebuilding' },
          { label: 'Consistent', desc: 'Regular workouts already' },
          { label: 'Advanced', desc: 'Training seriously' },
        ]},
        { id: 'goal', q: "What's your primary fitness goal?", type: 'single', options: [
          { label: 'Lose weight', desc: 'Fat loss & body composition' },
          { label: 'Build muscle', desc: 'Strength & size gains' },
          { label: 'Improve endurance', desc: 'Cardio & stamina' },
          { label: 'General health', desc: 'Feel better overall' },
          { label: 'Train for an event', desc: 'Race, competition or challenge' },
        ]},
        { id: 'days', q: 'How many days per week can you work out?', type: 'single', options: [
          { label: '2 days', desc: 'Minimal time commitment' },
          { label: '3 days', desc: 'Good baseline schedule' },
          { label: '4 days', desc: 'Serious commitment' },
          { label: '5+ days', desc: 'High frequency training' },
        ]},
      ]},
      { name: 'Your training', sub: 'How your workouts are structured', questions: [
        { id: 'type', q: 'What types of workouts do you prefer?', type: 'multi', options: ['Weightlifting','Running','HIIT','Yoga / Pilates','Cycling','Swimming','Home workouts','Sports & games','Hiking / outdoors','CrossFit'] },
        { id: 'equipment', q: 'Do you have access to a gym?', type: 'single', options: [
          { label: 'Yes — full gym', desc: 'All equipment available' },
          { label: 'Yes — basic gym', desc: 'Limited machines' },
          { label: 'Home setup', desc: 'Dumbbells, bands, mat' },
          { label: 'No equipment', desc: 'Bodyweight only' },
        ]},
        { id: 'limitations', q: 'Any injuries or physical limitations?', type: 'single', options: [
          { label: 'None', desc: 'No restrictions' },
          { label: 'Lower body', desc: 'Knees, hips or ankles' },
          { label: 'Upper body', desc: 'Shoulders, elbows or wrists' },
          { label: "I'll note in the planner", desc: 'Will specify on the page' },
        ]},
        { id: 'nutrition', q: 'Would you like a nutrition or water intake tracker?', type: 'single', options: [
          { label: 'Yes — both', desc: 'Nutrition + hydration log' },
          { label: 'Just water', desc: 'Daily hydration tracking' },
          { label: 'Just nutrition', desc: 'Meal & calorie log' },
          { label: 'No thanks', desc: 'Workouts only' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'weekstart', q: 'Which day starts your week?', type: 'single', options: [
          { label: 'Monday', desc: 'Mon – Sun layout' },
          { label: 'Sunday', desc: 'Sun – Sat layout' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  budget: {
    id: 'budget', name: 'Budget Planner', icon: '💰',
    tagline: 'Income, expenses, savings goals & spending tracker',
    desc: 'Monthly income and expense tracker with custom spending categories, savings goals, debt tracker and net worth snapshot.',
    features: ['Income vs expenses overview', 'Custom spending categories', 'Savings goal progress tracker', 'Monthly net worth snapshot'],
    stages: [
      { name: 'About you', sub: 'Your financial context', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Alex', required: true },
        { id: 'paycycle', q: 'How often do you get paid?', type: 'single', options: [
          { label: 'Weekly', desc: 'Every week' },
          { label: 'Bi-weekly', desc: 'Every two weeks' },
          { label: 'Twice a month', desc: '1st and 15th' },
          { label: 'Monthly', desc: 'Once per month' },
        ]},
        { id: 'experience', q: 'How would you describe your budgeting experience?', type: 'single', options: [
          { label: 'Never budgeted', desc: 'Starting from scratch' },
          { label: 'Tried but struggled', desc: 'Hard to stay consistent' },
          { label: 'Somewhat consistent', desc: 'Good some months' },
          { label: 'Disciplined budgeter', desc: 'Looking to optimize' },
        ]},
        { id: 'primarygoal', q: "What's your primary financial goal right now?", type: 'single', options: [
          { label: 'Pay off debt', desc: 'Clear credit cards or loans' },
          { label: 'Build emergency fund', desc: '3–6 months of expenses' },
          { label: 'Save for a purchase', desc: 'Car, home, vacation' },
          { label: 'Grow investments', desc: 'Long-term wealth building' },
          { label: 'Just track spending', desc: 'Understand where money goes' },
        ]},
      ]},
      { name: 'Your money', sub: 'What to track and how', questions: [
        { id: 'categories', q: 'Which spending categories do you want to track?', type: 'multi', options: ['Housing / rent','Food & groceries','Transport','Subscriptions','Dining out','Shopping','Healthcare','Entertainment','Savings','Debt payments','Utilities','Personal care'] },
        { id: 'savings', q: 'Do you want a dedicated savings goal tracker?', type: 'single', options: [
          { label: 'Yes — with progress bar', desc: 'Visual goal tracking' },
          { label: 'Yes — simple', desc: 'Basic running total' },
          { label: 'No', desc: 'Skip savings section' },
        ]},
        { id: 'debt', q: 'Do you want a debt payoff tracker?', type: 'single', options: [
          { label: 'Yes', desc: 'Track balance, rate & payments' },
          { label: 'No', desc: 'Skip debt section' },
        ]},
        { id: 'method', q: 'Which budgeting method do you prefer?', type: 'single', options: [
          { label: '50/30/20 rule', desc: 'Needs / wants / savings split' },
          { label: 'Zero-based', desc: 'Every dollar assigned a job' },
          { label: 'Envelope method', desc: 'Cash categories system' },
          { label: 'Just track totals', desc: 'Income minus expenses' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'period', q: 'Budget period view', type: 'single', options: [
          { label: 'Weekly view', desc: 'Track by week' },
          { label: 'Monthly view', desc: 'Full month overview' },
          { label: 'Both', desc: 'Weekly + monthly summary' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  travel: {
    id: 'travel', name: 'Travel Planner', icon: '✈️',
    tagline: 'Itinerary, packing list, budget & booking tracker',
    desc: 'Day-by-day itinerary with activities, bookings tracker, packing checklist and a trip budget breakdown — personalized to your destination.',
    features: ['Day-by-day itinerary layout', 'Booking & confirmation tracker', 'AI-generated packing checklist', 'Trip budget breakdown by category'],
    stages: [
      { name: 'Trip basics', sub: 'Where and when', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Jamie', required: true },
        { id: 'destination', q: 'Where are you traveling to?', type: 'text', placeholder: 'e.g. Tokyo, Japan', required: true },
        { id: 'duration', q: 'How long is your trip?', type: 'single', options: [
          { label: 'Weekend (2–3 days)', desc: 'Quick getaway' },
          { label: 'Short trip (4–6 days)', desc: 'Extended break' },
          { label: '1–2 weeks', desc: 'Real vacation' },
          { label: '2+ weeks', desc: 'Extended adventure' },
        ]},
        { id: 'group', q: 'Who are you traveling with?', type: 'single', options: [
          { label: 'Solo', desc: 'Traveling alone' },
          { label: 'Partner', desc: 'Trip for two' },
          { label: 'Friends', desc: 'Friend group' },
          { label: 'Family with kids', desc: 'Family vacation' },
          { label: 'Group of 5+', desc: 'Large group' },
        ]},
      ]},
      { name: 'Your trip', sub: 'How you like to travel', questions: [
        { id: 'vibe', q: "What's your travel vibe?", type: 'single', options: [
          { label: 'Adventure & outdoors', desc: 'Hiking, exploring, adrenaline' },
          { label: 'Culture & sightseeing', desc: 'Museums, history, architecture' },
          { label: 'Relax & beach', desc: 'Sun, slow mornings, recharge' },
          { label: 'Food & nightlife', desc: 'Restaurants, bars, local scene' },
          { label: 'Mix of everything', desc: 'A bit of all of the above' },
        ]},
        { id: 'packing', q: 'Do you want a packing checklist included?', type: 'single', options: [
          { label: 'Yes — detailed by category', desc: 'Clothes, toiletries, tech, docs' },
          { label: 'Yes — simple list', desc: 'Single condensed list' },
          { label: 'No', desc: 'Itinerary only' },
        ]},
        { id: 'budget', q: "What's your rough daily budget per person?", type: 'single', options: [
          { label: 'Budget under $75/day', desc: 'Hostels, street food, local transport' },
          { label: 'Mid-range $75–150/day', desc: 'Hotels, restaurants, activities' },
          { label: 'Comfortable $150–250/day', desc: 'Nice hotels, dining out nightly' },
          { label: 'Luxury $250+/day', desc: 'Premium everything' },
        ]},
        { id: 'accommodation', q: 'What type of accommodation are you using?', type: 'single', options: [
          { label: 'Hotel', desc: 'Traditional hotel stay' },
          { label: 'Airbnb / vacation rental', desc: 'Home away from home' },
          { label: 'Hostel', desc: 'Budget-friendly social stay' },
          { label: 'Mix / not booked yet', desc: 'Still deciding' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'dateformat', q: 'Date format', type: 'single', options: [
          { label: 'US format (MM/DD)', desc: 'American style' },
          { label: 'International (DD/MM)', desc: 'European / international' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  study: {
    id: 'study', name: 'Study Planner', icon: '📚',
    tagline: 'Subject schedule, exam dates, revision & focus blocks',
    desc: 'Weekly study schedule organized by subject, with exam countdowns, revision checklists, focus session logs and deadline tracking.',
    features: ['Subject schedule & study blocks', 'Exam countdown tracker', 'Revision checklist by topic', 'Daily focus session log'],
    stages: [
      { name: 'About you', sub: 'Your academic context', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Taylor', required: true },
        { id: 'level', q: 'What level are you studying at?', type: 'single', options: [
          { label: 'High school', desc: 'Secondary / pre-college' },
          { label: 'Undergraduate', desc: "Bachelor's degree" },
          { label: 'Postgraduate', desc: "Master's or PhD" },
          { label: 'Professional cert', desc: 'CPA, bar exam, MCAT, etc.' },
          { label: 'Self-study', desc: 'Learning independently' },
        ]},
        { id: 'subjects', q: 'How many subjects or courses are you juggling?', type: 'single', options: [
          { label: '1–2', desc: 'Focused study load' },
          { label: '3–4', desc: 'Moderate workload' },
          { label: '5–6', desc: 'Heavy load' },
          { label: '7+', desc: 'Very demanding schedule' },
        ]},
        { id: 'challenge', q: "What's your biggest study challenge?", type: 'single', options: [
          { label: 'Staying consistent', desc: 'Hard to keep to a schedule' },
          { label: 'Managing deadlines', desc: 'Losing track of due dates' },
          { label: 'Retaining information', desc: 'Information not sticking' },
          { label: 'Avoiding distractions', desc: 'Focus is the main issue' },
          { label: 'Balancing with work', desc: 'Studying alongside a job' },
        ]},
      ]},
      { name: 'Your studies', sub: 'Courses and schedule', questions: [
        { id: 'subjectnames', q: 'List your subjects or course names', type: 'text', placeholder: 'e.g. Calculus, Chemistry, English Lit', required: false },
        { id: 'exams', q: 'Do you have exams or deadlines in the next 60 days?', type: 'single', options: [
          { label: 'Yes — several', desc: 'Multiple coming up soon' },
          { label: 'Yes — one or two', desc: 'A few key dates' },
          { label: 'Not yet', desc: 'Nothing immediate' },
          { label: 'No exams', desc: 'Coursework only' },
        ]},
        { id: 'hours', q: 'How many hours per day can you study?', type: 'single', options: [
          { label: '1–2 hrs', desc: 'Light study sessions' },
          { label: '2–4 hrs', desc: 'Standard study day' },
          { label: '4–6 hrs', desc: 'Intensive study mode' },
          { label: '6+ hrs', desc: 'Exam crunch time' },
        ]},
        { id: 'technique', q: 'What study technique works best for you?', type: 'single', options: [
          { label: 'Pomodoro', desc: '25-min focus + 5-min break' },
          { label: 'Deep work', desc: '90-min uninterrupted sessions' },
          { label: 'Spaced repetition', desc: 'Spread subjects across days' },
          { label: 'Flexible', desc: 'No fixed method — go by feel' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'weekstart', q: 'Which day starts your week?', type: 'single', options: [
          { label: 'Monday', desc: 'Mon – Sun layout' },
          { label: 'Sunday', desc: 'Sun – Sat layout' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  goals: {
    id: 'goals', name: 'Goal Tracker', icon: '🎯',
    tagline: '90-day goals, monthly milestones & daily habits',
    desc: '90-day goal planner with monthly milestones, weekly check-ins, and a daily habit tracker — built around your specific ambitions.',
    features: ['90-day goal breakdown', 'Monthly milestone tracker', 'Weekly progress check-in', 'Daily habit grid (AI-personalized)'],
    stages: [
      { name: 'About you', sub: 'Your goal-setting context', questions: [
        { id: 'name', q: "What's your first name?", type: 'text', placeholder: 'e.g. Morgan', required: true },
        { id: 'timeframe', q: 'What timeframe are you planning for?', type: 'single', options: [
          { label: '30 days', desc: 'Monthly sprint' },
          { label: '60 days', desc: 'Two-month focus' },
          { label: '90 days', desc: 'Quarterly planning' },
          { label: 'Full year', desc: 'Annual goal map' },
        ]},
        { id: 'areas', q: 'Which areas of life are you focused on?', type: 'multi', options: ['Health & fitness','Career & business','Finances','Relationships','Personal development','Creativity','Travel','Mindset & spirituality','Education','Home & lifestyle'] },
        { id: 'trackstyle', q: 'How do you prefer to track progress?', type: 'single', options: [
          { label: 'Numbers and data', desc: 'Metrics, scores, percentages' },
          { label: 'Visual progress bars', desc: 'Seeing the bar fill up' },
          { label: 'Daily check-ins', desc: 'Brief daily logging' },
          { label: 'Weekly reflections', desc: 'End-of-week reviews' },
        ]},
      ]},
      { name: 'Your goals', sub: "What you're working toward", questions: [
        { id: 'maingoal', q: "What's your single most important goal right now?", type: 'text', placeholder: 'e.g. Run a 5K, Save $5,000, Launch my business', required: true },
        { id: 'habits', q: 'Which daily habits do you want to build?', type: 'multi', options: ['Exercise','Meditation','Reading','Journaling','Cold shower','No alcohol','Wake up early','Networking','Creative practice','Gratitude','No junk food','Save money daily'] },
        { id: 'accountability', q: 'How do you prefer to hold yourself accountable?', type: 'single', options: [
          { label: 'Self-accountability', desc: 'Just me and the planner' },
          { label: 'Share with a friend', desc: 'Accountability partner' },
          { label: 'Public commitment', desc: 'Posting progress publicly' },
          { label: 'Reward system', desc: 'Treats for hitting milestones' },
        ]},
        { id: 'checkin', q: 'How often do you want to check in on your progress?', type: 'single', options: [
          { label: 'Daily', desc: 'Every single day' },
          { label: 'Every few days', desc: '3–4 times a week' },
          { label: 'Weekly', desc: 'Once a week review' },
          { label: 'Monthly', desc: 'Monthly milestone check' },
        ]},
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'startdate', q: 'When are you starting?', type: 'single', options: [
          { label: 'This week', desc: 'Starting immediately' },
          { label: 'Next week', desc: 'Starting fresh on Monday' },
          { label: 'Start of next month', desc: 'Clean calendar start' },
          { label: 'Custom date', desc: "I'll mark it manually" },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
  wedding: {
    id: 'wedding', name: 'Wedding Planner', icon: '💍',
    tagline: 'Timeline, vendor checklist, budget & guest tracker',
    desc: 'Full planning timeline with vendor tracking, budget overview, guest list management and monthly milestone checklist.',
    features: ['12-month planning timeline', 'Vendor contact & status tracker', 'Budget overview by category', 'Guest list with RSVP tracker'],
    stages: [
      { name: 'About you', sub: 'Your wedding basics', questions: [
        { id: 'names', q: "What are your names? (You & your partner)", type: 'text', placeholder: 'e.g. Sarah & James', required: true },
        { id: 'date', q: 'How far away is your wedding date?', type: 'single', options: [
          { label: 'Under 3 months', desc: 'Final planning sprint' },
          { label: '3–6 months', desc: 'Critical planning phase' },
          { label: '6–12 months', desc: 'Solid planning window' },
          { label: '12–18 months', desc: 'Early planning stage' },
          { label: '18+ months', desc: 'Just getting started' },
          { label: 'Not set yet', desc: 'Still deciding on the date' },
        ]},
        { id: 'guests', q: 'Roughly how many guests are you expecting?', type: 'single', options: [
          { label: 'Under 30', desc: 'Intimate ceremony' },
          { label: '30–75', desc: 'Small to mid-size wedding' },
          { label: '75–150', desc: 'Medium wedding' },
          { label: '150–300', desc: 'Large celebration' },
          { label: '300+', desc: 'Grand event' },
        ]},
        { id: 'vision', q: 'What kind of wedding are you envisioning?', type: 'single', options: [
          { label: 'Intimate & romantic', desc: 'Small, personal, deeply meaningful' },
          { label: 'Classic & traditional', desc: 'Timeless, formal, elegant' },
          { label: 'Big celebration', desc: 'Lively, festive, unforgettable party' },
          { label: 'Destination wedding', desc: 'Travel required for guests' },
        ]},
      ]},
      { name: 'Your planning', sub: 'What you need to track', questions: [
        { id: 'budget', q: "What's your overall wedding budget?", type: 'single', options: [
          { label: 'Under $10,000', desc: 'Budget-conscious celebration' },
          { label: '$10,000 – $25,000', desc: 'Modest but special' },
          { label: '$25,000 – $50,000', desc: 'Mid-range celebration' },
          { label: '$50,000 – $100,000', desc: 'Upscale wedding' },
          { label: '$100,000+', desc: 'Luxury event' },
        ]},
        { id: 'vendors', q: 'Which vendors do you still need to book?', type: 'multi', options: ['Venue','Photographer','Videographer','Caterer','Florist','DJ or band','Officiant','Hair & makeup','Transport','Wedding cake','Invitations','Rentals'] },
        { id: 'guesttracker', q: 'Do you want a guest list and RSVP tracker?', type: 'single', options: [
          { label: 'Yes — detailed', desc: 'Name, meal, RSVP, dietary needs' },
          { label: 'Yes — simple', desc: 'Name + RSVP status only' },
          { label: 'No thanks', desc: 'Skip guest section' },
        ]},
        { id: 'extras', q: 'What other sections would help you most?', type: 'multi', options: ['Seating chart','Ceremony order','Day-of timeline','Honeymoon planning','Thank-you card tracker','Vendor contacts list','Week-of checklist','Morning-of schedule'] },
      ]},
      { name: 'Your style', sub: 'Layout preferences', questions: [
        { id: 'theme', q: 'Color theme', type: 'theme' },
        { id: 'density', q: 'Layout density', type: 'single', options: [
          { label: 'Spacious', desc: 'Lots of writing room' },
          { label: 'Balanced', desc: 'Structure + space' },
          { label: 'Compact', desc: 'Maximum content' },
        ]},
        { id: 'timeline', q: 'Planning timeline view', type: 'single', options: [
          { label: 'Monthly milestones', desc: 'Month-by-month checklist' },
          { label: 'Weekly tasks', desc: 'Week-by-week breakdown' },
          { label: 'Both', desc: 'Full overview + detail' },
        ]},
        { id: 'paper', q: 'Paper size', type: 'single', options: [
          { label: 'Letter (8.5×11)', desc: 'US standard, most printers' },
          { label: 'A4', desc: 'International standard' },
        ]},
      ]},
    ],
  },
}

const PLANNER_ORDER = ['weekly','meal','fitness','budget','travel','study','goals','wedding']

// ─── SEO ARTICLES ─────────────────────────────────────────────────────────────
const ARTICLES = [
  { id: 'why-printable-planners', title: 'Why Printable Planners Work Better Than Apps (For Most People)', tag: 'POPULAR', category: 'Planning Tips', excerpt: 'Digital planners have their place — but there\'s a reason millions of people still reach for a printed page. We look at the science of writing by hand and why print wins for most planning goals.' },
  { id: 'best-printable-weekly-planner', title: 'What Makes the Best Printable Weekly Planner in 2026?', tag: 'GUIDE', category: 'Weekly Planning', excerpt: 'Not all weekly planners are created equal. Here\'s what to look for — and what to avoid — when choosing or generating your weekly planner layout.' },
  { id: 'free-meal-planner-printable', title: 'How to Use a Free Meal Planner Printable to Save Time and Money', tag: 'MEAL', category: 'Meal Planning', excerpt: 'A meal planner printable is one of the simplest ways to cut your grocery bill, reduce food waste, and stop asking "what\'s for dinner?" every night.' },
  { id: 'fitness-planner-beginners', title: 'The Best Fitness Planner Printable for Beginners Who Hate the Gym', tag: 'FITNESS', category: 'Fitness', excerpt: 'You don\'t need a complex training program. You need a simple fitness planner that matches your actual life — schedule, equipment, and all.' },
  { id: 'budget-planner-printable-guide', title: 'How a Budget Planner Printable Helped Me Save $8,000 in One Year', tag: 'MONEY', category: 'Budget Planning', excerpt: 'The act of writing your finances by hand creates accountability that apps simply can\'t replicate. Here\'s the exact budget planner approach that works.' },
  { id: 'wedding-planner-printable', title: 'The Free Wedding Planner Printable Every Bride Needs in 2026', tag: 'WEDDING', category: 'Wedding Planning', excerpt: 'From 12 months out to the morning of, a well-organized wedding planner printable is the difference between calm and chaos on your big day.' },
  { id: 'study-planner-exam-tips', title: 'How to Build a Study Planner That Actually Survives Exam Season', tag: 'STUDY', category: 'Study Planning', excerpt: 'Most study planners fail by week two. Here\'s the structure that keeps students on track — from subject scheduling to exam countdown management.' },
  { id: 'goal-tracker-printable', title: 'The 90-Day Goal Tracker Printable That Helped 1,000s Hit Their Goals', tag: 'GOALS', category: 'Goal Setting', excerpt: 'Research shows that writing down goals makes you 42% more likely to achieve them. A printed 90-day tracker takes that even further with daily accountability.' },
  { id: 'travel-planner-printable', title: 'How to Use a Travel Planner Printable to Plan the Perfect Trip', tag: 'TRAVEL', category: 'Travel Planning', excerpt: 'From booking confirmations to day-by-day itineraries, a printed travel planner keeps everything in one place — no wifi required.' },
  { id: 'habit-tracker-printable', title: 'How to Build Habits That Stick With a Printable Habit Tracker', tag: 'HABITS', category: 'Habit Building', excerpt: 'The "don\'t break the chain" method is decades old — and still works. Here\'s how to use a printed habit tracker to build lasting routines.' },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  // Layout
  page: { minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" },
  // Nav
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 40px', borderBottom: '1px solid #E8E4D8', background: '#FAFAF8', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#1a1a18', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  logoMark: { width: 28, height: 28, borderRadius: '50%', background: '#2D5A1B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navLinks: { display: 'flex', gap: 28, listStyle: 'none' },
  navLink: { fontSize: 13, color: '#6B6B5E', cursor: 'pointer', transition: 'color 0.15s' },
  navCta: { padding: '9px 20px', borderRadius: 20, background: '#2D5A1B', color: '#EAF3DE', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.18s' },
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  return (
    <nav style={S.nav}>
      <div style={S.logo} onClick={() => setPage('home')}>
        <div style={S.logoMark}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="4" stroke="#EAF3DE" strokeWidth="1.5"/>
            <line x1="7" y1="3" x2="7" y2="11" stroke="#EAF3DE" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="3" y1="7" x2="11" y2="7" stroke="#EAF3DE" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
        PrintMyPlanner
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        <span style={S.navLink} onClick={() => setPage('home')}>Planner Types</span>
        <span style={S.navLink} onClick={() => setPage('guides')}>Guides</span>
      </div>
      <button style={S.navCta} onClick={() => setPage('create')}
        onMouseOver={e => { e.target.style.background = '#3B6D11'; e.target.style.transform = 'translateY(-1px)' }}
        onMouseOut={e => { e.target.style.background = '#2D5A1B'; e.target.style.transform = 'translateY(0)' }}>
        Create free planner
      </button>
    </nav>
  )
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: '#1a1a14', borderTop: '1px solid #2a2a20', padding: '48px 40px 32px', marginTop: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 500, color: '#EAF3DE', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ ...S.logoMark, width: 24, height: 24 }}>
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="4" stroke="#EAF3DE" strokeWidth="1.5"/><line x1="7" y1="3" x2="7" y2="11" stroke="#EAF3DE" strokeWidth="1.2" strokeLinecap="round"/><line x1="3" y1="7" x2="11" y2="7" stroke="#EAF3DE" strokeWidth="1.2" strokeLinecap="round"/></svg>
              </div>
              PrintMyPlanner
            </div>
            <div style={{ fontSize: 13, color: '#8a8a7a', lineHeight: 1.7, maxWidth: 260 }}>Free AI-powered custom planner generator. No account needed. No watermarks. Forever free.</div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#639922', marginBottom: 14, fontWeight: 500 }}>Planners</div>
            {PLANNER_ORDER.map(id => (
              <div key={id} style={{ fontSize: 13, color: '#8a8a7a', marginBottom: 8, cursor: 'pointer' }} onClick={() => setPage('create')}>{PLANNER_TYPES[id].name}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#639922', marginBottom: 14, fontWeight: 500 }}>Guides</div>
            {ARTICLES.slice(0, 5).map(a => (
              <div key={a.id} style={{ fontSize: 13, color: '#8a8a7a', marginBottom: 8, cursor: 'pointer' }} onClick={() => setPage(a.id)}>{a.category}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#639922', marginBottom: 14, fontWeight: 500 }}>Site</div>
            {['About','Privacy Policy','Affiliate Disclosure'].map(l => (
              <div key={l} style={{ fontSize: 13, color: '#8a8a7a', marginBottom: 8 }}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #2a2a20', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#5a5a4a' }}>© 2026 PrintMyPlanner. Free to use, always.</div>
          <div style={{ fontSize: 12, color: '#5a5a4a' }}>Made with AI · Printed with love</div>
        </div>
      </div>
    </footer>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage, selectedType, setSelectedType }) {
  const t = THEMES.green
  const pt = PLANNER_TYPES[selectedType]

  const plannerPreviewContent = {
    weekly: () => (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 12 }}>
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} style={{ border: `1px solid ${i===3?t.mid:t.border}`, borderRadius: 5, padding: '5px 3px', textAlign: 'center', background: i===3?t.pale:'transparent' }}>
              <div style={{ fontSize: 7, color: t.mid, textTransform: 'uppercase', marginBottom: 3 }}>{d}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: t.main }}>{17+i}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.mid, borderBottom: `1px solid ${t.border}`, paddingBottom: 3, marginBottom: 7 }}>Habit tracker</div>
        {[['Morning run',[1,1,1,0,0,0,0]],['8 glasses water',[1,1,1,1,0,0,0]],['Read 20 mins',[1,0,1,0,0,0,0]]].map(([n,dots]) => (
          <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: '#555' }}>{n}</span>
            <div style={{ display: 'flex', gap: 3 }}>{dots.map((v,i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', border: `1px solid ${t.mid}`, background: v ? t.main : 'transparent' }}/>)}</div>
          </div>
        ))}
      </div>
    ),
    meal: () => (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr', gap: 3, marginBottom: 8 }}>
          {['','B','L','D'].map((h,i) => <div key={i} style={{ fontSize: 8, color: t.mid, fontWeight: 500, textAlign: i>0?'center':'left', paddingBottom: 3 }}>{h}</div>)}
          {[['Mon','Oats','Salad','Pasta'],['Tue','Eggs','Wrap','Chicken'],['Wed','Smoothie','Bowl','Stir-fry']].map(([d,...m]) => (
            [<div key={d} style={{ fontSize: 9, color: t.main, fontWeight: 500, paddingTop: 2 }}>{d}</div>,
             ...m.map((meal,i) => <div key={i} style={{ fontSize: 8, border: `1px solid ${t.border}`, borderRadius: 3, padding: '3px 4px', color: '#555', textAlign: 'center' }}>{meal}</div>)]
          ))}
        </div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.mid, borderBottom: `1px solid ${t.border}`, paddingBottom: 3, marginBottom: 6 }}>Shopping list</div>
        {['Chicken breast','Brown rice','Mixed greens','Greek yogurt'].map(item => (
          <div key={item} style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, border: `1px solid ${t.mid}`, borderRadius: 2, flexShrink: 0 }}/>
            <span style={{ fontSize: 9, color: '#555' }}>{item}</span>
          </div>
        ))}
      </div>
    ),
    fitness: () => (
      <div>
        {[{d:'Mon',w:'Upper body',c:'Push + pull'},{d:'Tue',w:'Cardio',c:'30 min run'},{d:'Wed',w:'Lower body',c:'Squat focus'},{d:'Thu',w:'Rest',c:'Stretch & recover'},{d:'Fri',w:'Full body',c:'HIIT 40 min'}].map(({d,w,c}) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: t.main, width: 22 }}>{d}</div>
            <div style={{ flex: 1, border: `1px solid ${w==='Rest'?t.border:t.mid}`, borderRadius: 5, padding: '4px 8px', background: w==='Rest'?'transparent':t.pale }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: t.text }}>{w}</div>
              <div style={{ fontSize: 9, color: '#777' }}>{c}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    budget: () => (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
          {[['Income','$4,200',t.main],['Expenses','$3,150','#888'],['Savings','$1,050',t.mid]].map(([l,v,c]) => (
            <div key={l} style={{ border: `1px solid ${t.border}`, borderRadius: 5, padding: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        {[['Housing',38,t.main],['Food',22,t.mid],['Transport',18,'#888'],['Fun',12,t.border]].map(([cat,pct,col]) => (
          <div key={cat} style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 2 }}>
              <span style={{ color: '#555' }}>{cat}</span><span style={{ color: t.text }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: '#eee', borderRadius: 2 }}>
              <div style={{ width: pct+'%', height: '100%', background: col, borderRadius: 2 }}/>
            </div>
          </div>
        ))}
      </div>
    ),
    travel: () => (
      <div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.mid, borderBottom: `1px solid ${t.border}`, paddingBottom: 3, marginBottom: 8 }}>Day-by-day itinerary</div>
        {[['Day 1','Arrive, check in, explore'],['Day 2','Morning tour, lunch, museum'],['Day 3','Day trip, local market'],['Day 4','Spa, city walk, depart']].map(([d,a]) => (
          <div key={d} style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
            <div style={{ background: t.pale, color: t.main, fontSize: 8, fontWeight: 500, padding: '2px 5px', borderRadius: 3, border: `1px solid ${t.border}`, whiteSpace: 'nowrap' }}>{d}</div>
            <div style={{ fontSize: 9, color: '#555', lineHeight: 1.4, paddingTop: 1 }}>{a}</div>
          </div>
        ))}
      </div>
    ),
    study: () => (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(5,1fr)', gap: 3, marginBottom: 10 }}>
          {['','Mon','Tue','Wed','Thu','Fri'].map((d,i) => <div key={i} style={{ fontSize: 8, textAlign: 'center', color: t.mid, fontWeight: 500 }}>{d}</div>)}
          {[['9am','Math','—','History','—','English'],['11am','—','Science','Math','English','—'],['2pm','Spanish','Math','—','Science','Spanish']].map(([time,...slots]) => (
            [<div key={time} style={{ fontSize: 8, color: '#888', paddingTop: 2 }}>{time}</div>,
             ...slots.map((s,i) => <div key={i} style={{ fontSize: 8, textAlign: 'center', border: `1px solid ${s==='—'?'#eee':t.border}`, borderRadius: 3, padding: '3px 2px', background: s==='—'?'transparent':t.pale, color: s==='—'?'#ccc':t.main }}>{s}</div>)]
          ))}
        </div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', color: t.mid, marginBottom: 5 }}>Exam countdown</div>
        {[['Math final','14 days'],['History essay','6 days']].map(([e,d]) => (
          <div key={e} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 9 }}>
            <span style={{ color: '#555' }}>{e}</span><span style={{ color: t.main, fontWeight: 500 }}>{d}</span>
          </div>
        ))}
      </div>
    ),
    goals: () => (
      <div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', color: t.mid, marginBottom: 8 }}>90-day goals</div>
        {[['Run a 5K','68%'],['Save $2,000','45%'],['Read 6 books','83%']].map(([g,p]) => (
          <div key={g} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
              <span style={{ color: '#555', fontWeight: 500 }}>{g}</span><span style={{ color: t.main }}>{p}</span>
            </div>
            <div style={{ height: 5, background: '#eee', borderRadius: 3 }}>
              <div style={{ width: p, height: '100%', background: t.main, borderRadius: 3 }}/>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 8, textTransform: 'uppercase', color: t.mid, marginTop: 10, marginBottom: 6 }}>Daily habits</div>
        {[['Exercise',[1,1,0,1,0]],['Meditate',[1,1,1,1,0]],['Journal',[1,0,1,0,0]]].map(([n,dots]) => (
          <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#555' }}>{n}</span>
            <div style={{ display: 'flex', gap: 3 }}>{dots.map((v,i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', border: `1px solid ${t.mid}`, background: v?t.main:'transparent' }}/>)}</div>
          </div>
        ))}
      </div>
    ),
    wedding: () => (
      <div>
        <div style={{ fontSize: 8, textTransform: 'uppercase', color: t.mid, marginBottom: 8 }}>Planning timeline</div>
        {[['12 months out','Venue & photographer','done'],['9 months','Catering, florist, dress','in progress'],['6 months','Invitations & menu','upcoming'],['3 months','Final details','upcoming']].map(([m,task,s]) => {
          const col = s==='done'?t.main:s==='in progress'?t.mid:'#aaa'
          return (
            <div key={m} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 2 }}/>
              <div><div style={{ fontSize: 9, fontWeight: 500, color: col }}>{m}</div><div style={{ fontSize: 8, color: '#777' }}>{task}</div></div>
            </div>
          )
        })}
      </div>
    ),
  }

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '72px 40px 56px', textAlign: 'center', borderBottom: '1px solid #E8E4D8', background: 'linear-gradient(180deg,#F5FAF0 0%,#FAFAF8 100%)' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6D11', fontWeight: 500, marginBottom: 16 }}>Free · Instant · Personalized</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 500, lineHeight: 1.1, color: '#1a1a14', margin: '0 0 18px' }}>
          Your custom planner,<br /><em style={{ fontStyle: 'italic', color: '#3B6D11' }}>ready in 60 seconds</em>
        </h1>
        <p style={{ fontSize: 17, color: '#6B6B5E', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Answer a few questions, choose your style, and get a beautifully designed printable planner — personalized to your exact life. Free, forever.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
          {PLANNER_ORDER.map(id => (
            <button key={id}
              onClick={() => setSelectedType(id)}
              style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, border: `1px solid ${selectedType===id?'#639922':'#D8D4C8'}`, background: selectedType===id?'#EAF3DE':'white', color: selectedType===id?'#2D5A1B':'#6B6B5E', cursor: 'pointer', fontWeight: selectedType===id?500:400, transition: 'all 0.18s', fontFamily: "'DM Sans', sans-serif" }}>
              {PLANNER_TYPES[id].name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button onClick={() => { setPage('create') }}
            style={{ padding: '14px 32px', borderRadius: 26, background: '#2D5A1B', color: '#EAF3DE', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.18s', fontFamily: "'DM Sans', sans-serif" }}
            onMouseOver={e => { e.currentTarget.style.background='#3B6D11'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseOut={e => { e.currentTarget.style.background='#2D5A1B'; e.currentTarget.style.transform='translateY(0)' }}>
            Build my {PLANNER_TYPES[selectedType].name} →
          </button>
          <button onClick={() => setPage('guides')}
            style={{ padding: '14px 22px', borderRadius: 26, background: 'transparent', border: '1px solid #D8D4C8', color: '#6B6B5E', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            See planner guides
          </button>
        </div>
      </section>

      {/* Planner type cards */}
      <section style={{ padding: '56px 40px', borderBottom: '1px solid #E8E4D8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8a7a', marginBottom: 24, fontWeight: 500 }}>Choose your planner type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {PLANNER_ORDER.map(id => {
              const p = PLANNER_TYPES[id]
              const isSelected = selectedType === id
              const iconBg = {weekly:'#EAF3DE',meal:'#FAEEDA',fitness:'#FAECE7',budget:'#EAF3DE',travel:'#E6F1FB',study:'#EEEDFE',goals:'#FAEEDA',wedding:'#FBEAF0'}[id]
              return (
                <div key={id} onClick={() => { setSelectedType(id); setPage('create') }}
                  style={{ background: 'white', border: `${isSelected?'1.5px':'1px'} solid ${isSelected?'#3B6D11':'#E8E4D8'}`, borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='#639922'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(59,109,17,0.1)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor=isSelected?'#3B6D11':'#E8E4D8'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a14', marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#8a8a7a', lineHeight: 1.5 }}>{p.tagline}</div>
                  {p.badge && <div style={{ marginTop: 8, display: 'inline-block', fontSize: 9, padding: '2px 8px', borderRadius: 10, background: '#EAF3DE', color: '#2D5A1B', border: '1px solid #C0DD97', fontWeight: 500 }}>{p.badge}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '56px 40px', borderBottom: '1px solid #E8E4D8', background: '#F5FAF0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3B6D11', fontWeight: 500, marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 500, color: '#1a1a14', margin: 0 }}>Three steps to your perfect planner</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              { n: '01', title: 'Pick your planner & answer questions', desc: 'Choose a type, then tell us about your goals, schedule, and preferences. Three stages, about 90 seconds total.' },
              { n: '02', title: 'Choose your style', desc: 'Pick a color theme and layout density. Your planner is generated in real time using AI — personalized to your exact answers.' },
              { n: '03', title: 'Download & print', desc: 'Get a print-ready PDF in seconds. Works on any printer — Letter or A4. No account needed, ever.' },
            ].map(s => (
              <div key={s.n} style={{ background: 'white', border: '1px solid #E8E4D8', borderRadius: 12, padding: 24 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 500, color: '#639922', marginBottom: 12 }}>{s.n}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a14', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6B6B5E', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview Section */}
      <section style={{ padding: '56px 40px', borderBottom: '1px solid #E8E4D8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Planner preview */}
          <div style={{ background: '#FAFAF5', border: '1px solid #E8E4D8', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px 14px', borderBottom: `2px solid ${t.main}`, background: t.pale, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500, color: t.main }}>{pt.name}</div>
                <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.mid, marginTop: 3 }}>Created for you · {new Date().toLocaleString('default',{month:'long',year:'numeric'})}</div>
              </div>
              <div style={{ fontSize: 10, color: '#888', textAlign: 'right' }}>Sample preview</div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              {plannerPreviewContent[selectedType] && plannerPreviewContent[selectedType]()}
            </div>
          </div>

          {/* Controls */}
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: '#1a1a14', marginBottom: 8 }}>{pt.name}</div>
            <div style={{ fontSize: 14, color: '#6B6B5E', lineHeight: 1.65, marginBottom: 24 }}>{pt.desc}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
              {pt.features.map(f => (
                <li key={f} style={{ fontSize: 13, color: '#6B6B5E', padding: '7px 0', borderBottom: '1px solid #E8E4D8', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#2D5A1B', fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => setPage('create')}
              style={{ width: '100%', padding: 14, borderRadius: 10, background: '#2D5A1B', color: '#EAF3DE', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s' }}
              onMouseOver={e => { e.currentTarget.style.background='#3B6D11'; e.currentTarget.style.transform='translateY(-1px)' }}
              onMouseOut={e => { e.currentTarget.style.background='#2D5A1B'; e.currentTarget.style.transform='translateY(0)' }}>
              Create my {pt.name} — free
            </button>
            <div style={{ fontSize: 12, color: '#8a8a7a', textAlign: 'center' }}>No account needed · No watermarks · Always free</div>
          </div>
        </div>
      </section>

      {/* Articles preview */}
      <section style={{ padding: '56px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3B6D11', fontWeight: 500, marginBottom: 8 }}>Planner guides</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: '#1a1a14', margin: 0 }}>Tips & strategies for better planning</h2>
            </div>
            <button onClick={() => setPage('guides')} style={{ padding: '10px 20px', borderRadius: 20, border: '1px solid #D8D4C8', background: 'transparent', color: '#6B6B5E', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>View all guides →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {ARTICLES.slice(0,3).map(a => (
              <div key={a.id} onClick={() => setPage(a.id)}
                style={{ background: 'white', border: '1px solid #E8E4D8', borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor='#C0DD97'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor='#E8E4D8'; e.currentTarget.style.transform='translateY(0)' }}>
                <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#EAF3DE', color: '#2D5A1B', display: 'inline-block', marginBottom: 10, fontWeight: 500 }}>{a.tag}</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 500, color: '#1a1a14', marginBottom: 8, lineHeight: 1.4 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#8a8a7a', lineHeight: 1.6 }}>{a.excerpt}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── PLANNER FLOW ─────────────────────────────────────────────────────────────
function PlannerFlow({ initialType, setPage }) {
  const [plannerType, setPlannerType] = useState(initialType || 'weekly')
  const [stage, setStage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [generating, setGenerating] = useState(false)
  const [genStep, setGenStep] = useState(0)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [showPrint, setShowPrint] = useState(false)

  const pt = PLANNER_TYPES[plannerType]
  const currentStage = pt.stages[stage]
  const theme = THEMES[answers.theme || 'green']
  const totalStages = pt.stages.length

  const setAnswer = (id, value) => setAnswers(prev => ({ ...prev, [id]: value }))

  const toggleMulti = (id, option) => {
    const current = answers[id] || []
    if (current.includes(option)) setAnswer(id, current.filter(x => x !== option))
    else setAnswer(id, [...current, option])
  }

  const stageComplete = () => {
    const qs = currentStage.questions
    return qs.every(q => {
      if (q.required === false) return true
      if (q.type === 'text' && q.required !== false) return (answers[q.id] || '').trim().length > 0
      if (q.type === 'single') return !!answers[q.id]
      if (q.type === 'theme') return true
      if (q.type === 'multi') return true
      return true
    })
  }

  const genSteps = [
    'Analyzing your goals and preferences',
    'Building your personalized sections',
    'Structuring your layout and trackers',
    `Applying ${theme.name} theme`,
    'Finalizing your print-ready planner',
  ]

  const handleGenerate = async () => {
    setGenerating(true)
    setGenStep(0)
    const stepInterval = setInterval(() => {
      setGenStep(prev => {
        if (prev >= genSteps.length - 1) { clearInterval(stepInterval); return prev }
        return prev + 1
      })
    }, 900)

    try {
      const prompt = buildPrompt(plannerType, answers, pt)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      let parsed
      try { parsed = JSON.parse(clean) } catch { parsed = buildFallbackContent(plannerType, answers) }
      clearInterval(stepInterval)
      setGenStep(genSteps.length - 1)
      setTimeout(() => { setGeneratedContent(parsed); setGenerating(false) }, 600)
    } catch {
      clearInterval(stepInterval)
      setGeneratedContent(buildFallbackContent(plannerType, answers))
      setGenerating(false)
    }
  }

  const buildPrompt = (type, ans, pt) => {
    const answerSummary = Object.entries(ans).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join('\n')
    return `You are generating personalized content for a printable ${pt.name} for a user named ${ans.name || ans.names || 'the user'}.

User answers:
${answerSummary}

Generate personalized planner content in JSON format only — no markdown, no preamble, just valid JSON.

Return this exact structure:
{
  "title": "${pt.name} for ${ans.name || ans.names || 'You'}",
  "subtitle": "personalized subtitle line",
  "sections": [
    { "name": "section name", "type": "lines|grid|checklist|tracker|progress", "items": ["item1","item2"] }
  ],
  "habits": ["habit1","habit2","habit3","habit4","habit5"],
  "affirmation": "a short motivational line personalized to their goals",
  "tips": ["tip1","tip2","tip3"]
}

Make every section name, habit, and tip specifically relevant to this person's answers. For habits, use exactly what they selected or sensible defaults. Be personal, specific and encouraging.`
  }

  const buildFallbackContent = (type, ans) => ({
    title: `${PLANNER_TYPES[type].name} for ${ans.name || ans.names || 'You'}`,
    subtitle: `Personalized for your goals · ${new Date().toLocaleString('default',{month:'long',year:'numeric'})}`,
    sections: [
      { name: 'Top Priorities', type: 'lines', items: ['Priority 1','Priority 2','Priority 3'] },
      { name: 'Daily Schedule', type: 'lines', items: ['Morning','Afternoon','Evening'] },
      { name: 'Notes', type: 'lines', items: [] },
    ],
    habits: (ans.habits || ['Exercise','Water intake','Reading','Meditation','Journaling']).slice(0,5),
    affirmation: 'Every day is a new opportunity to move toward your goals.',
    tips: ['Start your day with your most important task','Review your planner each evening','Celebrate small wins along the way'],
  })

  if (showPrint && generatedContent) {
    return <PrintablePlanner content={generatedContent} answers={answers} plannerType={plannerType} theme={theme} onBack={() => setShowPrint(false)} />
  }

  if (generatedContent && !generating) {
    return <PlannerResult content={generatedContent} answers={answers} plannerType={plannerType} theme={theme} onPrint={() => setShowPrint(true)} onReset={() => { setAnswers({}); setStage(0); setGeneratedContent(null) }} setPage={setPage} />
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      {/* Type switcher (only on stage 0) */}
      {stage === 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8a7a', marginBottom: 12 }}>Planner type</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PLANNER_ORDER.map(id => (
              <button key={id} onClick={() => { setPlannerType(id); setAnswers({}); setStage(0) }}
                style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, border: `1px solid ${plannerType===id?'#639922':'#D8D4C8'}`, background: plannerType===id?'#EAF3DE':'white', color: plannerType===id?'#2D5A1B':'#6B6B5E', cursor: 'pointer', fontWeight: plannerType===id?500:400, fontFamily: "'DM Sans', sans-serif" }}>
                {PLANNER_TYPES[id].icon} {PLANNER_TYPES[id].name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          {pt.stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < totalStages - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: i < stage ? 'pointer' : 'default' }} onClick={() => { if (i < stage) setStage(i) }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${i < stage ? '#2D5A1B' : i === stage ? '#3B6D11' : '#D8D4C8'}`, background: i < stage ? '#2D5A1B' : i === stage ? '#EAF3DE' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: i < stage ? '#EAF3DE' : i === stage ? '#2D5A1B' : '#8a8a7a', flexShrink: 0, transition: 'all 0.25s' }}>
                  {i < stage ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 12, fontWeight: i === stage ? 500 : 400, color: i < stage ? '#3B6D11' : i === stage ? '#2D5A1B' : '#8a8a7a' }}>{s.name}</div>
              </div>
              {i < totalStages - 1 && <div style={{ flex: 1, height: 1, background: i < stage ? '#C0DD97' : '#E8E4D8', margin: '0 12px', transition: 'background 0.3s' }}/>}
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: '#E8E4D8', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#2D5A1B', borderRadius: 1, width: `${((stage) / totalStages) * 100 + 5}%`, transition: 'width 0.4s ease' }}/>
        </div>
      </div>

      {/* Stage content */}
      {!generating && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#639922', fontWeight: 500, marginBottom: 8 }}>Stage {stage + 1} of {totalStages}</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: '#1a1a14', marginBottom: 6 }}>{currentStage.name}</h2>
          <p style={{ fontSize: 14, color: '#6B6B5E', marginBottom: 32, lineHeight: 1.6 }}>{currentStage.sub}</p>

          {currentStage.questions.map(q => (
            <div key={q.id} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a14', marginBottom: 12 }}>{q.q}</div>

              {q.type === 'text' && (
                <input type="text" value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder} autoComplete="off"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid #D8D4C8', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: '#1a1a14', background: 'white', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor='#3B6D11'}
                  onBlur={e => e.target.style.borderColor='#D8D4C8'} />
              )}

              {q.type === 'single' && (
                <div style={{ display: 'grid', gridTemplateColumns: q.options.length <= 2 ? '1fr 1fr' : q.options.length === 5 ? 'repeat(3,1fr)' : 'repeat(3,1fr)', gap: 8 }}>
                  {q.options.map(opt => {
                    const label = opt.label || opt
                    const desc = opt.desc || ''
                    const sel = answers[q.id] === label
                    return (
                      <div key={label} onClick={() => setAnswer(q.id, label)}
                        style={{ padding: '12px 14px', border: `${sel?'1.5px':'1px'} solid ${sel?'#3B6D11':'#D8D4C8'}`, borderRadius: 10, cursor: 'pointer', background: sel?'#EAF3DE':'white', transition: 'all 0.18s' }}
                        onMouseOver={e => { if (!sel) { e.currentTarget.style.borderColor='#C0DD97'; e.currentTarget.style.transform='translateY(-1px)' } }}
                        onMouseOut={e => { if (!sel) { e.currentTarget.style.borderColor='#D8D4C8'; e.currentTarget.style.transform='translateY(0)' } }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a14' }}>{label}</div>
                        {desc && <div style={{ fontSize: 11, color: '#8a8a7a', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
                      </div>
                    )
                  })}
                </div>
              )}

              {q.type === 'multi' && (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {q.options.map(opt => {
                      const sel = (answers[q.id] || []).includes(opt)
                      return (
                        <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                          style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${sel?'#3B6D11':'#D8D4C8'}`, background: sel?'#EAF3DE':'white', color: sel?'#2D5A1B':'#6B6B5E', cursor: 'pointer', transition: 'all 0.16s', fontFamily: "'DM Sans', sans-serif" }}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {q.hint && <div style={{ fontSize: 11, color: '#8a8a7a', marginTop: 8 }}>{q.hint}</div>}
                </div>
              )}

              {q.type === 'theme' && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {Object.entries(THEMES).map(([key, th]) => {
                    const sel = (answers.theme || 'green') === key
                    return (
                      <div key={key} onClick={() => setAnswer('theme', key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: `${sel?'1.5px':'1px'} solid ${sel?th.mid:'#D8D4C8'}`, borderRadius: 10, cursor: 'pointer', background: sel?th.pale:'white', transition: 'all 0.18s' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: th.main, flexShrink: 0, border: sel?`2px solid ${th.mid}`:'none' }}/>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: th.main }}>{th.name}</div>
                          <div style={{ fontSize: 10, color: th.mid }}>{{green:'Classic & calm',coral:'Warm & grounded',violet:'Creative & bold',navy:'Sharp & focused'}[key]}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 24, borderTop: '1px solid #E8E4D8' }}>
            <button onClick={() => stage > 0 ? setStage(stage - 1) : setPage('home')}
              style={{ padding: '11px 20px', borderRadius: 8, border: '1px solid #D8D4C8', background: 'transparent', color: '#6B6B5E', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              ← {stage === 0 ? 'Back to home' : 'Back'}
            </button>
            <div style={{ fontSize: 12, color: '#8a8a7a' }}>Stage {stage + 1} of {totalStages}</div>
            <button
              onClick={() => {
                if (stage < totalStages - 1) setStage(stage + 1)
                else handleGenerate()
              }}
              disabled={!stageComplete()}
              style={{ padding: '11px 28px', borderRadius: 8, background: stageComplete() ? '#2D5A1B' : '#D8D4C8', color: stageComplete() ? '#EAF3DE' : '#8a8a7a', fontSize: 13, fontWeight: 500, border: 'none', cursor: stageComplete() ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s' }}>
              {stage < totalStages - 1 ? 'Continue →' : 'Generate my planner →'}
            </button>
          </div>
        </div>
      )}

      {/* Generating */}
      {generating && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #EAF3DE', borderTopColor: '#2D5A1B', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 500, color: '#1a1a14', marginBottom: 8 }}>Building your planner...</div>
          <div style={{ fontSize: 13, color: '#6B6B5E', marginBottom: 28 }}>AI is personalizing every section based on your answers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320, margin: '0 auto' }}>
            {genSteps.map((s, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, border: `1px solid ${i < genStep ? '#C0DD97' : i === genStep ? '#3B6D11' : '#E8E4D8'}`, background: i < genStep ? '#EAF3DE' : i === genStep ? 'white' : '#FAFAF8', color: i < genStep ? '#2D5A1B' : i === genStep ? '#1a1a14' : '#8a8a7a', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: i < genStep ? '#2D5A1B' : i === genStep ? '#639922' : '#D8D4C8', flexShrink: 0 }}/>
                {i === genStep ? <span style={{ animation: 'pulse 1s ease infinite' }}>{s}</span> : s}
              </div>
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}
    </div>
  )
}

// ─── PLANNER RESULT ───────────────────────────────────────────────────────────
function PlannerResult({ content, answers, plannerType, theme, onPrint, onReset, setPage }) {
  const pt = PLANNER_TYPES[plannerType]
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: theme.pale, border: `2px solid ${theme.border}`, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><polyline points="4,12 9,17 18,6" stroke={theme.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 500, color: '#1a1a14', marginBottom: 8 }}>{content.title}</h2>
        <p style={{ fontSize: 14, color: '#6B6B5E', marginBottom: 0 }}>{content.subtitle}</p>
      </div>

      {/* Summary card */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, background: theme.pale }}>
        {[
          ['Planner type', pt.name],
          ['Color theme', theme.name],
          ['Layout', `${answers.density || 'Balanced'} · ${answers.paper || 'Letter 8.5×11'}`],
          ['AI-personalized sections', content.sections?.map(s=>s.name).join(', ') || 'Custom sections'],
          ['Habit tracker', content.habits?.slice(0,4).join(', ') || 'Custom habits'],
        ].map(([k,v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ color: theme.mid }}>{k}</span>
            <span style={{ color: theme.main, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Affirmation */}
      {content.affirmation && (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, background: 'white' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.mid, marginBottom: 6 }}>Your planner affirmation</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontStyle: 'italic', color: theme.main, lineHeight: 1.6 }}>"{content.affirmation}"</div>
        </div>
      )}

      <button onClick={onPrint}
        style={{ width: '100%', padding: 14, borderRadius: 10, background: theme.main, color: '#EAF3DE', fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.18s' }}
        onMouseOver={e => { e.currentTarget.style.background=theme.mid; e.currentTarget.style.transform='translateY(-1px)' }}
        onMouseOut={e => { e.currentTarget.style.background=theme.main; e.currentTarget.style.transform='translateY(0)' }}>
        View & Print my Planner
      </button>
      <button onClick={onReset}
        style={{ width: '100%', padding: 12, borderRadius: 10, background: 'transparent', color: theme.main, border: `1.5px solid ${theme.mid}`, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
        Generate a different planner
      </button>
      <div style={{ textAlign: 'center', fontSize: 12, color: '#8a8a7a', cursor: 'pointer' }} onClick={() => setPage('home')}>← Back to home</div>
    </div>
  )
}

// ─── PRINTABLE PLANNER ────────────────────────────────────────────────────────
function PrintablePlanner({ content, answers, plannerType, theme, onBack }) {
  const printRef = useRef()
  const pt = PLANNER_TYPES[plannerType]
  const days = answers.weekstart === 'Sunday'
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML
    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html><html><head>
      <title>${content.title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
      <style>
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:white;color:#1a1a14;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        @media print{body{margin:0;}@page{margin:15mm;size:${answers.paper==='A4'?'A4':'letter'};}}
      </style>
    </head><body>${printContent}</body></html>`)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 500)
  }

  const habits = content.habits || ['Exercise','Water intake','Reading','Meditation','Journaling']

  return (
    <div style={{ background: '#F5F5F0', minHeight: '100vh' }}>
      {/* Print toolbar */}
      <div style={{ background: '#1a1a14', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #3a3a30', background: 'transparent', color: '#c0c0a0', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#EAF3DE' }}>{content.title}</div>
        <button onClick={handlePrint}
          style={{ padding: '10px 24px', borderRadius: 8, background: theme.main, color: '#EAF3DE', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Print / Save PDF
        </button>
      </div>

      {/* Planner pages */}
      <div style={{ maxWidth: 860, margin: '32px auto', padding: '0 24px 80px' }}>
        <div ref={printRef}>

          {/* Page 1 — Main planner page */}
          <div style={{ background: 'white', borderRadius: 4, marginBottom: 24, padding: '32px 36px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', pageBreakAfter: 'always' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2.5px solid ${theme.main}`, paddingBottom: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 500, color: theme.main }}>{content.title}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.mid, marginTop: 4 }}>{content.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#8a8a7a' }}>{dateStr}</div>
                <div style={{ fontSize: 10, color: theme.mid, marginTop: 2 }}>PrintMyPlanner.com</div>
              </div>
            </div>

            {/* Week grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 24 }}>
              {days.map((d, i) => (
                <div key={d} style={{ border: `1px solid ${i===0?theme.mid:theme.border}`, borderRadius: 6, padding: '8px 4px', textAlign: 'center', background: i===0?theme.pale:'white' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: theme.mid, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{d}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: theme.main }}></div>
                  <div style={{ height: 40 }}></div>
                </div>
              ))}
            </div>

            {/* Two column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.mid, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 10 }}>Top priorities this week</div>
                {[1,2,3].map(n => (
                  <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: theme.mid, flexShrink: 0 }}>{n}</div>
                    <div style={{ flex: 1, borderBottom: `1px solid ${theme.border}`, height: 20 }}/>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.mid, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 10 }}>Weekly intention</div>
                {[1,2,3].map(n => <div key={n} style={{ borderBottom: `1px solid ${theme.border}`, height: 20, marginBottom: 10 }}/>)}
              </div>
            </div>

            {/* Habit tracker */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.mid, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 12 }}>Habit tracker</div>
              {habits.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#3a3a30', width: 120, flexShrink: 0 }}>{h}</div>
                  <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                    {days.map(d => (
                      <div key={d} style={{ flex: 1, height: 22, border: `1px solid ${theme.border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 8, color: theme.border }}>{d[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.mid, borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 10 }}>Notes & reflections</div>
              {[1,2,3,4,5].map(n => <div key={n} style={{ borderBottom: `1px solid #F0EDE0`, height: 22, marginBottom: 2 }}/>)}
            </div>
          </div>

          {/* Page 2 — Daily schedule pages */}
          <div style={{ background: 'white', borderRadius: 4, marginBottom: 24, padding: '28px 36px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)', pageBreakAfter: 'always' }}>
            <div style={{ borderBottom: `2px solid ${theme.main}`, paddingBottom: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: theme.main }}>Daily Schedule</div>
              <div style={{ fontSize: 10, color: '#8a8a7a' }}>{content.title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {days.slice(0,6).map(d => (
                <div key={d} style={{ border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: theme.pale, padding: '8px 12px', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: theme.main }}>{d}</div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    {['Morning','Afternoon','Evening'].map(t => (
                      <div key={t} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 8, textTransform: 'uppercase', color: theme.mid, letterSpacing: '0.08em', marginBottom: 3 }}>{t}</div>
                        <div style={{ borderBottom: `1px solid #F0EDE0`, height: 16, marginBottom: 2 }}/>
                        <div style={{ borderBottom: `1px solid #F0EDE0`, height: 16 }}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page 3 — Goals & Sections */}
          <div style={{ background: 'white', borderRadius: 4, padding: '28px 36px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ borderBottom: `2px solid ${theme.main}`, paddingBottom: 10, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: theme.main }}>Goals & Notes</div>
              <div style={{ fontSize: 10, color: '#8a8a7a' }}>{content.title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', color: theme.mid, letterSpacing: '0.12em', borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 14 }}>This week's goals</div>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 14, height: 14, border: `1px solid ${theme.border}`, borderRadius: 3, flexShrink: 0, marginTop: 2 }}/>
                    <div style={{ flex: 1, borderBottom: `1px solid #F0EDE0`, height: 18 }}/>
                  </div>
                ))}
                {content.affirmation && (
                  <div style={{ marginTop: 24, padding: '14px', background: theme.pale, borderRadius: 8, border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', color: theme.mid, letterSpacing: '0.1em', marginBottom: 6 }}>Weekly affirmation</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontStyle: 'italic', color: theme.main, lineHeight: 1.6 }}>"{content.affirmation}"</div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 9, textTransform: 'uppercase', color: theme.mid, letterSpacing: '0.12em', borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 14 }}>Planning tips</div>
                {(content.tips || []).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: theme.pale, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: theme.mid, flexShrink: 0 }}>{i+1}</div>
                    <div style={{ fontSize: 11, color: '#3a3a30', lineHeight: 1.5 }}>{tip}</div>
                  </div>
                ))}
                <div style={{ fontSize: 9, textTransform: 'uppercase', color: theme.mid, letterSpacing: '0.12em', borderBottom: `1px solid ${theme.border}`, paddingBottom: 4, marginBottom: 10, marginTop: 20 }}>Free notes</div>
                {[1,2,3,4,5,6].map(n => <div key={n} style={{ borderBottom: `1px solid #F0EDE0`, height: 22, marginBottom: 2 }}/>)}
              </div>
            </div>
            <div style={{ marginTop: 32, textAlign: 'center', fontSize: 10, color: '#C0BDB0' }}>Generated by PrintMyPlanner.com · Free custom planners for everyone</div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── GUIDES PAGE ──────────────────────────────────────────────────────────────
function GuidesPage({ setPage }) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 40px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3B6D11', fontWeight: 500, marginBottom: 12 }}>Planning guides</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 500, color: '#1a1a14', margin: '0 0 12px' }}>Tips & strategies for better planning</h1>
        <p style={{ fontSize: 16, color: '#6B6B5E', maxWidth: 560 }}>Practical guides to help you get more from your planner — from habit building to budgeting, meal prep to wedding planning.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {ARTICLES.map(a => (
          <div key={a.id} onClick={() => setPage(a.id)}
            style={{ background: 'white', border: '1px solid #E8E4D8', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='#C0DD97'; e.currentTarget.style.transform='translateY(-2px)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor='#E8E4D8'; e.currentTarget.style.transform='translateY(0)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: '#EAF3DE', color: '#2D5A1B', fontWeight: 500 }}>{a.tag}</div>
              <div style={{ fontSize: 11, color: '#8a8a7a' }}>{a.category}</div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500, color: '#1a1a14', marginBottom: 10, lineHeight: 1.4 }}>{a.title}</div>
            <div style={{ fontSize: 13, color: '#6B6B5E', lineHeight: 1.65 }}>{a.excerpt}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>Read guide →</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ARTICLE PAGE ─────────────────────────────────────────────────────────────
function ArticlePage({ articleId, setPage }) {
  const article = ARTICLES.find(a => a.id === articleId)
  if (!article) return null

  const articleContent = {
    'why-printable-planners': `There's a growing body of research suggesting that writing by hand engages the brain differently than typing. The act of physically forming letters activates areas of the brain linked to memory consolidation and focused attention. In practical terms: when you write something in your planner, you're more likely to remember it and act on it than when you type it into an app.

But beyond neuroscience, there's something simpler at play. A printed planner is always visible. It sits on your desk, catches your eye when you walk past, and serves as a constant low-key reminder of your commitments. Your phone's planning app? Buried behind notifications, social media, and whatever else is competing for your attention.

**The distraction factor**

Digital planners live on devices that are, by design, engineered to distract you. Every time you open your planning app, you're one swipe away from Instagram, email, or a news headline. Paper has none of that.

**Customization that actually fits your life**

Generic planner templates — whether digital or print — rarely fit anyone's actual life perfectly. You end up with sections you never use and missing space for things you actually need. AI-generated planners solve this by building each page around your specific answers: your habits, your schedule structure, your goals.

**When digital planners do win**

To be fair: if your work is entirely digital, you travel constantly, or you need to share your schedule with others, a digital calendar probably has an edge. The goal isn't to be dogmatic about paper — it's to use the right tool for the right context.

For long-term goal tracking, weekly planning, and habit building? Print almost always wins.`,

    'best-printable-weekly-planner': `The best weekly planner isn't the prettiest one — it's the one that matches how you actually think and work. That sounds obvious, but most printable planners on Etsy or Pinterest are designed to look good in a flat lay photo, not to survive a real Tuesday morning.

**What a good weekly planner layout must include**

A solid weekly planner needs at least four things: a week-at-a-glance view, a way to capture daily priorities, a habit tracker (even a simple one), and space for notes or overflow tasks. Anything else is optional.

The week-at-a-glance is non-negotiable. Being able to see the shape of your entire week in one view — meetings, deadlines, commitments — prevents the tunnel vision of only thinking about today.

**Time-blocking vs. task lists: which works better?**

Research leans toward time-blocking for people with busy or fragmented schedules. Assigning tasks to specific time slots eliminates the cognitive overhead of constantly deciding what to do next. But for people with flexible, creative, or unpredictable days, an open task list works better — you don't want to be fighting your planner.

**The habit tracker question**

A weekly planner without a habit tracker is leaving a lot of value on the table. Even three or four simple habits tracked across a week — water intake, exercise, reading — creates a visual accountability loop that's surprisingly effective.

**Personalization is the differentiator**

The best planner you can use is one built around your specific life: your wake-up time, your task volume, your particular habits, your week structure. That's exactly what AI-generated planners enable.`,
  }

  const body = articleContent[article.id] || `This article covers ${article.title.toLowerCase()}. The full content explores practical strategies, evidence-based approaches, and actionable advice for getting the most out of your ${article.category.toLowerCase()} practice.\n\n${article.excerpt}\n\nPersonalized planning is one of the most powerful tools available for achieving your goals — and a custom printable planner is the simplest way to put that principle into action.`

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 40px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: '#EAF3DE', color: '#2D5A1B', fontWeight: 500 }}>{article.tag}</div>
          <div style={{ fontSize: 12, color: '#8a8a7a' }}>{article.category}</div>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 500, color: '#1a1a14', lineHeight: 1.2, margin: '0 0 16px' }}>{article.title}</h1>
        <p style={{ fontSize: 16, color: '#6B6B5E', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>{article.excerpt}</p>
      </div>

      <div style={{ borderTop: '2px solid #2D5A1B', paddingTop: 28, marginBottom: 28 }}>
        {body.split('\n\n').map((para, i) => (
          para.startsWith('**') ? (
            <h3 key={i} style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#1a1a14', margin: '24px 0 12px' }}>{para.replace(/\*\*/g,'')}</h3>
          ) : (
            <p key={i} style={{ fontSize: 16, color: '#3a3a30', lineHeight: 1.8, marginBottom: 18 }}>{para}</p>
          )
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: 12, padding: '24px', marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 500, color: '#2D5A1B', marginBottom: 8 }}>Ready to try a personalized planner?</div>
        <div style={{ fontSize: 14, color: '#3B6D11', marginBottom: 16 }}>Answer a few questions and get your custom printable planner in 60 seconds — free.</div>
        <button onClick={() => setPage('create')}
          style={{ padding: '12px 28px', borderRadius: 24, background: '#2D5A1B', color: '#EAF3DE', fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Create my free planner →
        </button>
      </div>

      {/* Related articles */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a8a7a', marginBottom: 16, fontWeight: 500 }}>More guides</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {ARTICLES.filter(a => a.id !== articleId).slice(0,4).map(a => (
            <div key={a.id} onClick={() => setPage(a.id)}
              style={{ background: 'white', border: '1px solid #E8E4D8', borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'all 0.18s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor='#C0DD97' }}
              onMouseOut={e => { e.currentTarget.style.borderColor='#E8E4D8' }}>
              <div style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: '#EAF3DE', color: '#2D5A1B', display: 'inline-block', marginBottom: 8, fontWeight: 500 }}>{a.tag}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 500, color: '#1a1a14', lineHeight: 1.4 }}>{a.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: '#6B6B5E', cursor: 'pointer' }} onClick={() => setPage('guides')}>← All guides</span>
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(() => urlToPage(window.location.pathname))
  const [selectedType, setSelectedType] = useState('weekly')

  useEffect(() => {
    const handlePop = () => setPage(urlToPage(window.location.pathname))
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const navigate = (newPage) => {
    window.history.pushState({}, '', pageToUrl(newPage))
    setPage(newPage)
    window.scrollTo(0, 0)
  }

  const articleIds = ARTICLES.map(a => a.id)
  const isArticle = articleIds.includes(page)
  const showNav = page !== 'print'

  return (
    <div style={S.page}>
      {showNav && <Nav page={page} setPage={navigate} />}

      {page === 'home' && <HomePage setPage={navigate} selectedType={selectedType} setSelectedType={setSelectedType} />}
      {page === 'create' && <PlannerFlow initialType={selectedType} setPage={navigate} />}
      {page === 'guides' && <GuidesPage setPage={navigate} />}
      {isArticle && <ArticlePage articleId={page} setPage={navigate} />}

      {showNav && <Footer setPage={navigate} />}
    </div>
  )
}
