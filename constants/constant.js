export const ONBOARD_PAGES = [1, 2, 3, 4, 5, 6];

export const JOB_APPLICATION_STATUS = Object.freeze({
  APPLIED: "Applied",
  VIEWED: "Viewed",
  SHORTLISTED: "Shortlisted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
});

export const JOB_INVITATION_STATUS = Object.freeze({
  SENT: "sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
});

export const filterOptions = {
  Nearby: [
    { label: "Within 1 km", value: "1" },
    { label: "Within 5 km", value: "5" },
    { label: "Within 10 km", value: "10" },
    { label: "Within 25 km", value: "25" },
  ],

  Availability: [
    // { label: "Today", value: "today" },
    // { label: "Tomorrow", value: "tomorrow" },
    // { label: "This Week", value: "week" },
    { value: "same_day", label: "Same Day" },
    { value: "next_day", label: "Next Day" },
    { value: "within-1-weeks", label: "within 1 weeks" },
    { value: "within-2-weeks", label: "within 2 weeks" },
    { value: "This_month", label: "This Month" },
  ],

  Shift: [
    {
      value: "full_day",
      label: "Full Day (8:00 AM - 5:00 PM)",
    },
    {
      value: "half_day_morning",
      label: "Half Day - Morning (8:00 AM - 12:00 PM)",
    },
    {
      value: "half_day_afternoon",
      label: "Half Day - Afternoon (1:00 PM - 5:00 PM)",
    },
    {
      value: "night_shift",
      label: "Night Shift (10:00 PM - 6:00 AM)",
    },
    {
      value: "flexible",
      label: "Flexible Hours",
    },
  ],

  Salary: [
    { label: "Below ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "Above ₹2000", value: "2000+" },
  ],

  Date: [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
  ],
};

export const APPLIED_JOB_STATUS = Object.freeze({
  APPLIED: "Applied",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
});

export const savedSortingOptions = [
  { value: "newest", label: "Newest Saved" },
  { value: "oldest", label: "Oldest Saved" },
  { value: "high-to-low", label: "High to low salary" },
  { value: "low-to-high", label: "Low to high salary" },
];

export const appliedSortingOptions = [
  { value: "newest", label: "Newest Applied" },
  { value: "oldest", label: "Oldest Applied" },
];

export const ALLOWED_ROLES = Object.freeze({
  // ["admin", "employer", "worker"];
  ADMIN: "admin",
  EMPLOYER: "employer",
  WORKER: "worker",
});

export const SALARY_CREDIT_TYPES = Object.freeze({
  HOURLY: "Hourly",
  DAILY: "Daily",
});

export const SHIFT_TYPE = Object.freeze({
  FULL_DAY: "full_day",
  HALF_DAY_MORNING: "half_day_morning",
  HALF_DAY_AFTERNOON: "half_day_afternoon",
  NIGHT_SHIFT: "night_shift",
  FLEXIBLE: "flexible",
});

// Array of values, for Mongoose and Zod
export const SHIFT_TYPE_VALUES = Object.freeze(Object.values(SHIFT_TYPE));

// Display text, keyed by value
export const SHIFT_TYPE_LABELS = Object.freeze({
  [SHIFT_TYPE.FULL_DAY]: "Full Day (8:00 AM - 5:00 PM)",
  [SHIFT_TYPE.HALF_DAY_MORNING]: "Half Day - Morning (8:00 AM - 12:00 PM)",
  [SHIFT_TYPE.HALF_DAY_AFTERNOON]: "Half Day - Afternoon (1:00 PM - 5:00 PM)",
  [SHIFT_TYPE.NIGHT_SHIFT]: "Night Shift (10:00 PM - 6:00 AM)",
  [SHIFT_TYPE.FLEXIBLE]: "Flexible Hours",
});

// Options for <select> dropdowns
export const SHIFT_TYPE_OPTIONS = Object.freeze(
  SHIFT_TYPE_VALUES.map((value) => ({
    value,
    label: SHIFT_TYPE_LABELS[value],
  })),
);

export const JOINING_TYPES = Object.freeze({
  SAME_DAY: "Same Day",
  NEXT_DAY: "Next Day",
  WITHIN_ONE_WEEK: "within 1 weeks",
  WITHIN_TWO_WEEK: "within 2 weeks",
});

export const GENDER_TYPES = Object.freeze({
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  ANY_GENDER: "Any Gender",
});

export const EXPERIENCE_LEVELS = Object.freeze({
  BEGINNER: "Beginner",
  BASIC: "Basic",
  GOOD: "Good",
  EXPERIENCED: "Experienced",
});

export const JOB_SKILLS = {
  Construction: [
    "Masonry",
    "Bricklaying",
    "Concrete Work",
    "Steel Fixing",
    "Scaffolding",
    "Tile Laying",
    "Roofing",
    "Shuttering",
    "Plastering",
    "Foundation Work",
    "Road Construction",
    "Drain Construction",
    "Demolition",
    "Excavation",
    "Site Cleaning",
  ],

  Carpentry: [
    "Furniture Making",
    "Cabinet Making",
    "Wood Cutting",
    "Door Installation",
    "Window Installation",
    "False Ceiling",
    "Wood Polishing",
    "Wood Repair",
    "Plywood Work",
    "Modular Kitchen Installation",
  ],

  Plumbing: [
    "Pipe Installation",
    "Leak Repair",
    "Bathroom Fitting",
    "Kitchen Plumbing",
    "Drainage",
    "Water Tank Installation",
    "Motor Pump Installation",
    "PVC Pipe Work",
    "CPVC Pipe Work",
    "Sewer Line Repair",
  ],

  Electrical: [
    "House Wiring",
    "Industrial Wiring",
    "Cable Installation",
    "Electrical Maintenance",
    "Switch Board Installation",
    "Light Installation",
    "Fan Installation",
    "Generator Maintenance",
    "Inverter Installation",
    "Solar Panel Installation",
    "Electrical Fault Finding",
  ],

  Painting: [
    "Wall Painting",
    "Interior Painting",
    "Exterior Painting",
    "Spray Painting",
    "Texture Painting",
    "Waterproof Coating",
    "Wood Painting",
    "Metal Painting",
    "Putty Work",
    "Primer Application",
  ],

  Welding: [
    "Arc Welding",
    "MIG Welding",
    "TIG Welding",
    "Gas Welding",
    "Steel Fabrication",
    "Metal Cutting",
    "Grinding",
    "Pipe Welding",
    "Structural Welding",
  ],

  Fabrication: [
    "Steel Fabrication",
    "Gate Fabrication",
    "Window Fabrication",
    "Sheet Metal Work",
    "Stainless Steel Work",
    "Aluminium Fabrication",
  ],

  Gardening: [
    "Lawn Maintenance",
    "Tree Trimming",
    "Planting",
    "Weeding",
    "Watering Plants",
    "Landscaping",
    "Garden Cleaning",
    "Hedge Cutting",
  ],

  Cleaning: [
    "House Cleaning",
    "Office Cleaning",
    "Deep Cleaning",
    "Floor Cleaning",
    "Bathroom Cleaning",
    "Kitchen Cleaning",
    "Window Cleaning",
    "Post Construction Cleaning",
    "Waste Disposal",
  ],

  Housekeeping: [
    "Room Cleaning",
    "Laundry",
    "Bed Making",
    "Dusting",
    "Vacuum Cleaning",
    "Sanitization",
  ],

  Agriculture: [
    "Planting",
    "Harvesting",
    "Irrigation",
    "Pesticide Spraying",
    "Weeding",
    "Crop Maintenance",
    "Farm Equipment Operation",
    "Livestock Care",
  ],

  Driving: [
    "Car Driving",
    "Taxi Driving",
    "Truck Driving",
    "Mini Truck Driving",
    "Delivery Driving",
    "Forklift Operation",
    "Loader Driving",
  ],

  Delivery: [
    "Parcel Delivery",
    "Food Delivery",
    "Document Delivery",
    "Loading",
    "Unloading",
    "Route Planning",
  ],

  Loading_Unloading: [
    "Loading",
    "Unloading",
    "Packing",
    "Material Handling",
    "Warehouse Support",
    "Heavy Lifting",
  ],

  Warehouse: [
    "Inventory Management",
    "Packing",
    "Sorting",
    "Stock Handling",
    "Barcode Scanning",
    "Material Loading",
    "Forklift Operation",
  ],

  Cooking: [
    "South Indian Cooking",
    "North Indian Cooking",
    "Chinese Cooking",
    "Bakery",
    "Snacks Preparation",
    "Food Preparation",
    "Kitchen Assistance",
  ],

  Hospitality: [
    "Waiter",
    "Table Service",
    "Food Serving",
    "Customer Service",
    "Cash Handling",
    "Kitchen Helper",
  ],

  Security: [
    "Gate Security",
    "Night Security",
    "Visitor Management",
    "Patrolling",
    "CCTV Monitoring",
    "Access Control",
  ],

  Tailoring: [
    "Stitching",
    "Alteration",
    "Embroidery",
    "Machine Sewing",
    "Cutting",
    "Ironing",
  ],

  Beauty: [
    "Hair Cutting",
    "Hair Styling",
    "Makeup",
    "Facial",
    "Threading",
    "Manicure",
    "Pedicure",
  ],

  Mechanic: [
    "Bike Repair",
    "Car Repair",
    "Diesel Engine Repair",
    "Oil Change",
    "Tyre Replacement",
    "Brake Repair",
    "Battery Replacement",
  ],

  AC_Refrigeration: [
    "AC Installation",
    "AC Repair",
    "Gas Filling",
    "Refrigerator Repair",
    "Cooling System Maintenance",
  ],

  Electronics: [
    "TV Repair",
    "Washing Machine Repair",
    "Microwave Repair",
    "Mixer Repair",
    "Mobile Repair",
  ],

  Other: [
    "Helper",
    "General Labour",
    "Heavy Lifting",
    "Packing",
    "Unpacking",
    "Cleaning",
    "Team Work",
    "Time Management",
    "Communication",
    "Customer Handling",
    "Material Handling",
    "Quality Inspection",
    "Machine Operation",
    "Safety Compliance",
    "Problem Solving",
  ],
};

export const JOB_STATUS = [
  {
    value: "Active",
    label: "Active",
  },
  {
    value: "Paused",
    label: "Paused",
  },
  {
    value: "Completed",
    label: "Completed",
  },
  {
    value: "Expired",
    label: "Expired",
  },
];

export const JOB_COMPLETION_STATUS = Object.freeze({
  ASSIGNED: "Assigned", // job level: worker hired, no session yet
  STARTED: "Started", // session: worker started work today
  IN_PROGRESS: "InProgress", // job level: multi-day job, some days done
  COMPLETED: "Completed", // session: worker ended the day
  APPROVED: "Approved", // employer approved the day's work
  PAID: "Paid", // salary paid
  DISPUTED: "Disputed", // employer or worker raised an issue
});

export const WORKER_WORKING_STATUS = Object.freeze({
  NOT_AVAILABLE: "Not Available", // off today (leave, sick, etc.)
  AVAILABLE: "Available", // free today, open to job offers
  WORKING: "Working", // currently on a job
  BREAK_START: "Break Start",
  BREAK_END: "Break End",
  START_TOMORROW: "Start Tomorrow", // not working today, will start tomorrow
});

export const JOB_STATUS_VALUES = Object.freeze({
  ACTIVE: "Active",
  PAUSED: "Paused",
  DELETED: "Deleted",
});
