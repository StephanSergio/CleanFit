export interface ProgramExercise {
  name: string
  sets: number
  reps: string
  superset?: boolean
  homeAlt?: string
  note?: string
  type?: 'compound' | 'isolation'
  primaryMuscles?: string[]
  secondaryMuscles?: string[]
}

export interface ProgramDay {
  day: number
  focus: string
  type?: 'power' | 'hypertrophy'
  note?: string
  exercises: ProgramExercise[]
}

export interface ProgramPhase {
  id: string
  name: string
  weeks: number[] | null   // null = ongoing weekly cycle (no fixed number of weeks)
  note: string
  days: ProgramDay[]
}

export interface Program {
  id: string
  name: string
  edition?: string
  fullName?: string
  author?: string
  daysPerWeek?: number
  schedule?: Record<string, string>
  phases: ProgramPhase[]
}

export const BUFF_DUDES: Program = {
  id: "buff_dudes",
  name: "Buff Dudes Program",
  edition: "3rd Edition",
  daysPerWeek: 4,
  schedule: {
    monday: "day_1",
    tuesday: "rest",
    wednesday: "day_2",
    thursday: "rest",
    friday: "rest",
    saturday: "day_3",
    sunday: "day_4",
  },
  phases: [
    {
      id: "phase_1",
      name: "Pairing Phase I",
      weeks: [1, 2, 3],
      note: "Pairs primary and secondary muscle groups. Target smaller muscles through isolation after hitting major groups with compound movements.",
      days: [
        {
          day: 1,
          focus: "Back & Rear Deltoids",
          exercises: [
            { name: "Deadlift", sets: 4, reps: "10, 8, 6, 4" },
            { name: "Pull-Ups", sets: 4, reps: "10" },
            { name: "Single Arm Dumbbell Row", sets: 4, reps: "10" },
            { name: "T-Bar Row", sets: 4, reps: "10" },
            { name: "Barbell Face Pulls", sets: 4, reps: "12" },
            { name: "Bent Over Lateral Raises", sets: 3, reps: "15" },
          ],
        },
        {
          day: 2,
          focus: "Chest & Anterior/Lateral Deltoids",
          exercises: [
            { name: "Incline Dumbbell Press", sets: 4, reps: "12, 10, 8, 8" },
            { name: "Barbell Flat Press", sets: 4, reps: "10, 8, 8, 6" },
            { name: "Landmine Press", sets: 4, reps: "10" },
            { name: "Dumbbell Flys", sets: 3, reps: "15" },
            { name: "Dumbbell Upright Rows", sets: 4, reps: "10" },
            { name: "Alternating Dumbbell Front Raises", sets: 3, reps: "12" },
            { name: "Lateral Raises", sets: 3, reps: "12" },
          ],
        },
        {
          day: 3,
          focus: "Legs & Calves",
          exercises: [
            { name: "Squats", sets: 4, reps: "12, 10, 8, 6" },
            { name: "Walking Lunges", sets: 3, reps: "10 each way" },
            { name: "Romanian Deadlift", sets: 4, reps: "12" },
            { name: "Glute Bridges", sets: 3, reps: "10" },
            { name: "Kettle Bell Swings", sets: 3, reps: "12" },
            { name: "Seated Calf Raise", sets: 5, reps: "10" },
          ],
        },
        {
          day: 4,
          focus: "Arms & Trapezius",
          exercises: [
            { name: "Close Grip Press", sets: 4, reps: "10" },
            { name: "Skull Crushers", sets: 3, reps: "12" },
            { name: "Kick Backs", sets: 3, reps: "12" },
            { name: "Underhand Pull Down", sets: 4, reps: "10" },
            { name: "Barbell Curls", sets: 3, reps: "12" },
            { name: "Alternating Hammer Curls", sets: 3, reps: "10" },
            { name: "Barbell Shrug", sets: 5, reps: "10" },
          ],
        },
      ],
    },
    {
      id: "phase_2",
      name: "Pairing Phase II",
      weeks: [4, 5, 6],
      note: "Lower body trained twice per week. Continue activating primary muscles via heavy compound movements first, followed by isolation exercises.",
      days: [
        {
          day: 1,
          focus: "Legs & Calves",
          exercises: [
            { name: "Squats", sets: 5, reps: "12, 10, 8, 6, 4" },
            { name: "Step-Ups", sets: 4, reps: "10 each leg" },
            { name: "Trap Bar Deadlifts", sets: 4, reps: "10", homeAlt: "DB Farmer Squats" },
            { name: "Lateral Box Squats", sets: 3, reps: "10" },
            { name: "Romanian Deadlift", sets: 3, reps: "10" },
            { name: "Seated Calf Raises", sets: 4, reps: "12" },
          ],
        },
        {
          day: 2,
          focus: "Back, Trapezius & Biceps",
          exercises: [
            { name: "Deadlift", sets: 4, reps: "10, 8, 6, 4" },
            { name: "Bent Over Row", sets: 4, reps: "8" },
            { name: "V-Grip Pull Ups", sets: 4, reps: "8" },
            { name: "Dumbbell Pull-Overs", sets: 3, reps: "12" },
            { name: "Dumbbell Shrugs", sets: 4, reps: "12" },
            { name: "Drag Curls", sets: 3, reps: "12" },
            { name: "Incline Bench DB Curls", sets: 3, reps: "12" },
          ],
        },
        {
          day: 3,
          focus: "Chest & Triceps",
          exercises: [
            { name: "Dumbbell Press", sets: 4, reps: "12, 10, 8, 8" },
            { name: "Incline Barbell Press", sets: 4, reps: "10" },
            { name: "Single Arm DB Press", sets: 3, reps: "10 each arm" },
            { name: "Incline DB Fly", sets: 3, reps: "12" },
            { name: "Single Arm DB French Press", sets: 3, reps: "12 each arm" },
            { name: "Cross Bench Dips", sets: 3, reps: "10" },
          ],
        },
        {
          day: 4,
          focus: "Deltoids & Forearms",
          exercises: [
            { name: "Overhead Press", sets: 4, reps: "12, 10, 8, 6" },
            { name: "Single Arm KB Press", sets: 3, reps: "10" },
            { name: "Reverse Upright Row", sets: 4, reps: "12" },
            { name: "Lateral Raise", sets: 4, reps: "12" },
            { name: "Reverse Curl", sets: 3, reps: "12" },
            { name: "Finger Curl", sets: 3, reps: "12" },
          ],
        },
        {
          day: 5,
          focus: "Legs & Calves",
          exercises: [
            { name: "Front Squats", sets: 4, reps: "12, 10, 8, 6" },
            { name: "Glute Bridges", sets: 4, reps: "12" },
            { name: "Split Squats", sets: 4, reps: "8 each leg" },
            { name: "Single Leg Romanian Deadlift", sets: 4, reps: "12" },
            { name: "Standing Calf Raise", sets: 4, reps: "12" },
          ],
        },
      ],
    },
    {
      id: "phase_3",
      name: "Isolation Phase",
      weeks: [7, 8, 9],
      note: "Each major muscle group gets its own day for further isolation, growth, and detail. Supersets introduced.",
      days: [
        {
          day: 1,
          focus: "Back & Trapezius",
          exercises: [
            { name: "Pull-Ups", sets: 4, reps: "15" },
            { name: "T-Bar Row", sets: 4, reps: "10, 8, 8, 6" },
            { name: "Pendlay Row / Dumbbell Pull-Over", sets: 4, reps: "10", superset: true },
            { name: "Rack Pull / Barbell Shrugs", sets: 4, reps: "8", superset: true },
            { name: "Single Arm Dumbbell Row", sets: 3, reps: "10" },
            { name: "Single Arm Dumbbell Shrug", sets: 3, reps: "12" },
          ],
        },
        {
          day: 2,
          focus: "Chest",
          exercises: [
            { name: "Barbell Press", sets: 5, reps: "12, 10, 8, 6, 4" },
            { name: "Incline Dumbbell Press (close)", sets: 4, reps: "10" },
            { name: "(Weighted) Chest Dips", sets: 4, reps: "8" },
            { name: "Cable Cross Over / Landmine Press", sets: 3, reps: "12", superset: true, homeAlt: "Diamond Push Ups for Cable Cross Over" },
            { name: "Dumbbell Flys", sets: 3, reps: "12" },
          ],
        },
        {
          day: 3,
          focus: "Legs & Calves",
          exercises: [
            { name: "Box Squats", sets: 4, reps: "10, 8, 6, 4" },
            { name: "Walking Lunges", sets: 4, reps: "10 reps (20 total)" },
            { name: "Romanian Deadlift", sets: 4, reps: "10, 8, 8, 6" },
            { name: "Barbell Hack Squats", sets: 4, reps: "8" },
            { name: "Machine Hamstring Curls", sets: 3, reps: "10", homeAlt: "Manual Hamstring Curls" },
            { name: "Seated Calf Raise", sets: 5, reps: "12" },
          ],
        },
        {
          day: 4,
          focus: "Deltoids",
          exercises: [
            { name: "Seated Barbell Press", sets: 4, reps: "10, 10, 8, 6" },
            { name: "Dumbbell Upright Row / Barbell Reverse Upright Row", sets: 4, reps: "10", superset: true },
            { name: "Around The Worlds", sets: 4, reps: "10 each way" },
            { name: "Lateral Raise", sets: 3, reps: "10" },
            { name: "Cable Reverse Fly", sets: 3, reps: "12", homeAlt: "Bent Over DB Reverse Fly" },
          ],
        },
        {
          day: 5,
          focus: "Arms (Triceps, Biceps, Forearms)",
          exercises: [
            { name: "Skull Crushers / Close Grip Press", sets: 4, reps: "10", superset: true },
            { name: "(Weighted) Cross Bench Dips", sets: 4, reps: "12" },
            { name: "Cable Rope Extensions", sets: 3, reps: "12", homeAlt: "DB Bilateral Kick Backs" },
            { name: "Seated Dumbbell Curl / Underhand Pull Downs", sets: 4, reps: "10", superset: true },
            { name: "Reverse Curl", sets: 3, reps: "12" },
            { name: "Behind the Back Barbell Finger Curl", sets: 3, reps: "12" },
          ],
        },
      ],
    },
    {
      id: "phase_4",
      name: "High Intensity Phase",
      weeks: [10, 11, 12],
      note: "6 workout days. Focus on supersets using the flushing method — drawing blood into muscle groups to increase calorie burn and total stress on the body.",
      days: [
        {
          day: 1,
          focus: "Back & Chest",
          exercises: [
            { name: "Straight Arm Pull Down / Pull Ups", sets: 4, reps: "12", superset: true, homeAlt: "Medicine Ball Slams for Straight Arm Pull Down", note: "Last set: finish with negative reps to failure" },
            { name: "Incline Dumbbell Fly / Incline Barbell Press", sets: 4, reps: "10", superset: true },
            { name: "Bent Over Dumbbell Row / Flat Bench Dumbbell Press", sets: 4, reps: "10", superset: true },
            { name: "Dumbbell Pull-Over / Dips (Weighted)", sets: 4, reps: "10", superset: true },
          ],
        },
        {
          day: 2,
          focus: "Legs",
          exercises: [
            { name: "Squats", sets: 5, reps: "20, 12, 10, 8, 4" },
            { name: "Romanian Dead Lifts / Single Leg Hip Lifts", sets: 4, reps: "10", superset: true },
            { name: "Walking Lunges", sets: 4, reps: "10 each way" },
            { name: "Leg Extensions / Leg Curls", sets: 4, reps: "12", superset: true, homeAlt: "Sissy Squats / Manual Hamstring Curl" },
            { name: "Standing Calf Raises", sets: 5, reps: "10", note: "After 10 full reps, continue with partial reps to failure" },
          ],
        },
        {
          day: 3,
          focus: "Shoulders & Trapezius",
          exercises: [
            { name: "Lateral Raise / Arnold Press", sets: 4, reps: "10", superset: true },
            { name: "Cable Face Pull / Bent Over Lateral Raise", sets: 4, reps: "10", superset: true, homeAlt: "Barbell Face Pull" },
            { name: "Upright Row", sets: 4, reps: "10" },
            { name: "Seated Dumbbell Shrugs", sets: 4, reps: "10" },
            { name: "Standing Behind the Back Barbell Shrugs", sets: 4, reps: "10" },
          ],
        },
        {
          day: 4,
          focus: "Triceps & Biceps",
          exercises: [
            { name: "Barbell Close Grip Press / Bench Dips", sets: 4, reps: "10", superset: true },
            { name: "Seated Underhand Cable Row / Lying Cable Curl", sets: 4, reps: "10", superset: true, homeAlt: "Underhand Barbell Row / Barbell Curl" },
            { name: "Pronated Triceps Extension / Supinated Triceps Extension", sets: 3, reps: "10", superset: true, homeAlt: "Supinated Grip Skull Crushers / Pronated Grip Skull Crushers" },
            { name: "Concentration Curls", sets: 3, reps: "12" },
          ],
        },
        {
          day: 5,
          focus: "Legs",
          exercises: [
            { name: "Front Squat / Jumping Split Squats", sets: 4, reps: "10 each leg", superset: true },
            { name: "Manual Hamstring Curls / KB Swings", sets: 4, reps: "10", superset: true },
            { name: "Standing Leg Curls", sets: 3, reps: "20", homeAlt: "Single Leg RDL with DB or KB" },
            { name: "Single Seated Calf Raise", sets: 3, reps: "20" },
            { name: "Standing Calf Raise", sets: 3, reps: "10" },
          ],
        },
        {
          day: 6,
          focus: "Chest & Back",
          exercises: [
            { name: "Bent Over Row / Flat Barbell Press", sets: 4, reps: "12, 10, 8, 8", superset: true },
            { name: "Underhand Pull Downs / Incline Barbell Press", sets: 4, reps: "12, 10, 8, 8", superset: true, homeAlt: "Chin Ups" },
            { name: "Seated Cable Row / Alt. Cable Fly", sets: 4, reps: "10", superset: true, homeAlt: "T Bar Row / Alternating DB Fly" },
            { name: "Back Extensions / Underhand Dumbbell Fly", sets: 3, reps: "12", superset: true },
          ],
        },
      ],
    },
  ],
}