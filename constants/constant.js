import Step1 from "@/app/(onboarding)/onboarding/steps/Step1";
import Step2 from "@/app/(onboarding)/onboarding/steps/Step2";
import Step3 from "@/app/(onboarding)/onboarding/steps/Step3";
import Step4 from "@/app/(onboarding)/onboarding/steps/Step4";
import Step5 from "@/app/(onboarding)/onboarding/steps/Step5";

export const WORKER_ONBOARD_STEPS = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
};

export const EMPLOYER_ONBOARD_STEPS = {
  1: Step1,
  2: Step4,
  5: Step5,
};

export const ONBOARD_PAGES = [1, 2, 3, 4, 5, 6];

export const JOB_APPLICATION_STATUS = [
  "applied",
  "viewed",
  "shortlisted",
  "accepted",
  "rejected",
];

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

const statuses = [
  "All",
  "Applied",
  "Viewed",
  "Shortlisted",
  "Accepted",
  "Rejected",
];

export const appliedjobStatus = [
  { value: "applied", label: "Applied" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

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

export const ALLOWED_ROLES = ["admin", "employer", "worker"];

export const SALARY_CREDIT_TYPES = [
  { value: "", label: "Select a salary type" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export const SHIFT_TYPES = [
  {
    value: "",
    label: "Select shift type",
  },
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
];

export const JOINING_TYPES = [
  { value: "", label: "Select Joining Period" },
  { value: "same_day", label: "Same Day" },
  { value: "next_day", label: "Next Day" },
  { value: "within-1-weeks", label: "within 1 weeks" },
  { value: "within-2-weeks", label: "within 2 weeks" },
  { value: "This_month", label: "This Month" },
];

export const GENDER_TYPES = [
  { value: "", label: "Select Gender" },
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Any", label: "Any Gender" },
];

export const SALARY_CREDIT_TYPES_VALUES = SALARY_CREDIT_TYPES.map(
  (item) => item.value,
);

export const SHIFT_TYPE_VALUES = SHIFT_TYPES.map((item) => item.value);

export const JOINING_TYPE_VALUES = JOINING_TYPES.map((item) => item.value);

export const GENDER_TYPES_VALUES = GENDER_TYPES.map((item) => item.value);

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Basic",
  "Good",
  "Experienced",
  "Expert",
];

export const EXPERIENCE_LEVELS_VALUES = EXPERIENCE_LEVELS.map(
  (item) => item.value,
);

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
