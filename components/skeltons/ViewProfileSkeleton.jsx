// skeletons/ViewProfileSkeleton.jsx


const Bar = ({ className = "", rounded = "rounded" }) => (
  <div className={`bg-gray-200 ${rounded} ${className}`} />
);

const Line = ({ width, height = "h-4", row = "h-5" }) => (
  <div className={`flex items-center ${row}`}>
    <Bar className={`${height} ${width}`} />
  </div>
);

const SectionTitle = ({ width = "w-48", mb = "mb-5" }) => (
  <Bar className={`h-6 ${width} ${mb}`} />
);

const Section = ({ children, last = false }) => (
  <div className={`p-6 md:p-8 ${last ? "" : "border-b"}`}>{children}</div>
);

// label + value pair (Personal Information)
const InfoItem = () => (
  <div className="flex flex-col gap-2">
    <Line width="w-16" />
    <Line width="w-32" height="h-4" row="h-6" />
  </div>
);

// icon + label + value (Contact)
const ContactCard = ({ valueWidth }) => (
  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
    <Bar className="h-5 w-5 shrink-0" />
    <div className="flex min-w-0 flex-col gap-2">
      <Bar className="h-3 w-12" />
      <Bar className={`h-5 ${valueWidth} max-w-full`} />
    </div>
  </div>
);

// Job Preferences card
const PrefCard = () => (
  <div className="rounded-lg bg-gray-50 p-4">
    <Bar className="h-4 w-24" />
    <Bar className="mt-3 h-5 w-32" />
  </div>
);

const SKILL_WIDTHS = ["w-28", "w-32", "w-24", "w-36"];

const SettingRow = ({ pillWidth = "w-28" }) => (
  <div className="flex items-center justify-between border-b px-2 py-4">
    <div className="flex flex-col gap-2">
      <Bar className="h-6 w-48" />
      <Bar className="h-4 w-40" />
    </div>
    <Bar className={`h-10 ${pillWidth}`} rounded="rounded-lg" />
  </div>
);

const ApplicationsFooter = () => (
  <div className="border-b p-4 md:p-8">
    <SettingRow />
    <SettingRow />

    {/* Work Site Images */}
    <Bar className="mt-4 h-6 w-40" />
    <div className="flex items-center gap-2 overflow-x-auto border-b px-2 py-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Bar key={i} className="h-24 w-24 shrink-0" rounded="rounded-md" />
      ))}
    </div>

    {/* Application Status (select) */}
    <div className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <Bar className="h-6 w-44" />
        <Bar className="h-4 w-56 max-w-full" />
      </div>
      <Bar className="h-10 w-40" rounded="rounded-lg" />
    </div>
  </div>
);

const InvitationFooter = () => (
  <div className="flex items-center justify-center">
    <Bar className="m-3 h-12 w-44" rounded="rounded-md" />
  </div>
);

export default function ViewProfileSkeleton({ type }) {
  const isApplications = type === "applications";

  return (
    <div role="status" className="bg-gray-50 p-4 md:p-8">
      <span className="sr-only">Loading profile…</span>

      <div
        aria-hidden="true"
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-sm motion-safe:animate-pulse"
      >
        {/* Header */}
        <div className="border-b p-6 md:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Bar className="h-28 w-28 shrink-0" rounded="rounded-full" />

            <div className="flex w-full flex-1 flex-col items-center gap-3 sm:items-start">
              <Bar className="h-7 w-48" />
              <Bar className="h-6 w-40" />
              <Bar className="h-4 w-28" />
            </div>

            {!isApplications && (
              <Bar className="m-2 h-8 w-32 shrink-0" rounded="rounded-md" />
            )}
          </div>
        </div>

        {/* Personal Information */}
        <Section>
          <SectionTitle />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <InfoItem key={i} />
            ))}
          </div>
        </Section>

        {/* Contact Information */}
        <Section>
          <SectionTitle />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContactCard valueWidth="w-36" />
            <ContactCard valueWidth="w-44" />
          </div>
        </Section>

        {/* About */}
        <Section>
          <SectionTitle width="w-20" mb="mb-3" />
          <div className="flex flex-col">
            <Line width="w-full" row="h-7" />
            <Line width="w-11/12" row="h-7" />
            <Line width="w-2/3" row="h-7" />
          </div>
        </Section>

        {/* Job Preferences */}
        <Section>
          <SectionTitle />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 5 }, (_, i) => (
              <PrefCard key={i} />
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section>
          <SectionTitle width="w-20" mb="mb-4" />
          <div className="flex flex-wrap gap-3">
            {SKILL_WIDTHS.map((w, i) => (
              <Bar key={i} className={`h-10 ${w}`} rounded="rounded-full" />
            ))}
          </div>
        </Section>

        {/* Bottom: depends on type, same as the real page */}
        {isApplications ? <ApplicationsFooter /> : <InvitationFooter />}
      </div>
    </div>
  );
}