import { useState, useRef, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

interface CustomerIntelligenceProps {
  onNavigate: (page: string) => void
}

// Dummy data for Proposition 1
const proposition1Data = [
  {
    sno: 1,
    customerName: "Sarah Johnson",
    companyName: "TechCorp Inc.",
    clientType: "Corporate",
    keyChallenges: "Executive Presence, Communication",
    priorityCategory: "High",
    participants: "15",
    insights: "High Visibility, Quarterly Events, $50K Annual",
    contactPerson: "Michael Chen",
    designation: "HR Director",
    email: "m.chen@techcorp.com",
    phone: "+1-555-0101",
    linkedin: "linkedin.com/in/mchen",
    website: "www.techcorp.com"
  },
  {
    sno: 2,
    customerName: "David Martinez",
    companyName: "Self-Employed",
    clientType: "Individual",
    keyChallenges: "Style, Cultural Fit",
    priorityCategory: "Moderate",
    participants: "1",
    insights: "Media Appearances, Monthly Events, $15K Annual",
    contactPerson: "David Martinez",
    designation: "Self",
    email: "david.m@email.com",
    phone: "+1-555-0102",
    linkedin: "linkedin.com/in/davidmartinez",
    website: "www.davidmartinez.com"
  },
  {
    sno: 3,
    customerName: "Emily Thompson",
    companyName: "Global Finance Ltd.",
    clientType: "Corporate",
    keyChallenges: "Executive Presence, Style",
    priorityCategory: "High",
    participants: "25",
    insights: "C-Suite Level, Weekly Events, $75K Annual",
    contactPerson: "Jennifer Lee",
    designation: "L&D Manager",
    email: "j.lee@globalfinance.com",
    phone: "+1-555-0103",
    linkedin: "linkedin.com/in/jenniferlee",
    website: "www.globalfinance.com"
  },
  {
    sno: 4,
    customerName: "Robert Williams",
    companyName: "Williams & Associates",
    clientType: "Individual",
    keyChallenges: "Communication, Cultural Fit",
    priorityCategory: "Low",
    participants: "3",
    insights: "Professional Events, Bi-monthly, $8K Annual",
    contactPerson: "Robert Williams",
    designation: "Self",
    email: "r.williams@associates.com",
    phone: "+1-555-0104",
    linkedin: "linkedin.com/in/robertwilliams",
    website: "www.williamsassociates.com"
  },
  {
    sno: 5,
    customerName: "Lisa Anderson",
    companyName: "MediaPro Studios",
    clientType: "Corporate",
    keyChallenges: "Style, Executive Presence",
    priorityCategory: "High",
    participants: "10",
    insights: "Public Appearances, Daily Events, $40K Annual",
    contactPerson: "Tom Baker",
    designation: "Agent",
    email: "t.baker@mediapro.com",
    phone: "+1-555-0105",
    linkedin: "linkedin.com/in/tombaker",
    website: "www.mediapro.com"
  },
  {
    sno: 6,
    customerName: "James Brown",
    companyName: "Brown Consulting",
    clientType: "Individual",
    keyChallenges: "Executive Presence",
    priorityCategory: "Moderate",
    participants: "1",
    insights: "Client Meetings, Weekly, $12K Annual",
    contactPerson: "James Brown",
    designation: "Self",
    email: "james@brownconsulting.com",
    phone: "+1-555-0106",
    linkedin: "linkedin.com/in/jamesbrown",
    website: "www.brownconsulting.com"
  },
  {
    sno: 7,
    customerName: "Maria Garcia",
    companyName: "Healthcare Plus",
    clientType: "Corporate",
    keyChallenges: "Communication, Style",
    priorityCategory: "High",
    participants: "20",
    insights: "Leadership Team, Monthly Events, $60K Annual",
    contactPerson: "Susan White",
    designation: "EA to CEO",
    email: "s.white@healthcareplus.com",
    phone: "+1-555-0107",
    linkedin: "linkedin.com/in/susanwhite",
    website: "www.healthcareplus.com"
  },
  {
    sno: 8,
    customerName: "Christopher Davis",
    companyName: "Davis Law Firm",
    clientType: "Individual",
    keyChallenges: "Cultural Fit, Executive Presence",
    priorityCategory: "Moderate",
    participants: "5",
    insights: "Court Appearances, Weekly, $20K Annual",
    contactPerson: "Christopher Davis",
    designation: "Self",
    email: "c.davis@davislawfirm.com",
    phone: "+1-555-0108",
    linkedin: "linkedin.com/in/christopherdavis",
    website: "www.davislawfirm.com"
  }
]

// Dummy data for Proposition 2 (extends Proposition 1 with additional fields)
const proposition2Data = proposition1Data.map(item => ({
  ...item,
  motivation: item.clientType === "Corporate" ? "Career Advancement" : "Personal Rebranding",
  upcomingEvents: item.clientType === "Corporate" ? "Annual Conference" : "Media Appearance",
  reputationSensitivity: item.priorityCategory === "High" ? "High-discretion" : "Standard",
  familyMembers: item.participants === "1" ? "No" : "Yes"
}))

// Dummy data for Proposition 3 (extends Proposition 2 with even more fields)
const proposition3Data = proposition2Data.map(item => ({
  ...item,
  decisionMakers: item.clientType === "Corporate" ? "HR, L&D" : "Self",
  procurementMethod: item.clientType === "Corporate" ? "HR Budget" : "Self-Funded",
  budgetLevel: item.priorityCategory === "High" ? "Premium" : item.priorityCategory === "Moderate" ? "Mid" : "Entry",
  consultingType: "Wardrobe Audit, Executive Presence",
  engagementIntensity: item.clientType === "Corporate" ? "Retainer" : "Event-based",
  contractDuration: item.clientType === "Corporate" ? "Annual" : "Multi-session",
  technologyExpectation: "Virtual Closet, Digital Lookbook",
  otherDetails: item.clientType === "Corporate" ? "Corporate Policy Compliant" : "Flexible Schedule",
  benchmarking: "Potential Customer",
  comments: "High engagement potential"
}))


export function CustomerIntelligence({ onNavigate }: CustomerIntelligenceProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'proposition1' | 'proposition2' | 'proposition3'>('proposition1')
  
  const topScrollRef1 = useRef<HTMLDivElement>(null)
  const bottomScrollRef1 = useRef<HTMLDivElement>(null)
  const topScrollRef2 = useRef<HTMLDivElement>(null)
  const bottomScrollRef2 = useRef<HTMLDivElement>(null)
  const topScrollRef3 = useRef<HTMLDivElement>(null)
  const bottomScrollRef3 = useRef<HTMLDivElement>(null)

  // Sync scrollbars
  useEffect(() => {
    const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
      if (source && target) {
        const handleScroll = () => {
          target.scrollLeft = source.scrollLeft
        }
        source.addEventListener('scroll', handleScroll)
        return () => source.removeEventListener('scroll', handleScroll)
      }
    }

    const cleanup1a = syncScroll(bottomScrollRef1.current, topScrollRef1.current)
    const cleanup1b = syncScroll(topScrollRef1.current, bottomScrollRef1.current)
    const cleanup2a = syncScroll(bottomScrollRef2.current, topScrollRef2.current)
    const cleanup2b = syncScroll(topScrollRef2.current, bottomScrollRef2.current)
    const cleanup3a = syncScroll(bottomScrollRef3.current, topScrollRef3.current)
    const cleanup3b = syncScroll(topScrollRef3.current, bottomScrollRef3.current)

    return () => {
      cleanup1a?.()
      cleanup1b?.()
      cleanup2a?.()
      cleanup2b?.()
      cleanup3a?.()
      cleanup3b?.()
    }
  }, [activeTab])

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('Home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-electric-blue text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 uppercase">
          GLOBAL RETAIL SELF SCANNING SOLUTION MARKET DATABASE
        </h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Comprehensive intelligence on global retail self-scanning solution market
        </p>
      </motion.div>

      {/* Tabs Section */}
      <div className={`p-6 rounded-2xl mb-6 shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        <div className="flex gap-4 border-b-2 border-gray-300 dark:border-navy-light">
          <button
            onClick={() => setActiveTab('proposition1')}
            className={`px-8 py-3 font-semibold text-base transition-all relative ${
              activeTab === 'proposition1'
                ? 'text-white bg-electric-blue rounded-t-lg'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
            }`}
          >
            Proposition 1
          </button>
          <button
            onClick={() => setActiveTab('proposition2')}
            className={`px-8 py-3 font-semibold text-base transition-all relative ${
              activeTab === 'proposition2'
                ? 'text-white bg-electric-blue rounded-t-lg'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
            }`}
          >
            Proposition 2
          </button>
          <button
            onClick={() => setActiveTab('proposition3')}
            className={`px-8 py-3 font-semibold text-base transition-all relative ${
              activeTab === 'proposition3'
                ? 'text-white bg-electric-blue rounded-t-lg'
                : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-electric-blue dark:hover:text-cyan-accent'
            }`}
          >
            Proposition 3
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={`p-8 rounded-2xl shadow-xl ${isDark ? 'bg-navy-card border-2 border-navy-light' : 'bg-white border-2 border-gray-300'}`}>
        {activeTab === 'proposition1' && (
          <div>
            {/* Top Scrollbar */}
            <div ref={topScrollRef1} className="overflow-x-auto mb-2" style={{ overflowY: 'hidden', height: '20px' }}>
              <div style={{ height: '1px', width: '200%' }}></div>
            </div>
            {/* Main Content with Bottom Scrollbar */}
            <div ref={bottomScrollRef1} className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {/* Main Header Row */}
                <tr>
                  <th colSpan={8} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-purple-900 bg-opacity-30' : 'bg-purple-200'}`}>
                    Customer Information
                  </th>
                  <th colSpan={6} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-200'}`}>
                    Contact Details
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="text-xs">
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    S.No.
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Customer Name
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Company Name
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Type of Client<br/>(Individual/<br/>Corporate)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Key Image Challenges<br/>(Style, Executive Presence, Communication, Cultural Fit)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Image Priority Category<br/>(Low/ Moderate/ High)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Number of Participants Requiring Image Consulting
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Other Key Insights<br/>(Visibility Level, Event Frequency, Lifestyle, Annual Spend)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Key Contact Person
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Designation / Role<br/>(HR, L&D, EA, Self, Agent)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Email Address
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Phone / WhatsApp Number
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    LinkedIn Profile
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Website URL
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposition1Data.map((row) => (
                  <tr key={row.sno} className="text-sm">
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.sno}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.customerName}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.companyName}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.clientType}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.keyChallenges}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.priorityCategory}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.participants}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.insights}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.contactPerson}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.designation}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.email}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.phone}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.linkedin}
                    </td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>
                      {row.website}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'proposition2' && (
          <div>
            {/* Top Scrollbar */}
            <div ref={topScrollRef2} className="overflow-x-auto mb-2" style={{ overflowY: 'hidden', height: '20px' }}>
              <div style={{ height: '1px', width: '200%' }}></div>
            </div>
            {/* Main Content with Bottom Scrollbar */}
            <div ref={bottomScrollRef2} className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {/* Main Header Row */}
                <tr>
                  <th colSpan={8} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-purple-900 bg-opacity-30' : 'bg-purple-200'}`}>
                    Customer Information
                  </th>
                  <th colSpan={6} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-200'}`}>
                    Contact Details
                  </th>
                  <th colSpan={4} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-200'}`}>
                    Personal/Professional Branding Drivers
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="text-xs">
                  {/* Customer Information Columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    S.No.
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Customer Name
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Company Name
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Type of Client<br/>(Individual/<br/>Corporate)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Key Image Challenges<br/>(Style, Executive Presence, Communication, Cultural Fit)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Image Priority Category<br/>(Low/ Moderate/ High)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Number of Participants Requiring Image Consulting
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    Other Key Insights<br/>(Visibility Level, Event Frequency, Lifestyle, Annual Spend)
                  </th>
                  {/* Contact Details Columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Key Contact Person
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Designation / Role<br/>(HR, L&D, EA, Self, Agent)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Email Address
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Phone / WhatsApp Number
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    LinkedIn Profile
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>
                    Website URL
                  </th>
                  {/* Personal/Professional Branding Drivers Columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>
                    Motivation for Image Consulting<br/>(Career, Promotion, Rebranding, Social Visibility)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>
                    Upcoming Events/ Triggers<br/>(Media Appearance, Conference, Wedding, etc.)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>
                    Reputation Sensitivity<br/>(High-discretion/ Standard)
                  </th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>
                    Family Members/ Kin Needing Services<br/>(Yes/ No)
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposition2Data.map((row) => (
                  <tr key={row.sno} className="text-sm">
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.sno}</td>
                    <td className={`border-2 border-gray-400 p-2 ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.customerName}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.companyName}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.clientType}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.keyChallenges}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.priorityCategory}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.participants}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.insights}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.contactPerson}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.designation}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.email}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.phone}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.linkedin}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.website}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.motivation}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.upcomingEvents}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.reputationSensitivity}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.familyMembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'proposition3' && (
          <div>
            {/* Top Scrollbar */}
            <div ref={topScrollRef3} className="overflow-x-auto mb-2" style={{ overflowY: 'hidden', height: '20px' }}>
              <div style={{ height: '1px', width: '300%' }}></div>
            </div>
            {/* Main Content with Bottom Scrollbar */}
            <div ref={bottomScrollRef3} className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                {/* Main Header Row */}
                <tr>
                  <th colSpan={8} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-purple-900 bg-opacity-30' : 'bg-purple-200'}`}>
                    Customer Information
                  </th>
                  <th colSpan={6} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-200'}`}>
                    Contact Details
                  </th>
                  <th colSpan={4} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-200'}`}>
                    Personal/Professional Branding Drivers
                  </th>
                  <th colSpan={3} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-200'}`}>
                    Purchasing Behaviour
                  </th>
                  <th colSpan={5} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-200'}`}>
                    Service Requirements
                  </th>
                  <th colSpan={2} className={`border-2 border-gray-400 p-3 text-center font-bold ${isDark ? 'bg-pink-900 bg-opacity-30' : 'bg-pink-200'}`}>
                    CMI Insights
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="text-xs">
                  {/* Customer Information - 8 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>S.No.</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Customer Name</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Company Name</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Type of Client<br/>(Individual/Corporate)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Key Image Challenges</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Image Priority Category</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Number of Participants</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>Other Key Insights</th>
                  
                  {/* Contact Details - 6 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>Key Contact Person</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>Designation / Role</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>Email Address</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>Phone / WhatsApp Number</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>LinkedIn Profile</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-cyan-900 bg-opacity-30' : 'bg-cyan-100'}`}>Website URL</th>
                  
                  {/* Personal/Professional Branding Drivers - 4 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>Motivation for Image Consulting</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>Upcoming Events/ Triggers</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>Reputation Sensitivity</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-green-900 bg-opacity-30' : 'bg-green-100'}`}>Family Members/ Kin Needing Services</th>
                  
                  {/* Purchasing Behaviour - 3 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'}`}>Decision-Makers<br/>(Self, HR, L&D, Line Manager, CEO, Agent)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'}`}>Procurement Method<br/>(Self-Funded, HR Budget, Corporate Vendor, Referral via Agency)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-orange-900 bg-opacity-30' : 'bg-orange-100'}`}>Budget Level<br/>(Entry/ Mid/ Premium/ Ultra-Premium)</th>
                  
                  {/* Service Requirements - 5 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'}`}>Type of Image Consulting<br/>(Wardrobe Audit, Color Analysis, Executive Presence, etc.)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'}`}>Engagement Intensity<br/>(One-time, Monthly, Event-based, Retainer)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'}`}>Preferred Contract Duration<br/>(Single Session, Multi-session, 3-6 Months, Annual)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'}`}>Technology Expectation<br/>$ (Virtual Closet, Digital Lookbook, LMS Access)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100'}`}>Other Key Details<br/>(Corporate Policy, Constraints, Cultural Requirements)</th>
                  
                  {/* CMI Insights - 2 columns */}
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-pink-900 bg-opacity-30' : 'bg-pink-100'}`}>Customer Benchmarking Summary<br/>(Potential Customer, Peer Group)</th>
                  <th className={`border-2 border-gray-400 p-2 font-semibold ${isDark ? 'bg-pink-900 bg-opacity-30' : 'bg-pink-100'}`}>Additional Comments/ Notes by CMI Team</th>
                </tr>
              </thead>
              <tbody>
                {proposition3Data.map((row) => (
                  <tr key={row.sno} className="text-sm">
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.sno}</td>
                    <td className={`border-2 border-gray-400 p-2 ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.customerName}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.companyName}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.clientType}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.keyChallenges}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.priorityCategory}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.participants}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.insights}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.contactPerson}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.designation}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.email}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.phone}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.linkedin}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.website}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.motivation}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.upcomingEvents}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.reputationSensitivity}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.familyMembers}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.decisionMakers}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.procurementMethod}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.budgetLevel}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.consultingType}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.engagementIntensity}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.contractDuration}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.technologyExpectation}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.otherDetails}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.benchmarking}</td>
                    <td className={`border-2 border-gray-400 p-2 text-center ${isDark ? 'bg-navy-dark' : 'bg-white'}`}>{row.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
