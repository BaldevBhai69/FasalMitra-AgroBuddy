'use client';

import React, { useState } from 'react';
import { useAuth, FarmerProfile } from '@/lib/auth-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  'Uttar Pradesh': [
    'Lucknow', 'Varanasi', 'Kanpur Nagar', 'Prayagraj', 'Agra', 'Meerut', 'Bareilly',
    'Gorakhpur', 'Jhansi', 'Aligarh', 'Ayodhya', 'Mathura', 'Moradabad', 'Saharanpur',
    'Muzaffarnagar', 'Basti', 'Azamgarh', 'Mirzapur', 'Sitapur', 'Hardoi', 'Lakhimpur Kheri',
    'Barabanki', 'Unnao', 'Rae Bareli', 'Sultanpur', 'Amethi', 'Pratapgarh', 'Gonda',
    'Bahraich', 'Ballia', 'Ghazipur', 'Jaunpur', 'Deoria', 'Kushinagar', 'Mau',
    'Siddharthnagar', 'Maharajganj', 'Sant Kabir Nagar', 'Bijnor', 'Rampur', 'Pilibhit',
    'Shahjahanpur', 'Budaun', 'Sambhal', 'Amroha', 'Bulandshahr', 'Hapur', 'Baghpat',
    'Gautam Buddha Nagar', 'Ghaziabad', 'Shamli', 'Hathras', 'Kasganj', 'Etah', 'Mainpuri',
    'Firozabad', 'Farrukhabad', 'Kannauj', 'Etawah', 'Auraiya', 'Jalaun', 'Hamirpur',
    'Mahoba', 'Banda', 'Chitrakoot', 'Fatehpur', 'Kaushambi', 'Lalitpur', 'Sonbhadra',
    'Chandauli', 'Bhadohi', 'Kanpur Dehat', 'Shravasti', 'Kaushambi'
  ],
  'Maharashtra': [
    'Pune', 'Nagpur', 'Nashik', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Solapur',
    'Kolhapur', 'Ahmednagar (Ahilyanagar)', 'Satara', 'Sangli', 'Amravati', 'Nanded',
    'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Chandrapur', 'Parbhani', 'Beed',
    'Yavatmal', 'Jalna', 'Buldhana', 'Wardha', 'Bhandara', 'Gondia', 'Washim',
    'Hingoli', 'Gadchiroli', 'Dharashiv (Osmanabad)', 'Ratnagiri', 'Sindhudurg',
    'Raigad', 'Palghar', 'Thane', 'Mumbai City', 'Mumbai Suburban', 'Nandurbar'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur',
    'SAS Nagar (Mohali)', 'Gurdaspur', 'Pathankot', 'Firozpur', 'Faridkot',
    'Fazilka', 'Sri Muktsar Sahib', 'Moga', 'Kapurthala', 'Tarn Taran',
    'Rupnagar', 'Fatehgarh Sahib', 'Barnala', 'Mansa', 'Sangrur', 'Malerkotla',
    'SBS Nagar (Nawanshahr)'
  ],
  'Haryana': [
    'Karnal', 'Hisar', 'Ambala', 'Rohtak', 'Gurugram', 'Faridabad', 'Panipat',
    'Sonipat', 'Yamunanagar', 'Kurukshetra', 'Sirsa', 'Jind', 'Bhiwani', 'Rewari',
    'Kaithal', 'Palwal', 'Fatehabad', 'Jhajjar', 'Charkhi Dadri', 'Mahendragarh',
    'Nuh', 'Panchkula'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Khargone (West Nimar)', 'Khandwa (East Nimar)', 'Katni',
    'Singrauli', 'Morena', 'Bhind', 'Shivpuri', 'Guna', 'Datia', 'Vidisha',
    'Sehore', 'Raisen', 'Rajgarh', 'Narmadapuram (Hoshangabad)', 'Betul', 'Harda',
    'Chhindwara', 'Seoni', 'Balaghat', 'Mandla', 'Dindori', 'Narsinghpur', 'Damoh',
    'Panna', 'Chhatarpur', 'Tikamgarh', 'Niwari', 'Sidhi', 'Shahdol', 'Umaria',
    'Anuppur', 'Neemuch', 'Mandsaur', 'Shajapur', 'Agar Malwa', 'Barwani', 'Burhanpur',
    'Alirajpur', 'Jhabua', 'Dhar', 'Sheopur', 'Ashoknagar'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Bhavnagar', 'Jamnagar', 'Junagadh',
    'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Bharuch', 'Porbandar', 'Mehsana',
    'Kutch', 'Surendranagar', 'Amreli', 'Banaskantha', 'Sabarkantha', 'Patan',
    'Dahod', 'Panchmahal', 'Kheda', 'Botad', 'Gir Somnath', 'Devbhoomi Dwarka',
    'Tapi', 'Narmada', 'Valsad', 'Dang', 'Chhota Udaipur', 'Mahisagar', 'Aravalli'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar',
    'Bharatpur', 'Sikar', 'Sri Ganganagar', 'Pali', 'Chittorgarh', 'Tonk', 'Nagaur',
    'Jhunjhunu', 'Hanumangarh', 'Barmer', 'Jalore', 'Jaisalmer', 'Sirohi', 'Rajsamand',
    'Banswara', 'Dungarpur', 'Pratapgarh', 'Dausa', 'Sawai Madhopur', 'Karauli',
    'Dholpur', 'Baran', 'Bundi', 'Jhalawar', 'Churu', 'Balotra', 'Beawar', 'Didwana-Kuchaman'
  ],
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Hubballi-Dharwad',
    'Dakshina Kannada (Mangaluru)', 'Kalaburagi', 'Davanagere', 'Ballari', 'Vijayapura',
    'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar', 'Hassan', 'Mandya', 'Udupi',
    'Kolar', 'Chikkamagaluru', 'Chitradurga', 'Bagalkote', 'Haveri', 'Gadag', 'Yadgir',
    'Chamarajanagar', 'Ramanagara', 'Koppal', 'Uttara Kannada', 'Kodagu',
    'Chikkaballapura', 'Vijayanagara'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Nellore (SPSR)', 'Kurnool',
    'Kakinada', 'East Godavari (Rajamahendravaram)', 'Tirupati', 'Kadapa (YSR)',
    'Anantapur', 'Eluru', 'Prakasam (Ongole)', 'Srikakulam', 'Vizianagaram',
    'Krishna (Machilipatnam)', 'Bapatla', 'Palnadu', 'Nandyal', 'Sri Sathya Sai',
    'Annamayya', 'Chittoor', 'Parvathipuram Manyam', 'Alluri Sitharama Raju',
    'Anakapalli', 'Konaseema', 'West Godavari'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Nalgonda',
    'Mahbubnagar', 'Adilabad', 'Medak', 'Rangareddy', 'Sangareddy', 'Siddipet',
    'Suryapet', 'Jagtial', 'Kamareddy', 'Mancherial', 'Nirmal', 'Bhadradri Kothagudem',
    'Jayashankar Bhupalpally', 'Jangaon', 'Mahabubabad', 'Hanamkonda', 'Peddapalli',
    'Rajanna Sircilla', 'Vikarabad', 'Yadadri Bhuvanagiri', 'Wanaparthy',
    'Nagarkurnool', 'Jogulamba Gadwal', 'Narayanpet', 'Mulugu', 'Medchal-Malkajgiri',
    'Kumuram Bheem Asifabad'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
    'Tiruppur', 'Erode', 'Vellore', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore',
    'Chengalpattu', 'Villupuram', 'Ranipet', 'Tirupathur', 'Tiruvannamalai',
    'Dharmapuri', 'Krishnagiri', 'Namakkal', 'Nilgiris', 'Karur', 'Perambalur',
    'Ariyalur', 'Nagapattinam', 'Mayiladuthurai', 'Tiruvarur', 'Pudukkottai',
    'Sivaganga', 'Virudhunagar', 'Ramanathapuram', 'Thoothukudi', 'Tenkasi',
    'Kanniyakumari', 'Theni', 'Kallakurichi'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas', 'Hooghly',
    'Paschim Medinipur', 'Purba Medinipur', 'Purba Bardhaman', 'Paschim Bardhaman',
    'Nadia', 'Murshidabad', 'Malda', 'Uttar Dinajpur', 'Dakshin Dinajpur',
    'Jalpaiguri', 'Darjeeling', 'Alipurduar', 'Cooch Behar', 'Bankura', 'Purulia',
    'Birbhum', 'Kalimpong', 'Jhargram'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Begusarai',
    'Munger', 'Nalanda', 'Saran', 'Samastipur', 'Rohtas', 'Vaishali', 'Saharsa',
    'Katihar', 'Madhubani', 'Siwan', 'Gopalganj', 'Sitamarhi', 'East Champaran',
    'West Champaran', 'Bhojpur', 'Buxar', 'Kaimur', 'Jehanabad', 'Arwal',
    'Nawada', 'Aurangabad', 'Jamui', 'Banka', 'Lakhisarai', 'Sheikhpura',
    'Khagaria', 'Supaul', 'Madhepura', 'Araria', 'Kishanganj', 'Sheohar'
  ],
  'Odisha': [
    'Bhubaneswar (Khurda)', 'Cuttack', 'Sundargarh (Rourkela)', 'Puri', 'Balasore',
    'Ganjam (Berhampur)', 'Sambalpur', 'Bargarh', 'Bhadrak', 'Jajpur', 'Kendrapara',
    'Jagatsinghpur', 'Angul', 'Dhenkanal', 'Bolangir', 'Kalahandi', 'Rayagada',
    'Koraput', 'Nabarangpur', 'Malkangiri', 'Kandhamal', 'Boudh', 'Subarnapur',
    'Nuapada', 'Deogarh', 'Jharsuguda', 'Keonjhar', 'Mayurbhanj', 'Nayagarh', 'Gajapati'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Ernakulam (Kochi)', 'Kozhikode', 'Thrissur', 'Kollam',
    'Palakkad', 'Malappuram', 'Kannur', 'Alappuzha', 'Kottayam', 'Idukki',
    'Wayanad', 'Pathanamthitta', 'Kasaragod'
  ],
  'Assam': [
    'Kamrup Metropolitan (Guwahati)', 'Kamrup', 'Dibrugarh', 'Jorhat', 'Cachar (Silchar)',
    'Nagaon', 'Tinsukia', 'Sonitpur (Tezpur)', 'Barpeta', 'Dhubri', 'Goalpara',
    'Nalbari', 'Bongaigaon', 'Darrang', 'Golaghat', 'Sivasagar', 'Lakhimpur',
    'Dhemaji', 'Karimganj', 'Hailakandi', 'Morigaon', 'Kokrajhar', 'Chirang',
    'Baksa', 'Udalguri', 'Karbi Anglong', 'Dima Hasao', 'Majuli'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bilaspur', 'Durg', 'Bhilai', 'Korba', 'Rajnandgaon', 'Bastar (Jagdalpur)',
    'Surguja (Ambikapur)', 'Raigarh', 'Dhamtari', 'Mahasamund', 'Janjgir-Champa',
    'Balod', 'Bemetara', 'Kabirdham', 'Baloda Bazar', 'Gariaband', 'Mungeli',
    'Kondagaon', 'Narayanpur', 'Dantewada', 'Sukma', 'Bijapur', 'Kanker', 'Koriya',
    'Surajpur', 'Balrampur', 'Jashpur'
  ],
  'Jharkhand': [
    'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro', 'Hazaribagh',
    'Deoghar', 'Giridih', 'Ramgarh', 'Palamu', 'Dumka', 'West Singhbhum (Chaibasa)',
    'Saraikela Kharsawan', 'Chatra', 'Koderma', 'Godda', 'Sahibganj', 'Pakur',
    'Jamtara', 'Latehar', 'Garhwa', 'Lohardaga', 'Gumla', 'Simdega', 'Khunti'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Udham Singh Nagar (Rudrapur)', 'Nainital (Haldwani)',
    'Almora', 'Pauri Garhwal', 'Tehri Garhwal', 'Chamoli', 'Rudraprayag',
    'Uttarkashi', 'Pithoragarh', 'Champawat', 'Bageshwar'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Kullu', 'Una',
    'Hamirpur', 'Sirmaur', 'Chamba', 'Bilaspur', 'Lahaul and Spiti', 'Kinnaur'
  ],
};

const INDIAN_STATES = Object.keys(STATE_DISTRICTS_MAP);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Lucknow');
  const [village, setVillage] = useState('');
  const [totalLandAcres, setTotalLandAcres] = useState('4.0');
  const [language, setLanguage] = useState('hi');
  const [engine, setEngine] = useState<'ollama' | 'gemini'>('ollama');

  // Handle State selection change with auto-selection of first district
  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = STATE_DISTRICTS_MAP[newState] || ['All Districts'];
    setDistrict(districts[0] || 'All Districts');
  };

  // Auto-detected Soil Intelligence from Soil API
  const [autoSoil, setAutoSoil] = useState<{
    soilType: string;
    hindiName?: string;
    soilPh: number;
    soilOrganicCarbonPct: number;
    textureClass?: string;
    description?: string;
    loading: boolean;
  }>({
    soilType: 'Alluvial Loam',
    hindiName: 'जलोढ़ दोमट मिट्टी',
    soilPh: 7.3,
    soilOrganicCarbonPct: 0.65,
    textureClass: 'Loam',
    description: 'Grounded via ICAR Agro-Ecological Zones for Lucknow, Uttar Pradesh',
    loading: false,
  });

  // Query Soil API whenever location fields update
  React.useEffect(() => {
    if (mode !== 'register') return;
    const timeout = setTimeout(() => {
      setAutoSoil((prev) => ({ ...prev, loading: true }));
      fetch(`/api/v1/soil?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&village=${encodeURIComponent(village)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.data) {
            setAutoSoil({
              soilType: res.data.soilType,
              hindiName: res.data.hindiName,
              soilPh: res.data.soilPh,
              soilOrganicCarbonPct: res.data.soilOrganicCarbonPct,
              textureClass: res.data.textureClass,
              description: res.data.description,
              loading: false,
            });
          }
        })
        .catch(() => {
          setAutoSoil((prev) => ({ ...prev, loading: false }));
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [state, district, village, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim()) {
          throw new Error('Please enter your registered email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }
        await login(email.trim(), password);
      } else {
        if (!email.trim()) {
          throw new Error('Please enter an email address.');
        }
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const detectedSoilName = autoSoil.hindiName
          ? `${autoSoil.soilType} (${autoSoil.hindiName})`
          : autoSoil.soilType;

        const profileData: Omit<FarmerProfile, 'id'> = {
          fullName: fullName.trim() || 'Kisan Mitra',
          email: email.trim(),
          state,
          district: district.trim() || 'Lucknow',
          village: village.trim() || 'Gram Panchayat',
          totalLandAcres: parseFloat(totalLandAcres) || 4.0,
          soilType: detectedSoilName,
          preferredLanguage: language,
          preferredAiEngine: engine,
        };
        await register(profileData, password);
      }
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFullName('Ramesh Kumar Patel');
    setEmail('ramesh.patel@fasalmitra.in');
    setPassword('Ramesh@123');
    setState('Uttar Pradesh');
    setDistrict('Lucknow');
    setVillage('Malihabad');
    setTotalLandAcres('6.5');
    setLanguage('hi');
    setEngine('ollama');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DFD0] shadow-xl text-[#2D2A26] overflow-hidden">

        {/* Modal Header */}
        <div className="relative z-10 text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FEBA17]/20 text-[#A67500] mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333M4.5 21V10.333" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2D2A26]">
            {mode === 'register' ? 'Welcome to FasalMitra' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#8A7E6B]">
            {mode === 'register'
              ? 'Set up your farm profile for personalized agronomic intelligence'
              : 'Sign in with your email and password'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 grid grid-cols-2 p-1 mb-4 rounded-xl bg-[#F9F3E6] border border-[#E8DFD0]">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#FEBA17] text-[#14160C] shadow-sm'
                : 'text-[#8A7E6B] hover:text-[#2D2A26]'
            }`}
          >
            New Farmer
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#FEBA17] text-[#14160C] shadow-sm'
                : 'text-[#8A7E6B] hover:text-[#2D2A26]'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="relative z-10 mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {mode === 'register' ? (
            <>
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@gmail.com"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#8A7E6B]">Password (Min 6 Characters) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a secure password"
                  className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                />
              </div>

              {/* Location: State & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">State *</label>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] cursor-pointer transition"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">District *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] focus:outline-none focus:border-[#FEBA17] cursor-pointer transition"
                  >
                    {(STATE_DISTRICTS_MAP[state] || [district]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Village & Land Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Village *</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Malihabad"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Total Land (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={totalLandAcres}
                    onChange={(e) => setTotalLandAcres(e.target.value)}
                    placeholder="4.0"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
              </div>

              {/* Auto-detected soil */}
              <div className="flex items-center justify-between px-1 py-1 text-xs text-[#8A7E6B]">
                <span>Soil: <strong className="text-[#2D2A26] font-medium">{autoSoil.soilType} {autoSoil.hindiName ? `(${autoSoil.hindiName})` : ''}</strong></span>
                <span className="text-[10px] text-[#8A7E6B]/60">Auto-detected</span>
              </div>
            </>
          ) : (
            <>
              {/* Login View */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Email *</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8A7E6B]">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#F9F3E6] border border-[#E8DFD0] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2A26] placeholder-[#8A7E6B]/50 focus:outline-none focus:border-[#FEBA17] transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-3 space-y-2.5">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#FEBA17] hover:bg-[#E5A60F] text-[#14160C] font-bold text-sm transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <span>Loading...</span>
              ) : mode === 'register' ? (
                <span>Register & Open Dashboard</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  await login('ramesh.kumar@fasalmitra.in');
                  if (onClose) onClose();
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#FEBA17]/15 hover:bg-[#FEBA17]/25 text-[#A67500] text-xs font-semibold border border-[#FEBA17]/40 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>⚡</span>
              <span>Launch Quick Demo (Ramesh Kumar Patel • Malihabad, Lucknow)</span>
            </button>

            {mode === 'register' && (
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2 px-3 rounded-xl bg-[#F9F3E6] hover:bg-[#FEBA17]/20 text-[#8A7E6B] hover:text-[#2D2A26] text-xs font-medium border border-[#E8DFD0] transition"
              >
                Auto-Fill Form Fields
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
