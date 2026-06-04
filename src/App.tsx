import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Layers, 
  PlusCircle, 
  ShieldCheck, 
  LogOut, 
  Key, 
  Mail, 
  Activity, 
  FileCode, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  Play, 
  Sparkles, 
  AlertCircle,
  Database,
  ArrowRight,
  UserCheck,
  Settings,
  Send,
  Bot,
  Terminal,
  HelpCircle,
  Trash2,
  Search,
  MapPin,
  Phone,
  ShoppingBag,
  Tag,
  ChevronDown,
  X,
  SlidersHorizontal,
  Edit3,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Merchant, PlanType, PricingPlan, MockCustomer, ExtractedOrder } from './types';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [secureAdminEmail, setSecureAdminEmail] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Application states
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'code' | 'plans'>('dashboard');
  const [postgresStatus, setPostgresStatus] = useState<{ connected: boolean; database?: string; message?: string } | null>(null);

  // Dynamic Plans States
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planFormName, setPlanFormName] = useState<string>('');
  const [planFormPrice, setPlanFormPrice] = useState<number>(2000);
  const [planFormLimit, setPlanFormLimit] = useState<number>(500);
  const [planFormFeaturesText, setPlanFormFeaturesText] = useState<string>('');

  // New Merchant form states
  const [newMerchantName, setNewMerchantName] = useState<string>('');
  const [newMerchantEmail, setNewMerchantEmail] = useState<string>('');
  const [newMerchantPlan, setNewMerchantPlan] = useState<PlanType>('Basic');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Playground / Sandbox state for selected merchant
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [botIdentity, setBotIdentity] = useState<string>('');
  const [facebookPageId, setFacebookPageId] = useState<string>('');
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Simulator states
  const [simulatedMessage, setSimulatedMessage] = useState<string>('');
  const [simulationTrace, setSimulationTrace] = useState<string[]>([]);
  const [simulatorReply, setSimulatorReply] = useState<string>('');
  const [isRealAIResponse, setIsRealAIResponse] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Notification states
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Localization and Merchant Role states
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [loginRole, setLoginRole] = useState<'admin' | 'merchant'>('merchant');
  const [merchantEmail, setMerchantEmail] = useState<string>('');
  const [merchantPassword, setMerchantPassword] = useState<string>('');
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState<boolean>(false);
  const [authenticatedMerchant, setAuthenticatedMerchant] = useState<Merchant | null>(null);
  const [merchantTab, setMerchantTab] = useState<'overview' | 'customers' | 'faqs' | 'settings'>('overview');
  const [customerSubTab, setCustomerSubTab] = useState<'chat' | 'orders'>('orders');
  
  // States for manual edit of extracted order details
  const [editingCustomer, setEditingCustomer] = useState<MockCustomer | null>(null);
  const [editOrderProduct, setEditOrderProduct] = useState<string>('');
  const [editOrderPhone, setEditOrderPhone] = useState<string>('');
  const [editOrderAddress, setEditOrderAddress] = useState<string>('');
  const [editOrderWilaya, setEditOrderWilaya] = useState<string>('');
  const [editOrderPieces, setEditOrderPieces] = useState<number>(1);
  const [editOrderSize, setEditOrderSize] = useState<string>('');
  const [editOrderTotalPrice, setEditOrderTotalPrice] = useState<number>(0);
  const [defaultUnitPrice, setDefaultUnitPrice] = useState<number>(3000);

  // States for sorting and filtering the customer orders table
  const [orderFilterWilaya, setOrderFilterWilaya] = useState<string>('all');
  const [orderSortBy, setOrderSortBy] = useState<'name' | 'totalPrice' | 'pieces'>('totalPrice');
  const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Merchant Payment Form States
  const [paymentFormMethod, setPaymentFormMethod] = useState<'ccp' | 'baridimob'>('ccp');
  const [paymentFormTxRef, setPaymentFormTxRef] = useState<string>('');
  const [paymentFormAmount, setPaymentFormAmount] = useState<number>(2000);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  // SignUp state variables
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpPlan, setSignUpPlan] = useState<'Basic' | 'Pro' | 'Premium'>('Basic');
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false);

  // FAQ States
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState<string>('');
  const [newFaqAnswer, setNewFaqAnswer] = useState<string>('');
  const [isFetchingFaqs, setIsFetchingFaqs] = useState<boolean>(false);
  const [isSavingFaq, setIsSavingFaq] = useState<boolean>(false);

  // Load FAQ list on authenticated merchant change
  useEffect(() => {
    if (authenticatedMerchant) {
      const fetchFaqs = async () => {
        setIsFetchingFaqs(true);
        try {
          const r = await fetch(`/api/merchant/${authenticatedMerchant.id}/faqs`);
          if (r.ok) {
            const data = await r.json();
            setFaqs(data);
          }
        } catch (err) {
          console.error("Error fetching FAQs:", err);
        } finally {
          setIsFetchingFaqs(false);
        }
      };
      fetchFaqs();
    }
  }, [authenticatedMerchant]);

  // Save new FAQ Question & Answer pair
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedMerchant || !newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    setIsSavingFaq(true);
    try {
      const response = await fetch(`/api/merchant/${authenticatedMerchant.id}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newFaqQuestion, answer: newFaqAnswer })
      });
      if (response.ok) {
        const addedFaq = await response.json();
        setFaqs(prev => [...prev, addedFaq]);
        setNewFaqQuestion('');
        setNewFaqAnswer('');
        showToast(lang === 'ar' ? 'تم إضافة السؤال الشائع بنجاح!' : 'FAQ question added successfully!');
      } else {
        const errData = await response.json();
        alert(errData.error || 'Failed to add FAQ');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setIsSavingFaq(false);
    }
  };

  // Delete an FAQ
  const handleDeleteFaq = async (faqId: string) => {
    if (!authenticatedMerchant) return;
    try {
      const response = await fetch(`/api/merchant/${authenticatedMerchant.id}/faqs/${faqId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setFaqs(prev => prev.filter(item => item.id !== faqId));
        showToast(lang === 'ar' ? 'تم حذف السؤال الشائع!' : 'FAQ deleted successfully!');
      } else {
        alert('Failed to delete FAQ');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  // Realistic mock customer lists for the Merchant dashboard
  const [merchantCustomers, setMerchantCustomers] = useState<MockCustomer[]>([]);

  const [activeCustomerId, setActiveCustomerId] = useState<string>('');
  const [manualMessageText, setManualMessageText] = useState<string>('');

  // Translations dictionary for full Arabic & English support
  const i18n = {
    ar: {
      appName: "منصة مسنجر الذكية",
      adminPortal: "مدير المنصة العام",
      merchantPortal: "لوحة تحكم المتجر والتاجر",
      secPhrase: "كلمة المرور الأمنية",
      proceed: "دخول آمن للمنصة",
      instantDemo: "رموز دخول فورية سريعة للتجربة",
      adminEmail: "بريد المسؤول العام",
      merchantEmail: "البريد الإلكتروني للتاجر",
      merchantPass: "كلمة المرور / Verify Token",
      logout: "تسجيل الخروج",
      overview: "نظرة عامة والتحليل",
      customers: "الزبائن والمحادثات",
      settings: "إعدادات البوت والربط",
      botIdentity: "هوية البوت ونبرة الرد للذكاء الاصطناعي",
      connectedPlatforms: "المنصات والقنوات المربوطة",
      saveChanges: "حفظ إعدادات الأتمتة",
      testBot: "ميدان تجربة الرد التلقائي",
      simulateText: "تجرية إرسال رسالة من زبون مباشر:",
      quickTestQ: "أسئلة شائعة جاهزة سريعة:",
      webhookUrl: "رابط بروتوكول الويب هوك (كوبي لمطورين فيسبوك)",
      verifyTokenTitle: "رمز التحقق السري الويب هوك الخاص بك (Verify Token)",
      copied: "تم النسخ!",
      saveSuccess: "تم حفظ هوية ونبرة الرد للبوت بنجاح!",
      allRights: "جميع الحقوق محفوظة لصالح منصة أتمتة مسنجر بالذكاء الاصطناعي © 2026",
      merchantStatus: "حالة حسابك",
      active: "نشط ومعتمد",
      suspended: "موقوف مؤقتاً",
      pending: "قيد المراجعة",
      planLevel: "باقة الاشتراك",
      totalMessages: "الرسائل المستهلكة المتبقية",
      customersCount: "إجمالي جهات الاتصال",
      manualReply: "إرسال رد مخصص يدوي للزبون",
      typeYourMessage: "اكتب رسالة الرد اليدوية هنا للتواصل...",
      send: "إرسال الرد",
      pausedManual: "الرد اليدوي نشط (البوت معطل مؤقتاً)",
      chatbotActiveStatus: "البوت مفعّل ونشط بالذكاء الاصطناعي",
      conversationHistory: "سجل حوار الزبون وتحليلات الذكاء الاصطناعي",
      noMessagesYet: "لا توجد رسائل سابقة في سجل هذا العميل",
      noCustomersFound: "لا يوجد عملاء حالياً",
      platformTitle: "تكامل مسنجر وإنستغرام وواتساب لدعم العملاء",
      copyLink: "نسخ رابط الربط",
      botDetailsDesc: "أدخل معلومات خدماتك، المنتجات، الأسعار، وأوقات العمل بالتفصيل ليقوم نظام Gemini AI بالرد الفوري الاحترافي على استفسارات زوار صفحتك.",
      orLoginWith: "أو الدخول بصفة:",
      adminAccount: "المسؤول العام",
      merchantPassDesc: "افتراضية Bella Boutique للتجربة الفورية:",
      metaInstructions: "خطوات تفعيل الويب هوك على فيسبوك للشركات (Meta Business Suite)",
      metaStep1: "1. قم بإنشاء تطبيق من نوع (Business) على منصة Facebook Developers.",
      metaStep2: "2. أضف منتج (Messenger) أو (Instagram Graph API) في القائمة الجانبية.",
      metaStep3: "3. اضغط على إعدادات الويب هوك (Webhooks Subscriptions)، والفت الرابط في الأسفل ووفر توكن التحقق السري.",
      metaStep4: "4. قم بتوجيه رسائل الزوار، وسيقوم نظامنا بتمريرها لنماذج Gemini AI والرد تلقائياً وبسرعة فائقة.",
      savePass: "تحديث رمز الدخول السري للمتجر الخاص بي",
      passwordField: "كلمة مرور الدخول الخاصة بالتاجر فقط",
      merchantSaved: "تم حفظ وتحديث الهوية وإعدادات الدخول بنجاح!",
      faqsTab: "مكتبة الأسئلة المتكررة (FAQs)",
      faqQuestionLabel: "السؤال المتكرر (أمثلة: متى تفتحون؟ هل المنتجات أصلية؟)",
      faqAnswerLabel: "الرد التلقائي المعتمد للبوت لهذه الحالة",
      faqAddBtn: "حفظ السؤال في مكتبة البوت",
      faqDeleteBtn: "حذف",
      faqNoItems: "لم تقم بإضافة أي أسئلة شائعة حتى الآن. سيتم توجيه جميع استفسارات العملاء مباشرة إلى ذكاء Gemini الاصطناعي.",
      faqCheckFirst: "تنبيه ذكي: عند استقبال رسالة من عميل على فيسبوك، يقوم النظام بالبحث في هذه القائمة أولاً، وإذا وجد تطابقاً فسيجيب فوراً بدون استهلاك رصيد رسائل Gemini الخاص بك! هذا يوفر باقة اشتراكك ويضمن إجابة دقيقة 100%.",
      faqTitle: "سجل الأسئلة الشائعة والردود الفورية",
      signUpBtn: "إنشاء حساب متجر جديد",
      signUpSwitch: "ليس لديك حساب للشركة؟ سجل متجرك الآن واشترك فوراً",
      loginSwitch: "لديك حساب للتاجر بالفعل؟ سجّل دخولك من هنا",
      merchantNameLabel: "اسم المتجر / العلامة التجارية",
      choosePlan: "اختر مستوى باقة الاشتراك لحسابك",
      registerSuccessMsg: "تم تسجيل وتأسيس حساب متجرك بنجاح! يمكنك الآن تسجيل الدخول مباشرة."
    },
    en: {
      appName: "Smart Messenger Platform",
      adminPortal: "SaaS Admin Control",
      merchantPortal: "Merchant Store Dashboard",
      secPhrase: "Security Keyphrase",
      proceed: "Secure Portal Login",
      instantDemo: "Instant Play Demo Mode Accounts",
      adminEmail: "Admin Officer Email",
      merchantEmail: "Merchant Email Address",
      merchantPass: "Password / Verify Token",
      logout: "Logout",
      overview: "Analytics Overview",
      customers: "Conversations & Contacts",
      settings: "Bot Setup & Integration",
      botIdentity: "A.I. Persona & Tone Instructions",
      connectedPlatforms: "Integrated Platforms & Webhooks",
      saveChanges: "Save Bot Rules",
      testBot: "Conversational Playground",
      simulateText: "Simulate WhatsApp / FB Message:",
      quickTestQ: "Preset Test Inquiries:",
      webhookUrl: "Your Secure Webhook Callback URL",
      verifyTokenTitle: "Your Gateway Verify Token",
      copied: "Copied!",
      saveSuccess: "Saved store A.I. rules and config successfully!",
      allRights: "AI Messenger Automated CRM Gateway © 2026",
      merchantStatus: "Store Status",
      active: "Active Verified",
      suspended: "Suspended",
      pending: "Pending Approval",
      planLevel: "Subscription Model Plan",
      totalMessages: "Consumed Bot Messages",
      customersCount: "B2C Active Clients",
      manualReply: "Send Manual Customer Reply",
      typeYourMessage: "Type manual message to client...",
      send: "Send Message",
      pausedManual: "Manual Control (A.I. Bot Paused)",
      chatbotActiveStatus: "A.I. Auto-responder Active",
      conversationHistory: "B2C Conversation Logs & Event Feed",
      noMessagesYet: "No conversation history logged for this client.",
      noCustomersFound: "No active clients registered in database.",
      platformTitle: "Integrate Messenger, Instagram & WhatsApp API Channels",
      copyLink: "Copy Parameter",
      botDetailsDesc: "Detail your pricing list, discounts, store policies, or café menu items. Gemini AI utilizes these instructions to construct accurate friendly replies.",
      orLoginWith: "Switch login persona to:",
      adminAccount: "Platform Administrator",
      merchantPassDesc: "Bella Boutique demo credentials:",
      metaInstructions: "Facebook / Meta Messenger Webhook Registration Guidelines",
      metaStep1: "1. Create a modern Developer App on Meta Developers Console.",
      metaStep2: "2. Set up Messenger or Instagram Product in your Dashboard.",
      metaStep3: "3. Subscribe to Webhook, enter the callback endpoint and verification key shown below.",
      metaStep4: "4. Toggle on messages subscriptions. Messages will be automatically routed to Gemini free tier and replied in real-time.",
      savePass: "Update Merchant Configuration Keys",
      passwordField: "Private Merchant Login Password",
      merchantSaved: "Successfully synchronized bot rules and login passwords!",
      faqsTab: "FAQ Library Database",
      faqQuestionLabel: "Customer Inquiry Question Phrase",
      faqAnswerLabel: "Approved Auto-responder Text Reply",
      faqAddBtn: "Add to FAQ Library",
      faqDeleteBtn: "Delete",
      faqNoItems: "No custom FAQ entries added yet. Auto-responder will route all inquiries directly through Google Gemini generative AI.",
      faqCheckFirst: "Smart Optimization: The webhook scanner parses this catalog first. If a matched question is identified, the bot delivers the response instantly without prompting Gemini API. This conserves your monthly quota!",
      faqTitle: "Instant Bot Response Guardrails & FAQs",
      signUpBtn: "Register New Store Account",
      signUpSwitch: "Don't have a merchant account? Sign up now!",
      loginSwitch: "Already registered your store? Access your dashboard",
      merchantNameLabel: "Store / Brand Name",
      choosePlan: "Select Subscription Service Plan",
      registerSuccessMsg: "Merchant account registered successfully! You can now log in safely."
    }
  };

  // Codes for FastAPI Step 2
  const pythonMainCode = `import os
import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt

# Import free google-genai SDK for auto-reply logic
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# --- CONFIGURATION ---
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/chatbot_saas")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_key_for_jwt_saas_platform_change_me_in_production")
ALGORITHM = "HS256"

# --- DATABASE SETUP ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SECURITY ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/admin/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- SQLALCHEMY MODELS ---
class AdminDB(Base):
    __tablename__ = "admins"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class MerchantDB(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    plan = Column(String, default="Basic")
    status = Column(String, default="active")
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Core Step 2 Webhook Columns
    bot_identity = Column(String, nullable=True)
    facebook_page_id = Column(String, nullable=True, unique=True)
    verify_token = Column(String, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS ---
class MerchantCreateSchema(BaseModel):
    name: str
    email: EmailStr
    plan: Optional[str] = "Basic"
    status: Optional[str] = "active"

class MerchantResponseSchema(BaseModel):
    id: str
    name: str
    email: EmailStr
    plan: str
    status: str
    message_count: int
    created_at: datetime
    bot_identity: Optional[str] = None
    facebook_page_id: Optional[str] = None
    verify_token: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AdminCreateSchema(BaseModel):
    email: EmailStr
    password: str

# --- APP INITIALIZATION ---
app = FastAPI(title="Messenger AI Chatbot SaaS Backend", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_gemini_response(prompt: str, system_prompt: str) -> str:
    """Helper to query the Gemini API via standard google-genai library"""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Offline default message: Thank you for messaging us! [Set GEMINI_API_KEY in Repl secrets]"
    if not GEMINI_AVAILABLE:
        return "SaaS message: Automated reply from boutique assistant."
        
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt
            )
        )
        return response.text or "Thank you for reaching out!"
    except Exception as e:
        return f"Thanks for visiting! We will reply shortly. (Code: {str(e)})"

# --- META WEBHOOK SECURITY & EVENT HANDLING ---

@app.get("/api/webhook")
def verify_meta_webhook(
    hub_mode: Optional[str] = None,
    hub_verify_token: Optional[str] = None,
    hub_challenge: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Verifies your Meta Webhook registration token"""
    if hub_mode == "subscribe" and hub_verify_token:
        matched = db.query(MerchantDB).filter(MerchantDB.verify_token == hub_verify_token).first()
        if matched:
            return hub_challenge
    raise HTTPException(status_code=403, detail="Verify token mismatch or invalid mode")

@app.post("/api/webhook")
async def receive_meta_webhook(payload: dict, db: Session = Depends(get_db)):
    """Receives incoming customer messages from Meta servers, resolves profiles, issues Gemini automated reply"""
    if payload.get("object") == "page":
        for entry in payload.get("entry", []):
            page_id = entry.get("id")
            messaging = entry.get("messaging", [])
            
            # Resolve store configuration from page_id
            merchant = db.query(MerchantDB).filter(MerchantDB.facebook_page_id == page_id).first()
            if not merchant or merchant.status != "active":
                continue
                
            for event in messaging:
                if "message" in event and "text" in event["message"]:
                    sender_id = event["sender"]["id"]
                    msg_text = event["message"]["text"]
                    
                    sys_prompt = merchant.bot_identity or "Be a helpful friendly helper."
                    reply = get_gemini_response(prompt=msg_text, system_prompt=sys_prompt)
                    
                    # Log or forward back to Meta API
                    merchant.message_count += 1
                    print(f"[REPLY SENT TO {sender_id}]: {reply}")
                    
        db.commit()
        return "EVENT_RECEIVED"
    raise HTTPException(status_code=404)
`;

  const pythonRequirementsCode = `fastapi>=0.110.0
uvicorn>=0.28.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.9
passlib[bcrypt]>=1.7.4
python-jose[cryptography]>=3.3.0
pydantic[email]>=2.6.0
pydantic-settings>=2.2.0
python-multipart>=0.0.9
google-genai>=0.1.1`;

  const fetchPostgresStatus = async () => {
    try {
      const resp = await fetch('/api/db-status');
      if (resp.ok) {
        const data = await resp.json();
        setPostgresStatus({
          connected: data.connected,
          database: data.database,
          message: data.message
        });
      }
    } catch (e) {
      console.error("Error fetching db status:", e);
    }
  };

  // Check login state on mount
  useEffect(() => {
    fetchPostgresStatus();
    const savedToken = localStorage.getItem('adminToken');
    const savedEmail = localStorage.getItem('adminEmail');
    const savedMToken = localStorage.getItem('merchantToken');
    const savedMID = localStorage.getItem('merchantId');

    if (savedToken && savedEmail) {
      setIsAuthenticated(true);
      setAdminEmail(savedEmail);
      fetchMerchants();
    } else if (savedMToken && savedMID) {
      const fetchMProfile = async () => {
        setIsLoading(true);
        try {
          const r = await fetch('/api/admin/merchants');
          if (r.ok) {
            const list: Merchant[] = await r.json();
            const found = list.find((m: Merchant) => m.id === savedMID);
            if (found && found.status === 'active') {
              setAuthenticatedMerchant(found);
              setIsMerchantAuthenticated(true);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMProfile();
    } else {
      fetchPlans();
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const resp = await fetch('/api/admin/plans');
      if (resp.ok) {
        const data = await resp.json();
        setPlans(data);
      }
    } catch (err) {
      console.error("Error fetching dynamic plans:", err);
    }
  };

  // Save or update pricing plan
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormName.trim()) return;

    setIsSavingPlan(true);
    const features = planFormFeaturesText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload = {
      name: planFormName,
      priceDZD: Number(planFormPrice),
      messageLimit: Number(planFormLimit),
      features
    };

    try {
      let r;
      if (editingPlanId) {
        r = await fetch(`/api/admin/plans/${editingPlanId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        r = await fetch('/api/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (r.ok) {
        showToast(lang === 'ar' ? 'تم حفظ الخطة بنجاح!' : 'Plan saved successfully!');
        setEditingPlanId(null);
        setPlanFormName('');
        setPlanFormPrice(2000);
        setPlanFormLimit(500);
        setPlanFormFeaturesText('');
        fetchPlans();
        fetchMerchants(); // Refresh merchant lists with new plans
      } else {
        const data = await r.json();
        alert(data.error || 'Failed to save plan');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الخطة؟' : 'Are you sure you want to delete this plan?')) return;
    try {
      const r = await fetch(`/api/admin/plans/${id}`, {
        method: 'DELETE'
      });
      if (r.ok) {
        showToast(lang === 'ar' ? 'تم حذف الخطة!' : 'Plan deleted successfully!');
        fetchPlans();
        fetchMerchants();
      } else {
        const data = await r.json();
        alert(data.error || 'Failed to delete plan');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting plan');
    }
  };

  // Fetch from the Express local full-stack server
  const fetchMerchants = async (triggerSelectId?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/admin/merchants');
      if (!resp.ok) throw new Error('Failed to retrieve merchants list');
      const data = await resp.json();
      setMerchants(data);
      
      // Also fetch dynamic plans alongside
      fetchPlans();
      
      // Keep or update selected merchant reference
      if (triggerSelectId) {
        const found = data.find((m: Merchant) => m.id === triggerSelectId);
        if (found) selectMerchantProfile(found);
      } else if (data.length > 0 && !selectedMerchant) {
        selectMerchantProfile(data[0]);
      } else if (selectedMerchant) {
        const current = data.find((m: Merchant) => m.id === selectedMerchant.id);
        if (current) selectMerchantProfile(current);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading merchants database. Please verify backend state.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectMerchantProfile = (m: Merchant) => {
    setSelectedMerchant(m);
    setBotIdentity(m.botIdentity || '');
    setFacebookPageId(m.facebookPageId || '');
    setVerifyToken(m.verifyToken || '');
    // Reset simulation output
    setSimulatorReply('');
    setSimulationTrace([]);
  };

  // Perform role-aware login action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      if (loginRole === 'admin') {
        const resp = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, password })
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Invalid administrator keyphrase');
        }

        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminEmail', data.admin.email);
        setIsAuthenticated(true);
        fetchMerchants();
      } else {
        // Merchant portal login gateway
        const resp = await fetch('/api/merchant/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: merchantEmail, password })
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Failed merchant login check');
        }

        localStorage.setItem('merchantToken', data.token);
        localStorage.setItem('merchantId', data.merchant.id);
        setAuthenticatedMerchant(data.merchant);
        setIsMerchantAuthenticated(true);
        showToast(lang === 'ar' ? 'مرحباً بك مجدداً في لوحة تحكم متجرك!' : 'Welcome back to your store dashboard!');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Perform merchant sign up action
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSigningUp(true);

    try {
      const resp = await fetch('/api/merchant/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
          plan: signUpPlan
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to register merchant account');
      }

      showToast(i18n[lang].registerSuccessMsg);
      // Automatically prefill login fields to make signing in trivial
      setMerchantEmail(signUpEmail);
      setPassword(signUpPassword);
      setIsSignUpMode(false);
      // Clear signup fields
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpPlan('Basic');
    } catch (err: any) {
      setLoginError(err.message || 'Registration failed');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('merchantId');
    setIsAuthenticated(false);
    setIsMerchantAuthenticated(false);
    setAuthenticatedMerchant(null);
    setSelectedMerchant(null);
    setAdminEmail('');
    setMerchantEmail('');
    setPassword('');
  };

  // Preset demo fillers
  const fillDemoCreds = () => {
    if (loginRole === 'admin') {
      setAdminEmail('admin@chatbot.com');
      setPassword('admin123');
    } else {
      setMerchantEmail('bella@boutique.com');
      setPassword('password123'); // Preset default password
    }
    setLoginError(null);
  };

  // Save changes to custom bot configuration for currently authenticated merchant
  const handleSaveMerchantConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedMerchant) return;

    setIsSavingConfig(true);
    try {
      const resp = await fetch(`/api/merchant/${authenticatedMerchant.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botIdentity,
          facebookPageId,
          verifyToken,
          password: merchantPassword || undefined
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed updating metadata values');
      }

      const resJson = await resp.json();
      setAuthenticatedMerchant(resJson.merchant);
      showToast(lang === 'ar' ? 'تم حفظ التعديلات وتحديث هوية ربط المتجر بنجاح!' : 'Successfully saved your custom store integration keys!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Algerian Dialect Heuristic NLP Parser for extracting Customer Orders
  const extractOrderFromCustomer = (cust: MockCustomer, unitPrice: number): ExtractedOrder => {
    // Combine all messages from customer to seek order signals
    const customerTexts = cust.messages
      .filter(m => m.sender === 'customer')
      .map(m => m.text)
      .join(' ');

    // Heuristic 1: Algerian Mobile Phone format detection (05xx, 06xx, 07xx, +213, etc.)
    const phoneRegex = /(05|06|07)[0-9\s-]{8,11}/g;
    const phoneMatches = customerTexts.match(phoneRegex);
    let extractedPhone = '';
    if (phoneMatches && phoneMatches.length > 0) {
      extractedPhone = phoneMatches[0].replace(/[\s-]/g, '').trim();
    } else {
      extractedPhone = cust.phoneOrUsername || 'غير مسجل';
    }

    // Heuristic 2: Wilaya (Algerian State) lookup (58 States)
    const algerianWilayas = [
      { id: '01', name: 'أدرار', fr: 'Adrar' },
      { id: '02', name: 'الشلف', fr: 'Chlef' },
      { id: '03', name: 'الأغواط', fr: 'Laghouat' },
      { id: '04', name: 'أم البواقي', fr: 'Oum El Bouaghi' },
      { id: '05', name: 'باتنة', fr: 'Batna' },
      { id: '06', name: 'بجاية', fr: 'Bejaia' },
      { id: '07', name: 'بسكرة', fr: 'Biskra' },
      { id: '08', name: 'بشار', fr: 'Bechar' },
      { id: '09', name: 'البليدة', fr: 'Blida' },
      { id: '10', name: 'البويرة', fr: 'Bouira' },
      { id: '11', name: 'تمنراست', fr: 'Tamanrasset' },
      { id: '12', name: 'تبسة', fr: 'Tebessa' },
      { id: '13', name: 'تلمسان', fr: 'Tlemcen' },
      { id: '14', name: 'تيارت', fr: 'Tiaret' },
      { id: '15', name: 'تيزي وزو', fr: 'Tizi Ouzou' },
      { id: '16', name: 'الجزائر', fr: 'Alger' },
      { id: '17', name: 'الجلفة', fr: 'Djelfa' },
      { id: '18', name: 'جيجل', fr: 'Jijel' },
      { id: '19', name: 'سطيف', fr: 'Setif' },
      { id: '20', name: 'سعيدة', fr: 'Saida' },
      { id: '21', name: 'سكيكدة', fr: 'Skikda' },
      { id: '22', name: 'سيدي بلعباس', fr: 'Sidi Bel Abbes' },
      { id: '23', name: 'عنابة', fr: 'Annaba' },
      { id: '24', name: 'قالمة', fr: 'Guelma' },
      { id: '25', name: 'قسنطينة', fr: 'Constantine' },
      { id: '26', name: 'المدية', fr: 'Medea' },
      { id: '27', name: 'مستغانم', fr: 'Mostaganem' },
      { id: '28', name: 'المسيلة', fr: 'MSila' },
      { id: '29', name: 'معسكر', fr: 'Mascara' },
      { id: '30', name: 'ورقلة', fr: 'Ouargla' },
      { id: '31', name: 'وهران', fr: 'Oran' },
      { id: '32', name: 'البيض', fr: 'El Bayadh' },
      { id: '33', name: 'إليزي', fr: 'Illizi' },
      { id: '34', name: 'برج بوعريريج', fr: 'Bordj Bou Arreridj' },
      { id: '35', name: 'بومرداس', fr: 'Boumerdes' },
      { id: '36', name: 'الطارف', fr: 'El Tarf' },
      { id: '37', name: 'تندوف', fr: 'Tindouf' },
      { id: '38', name: 'تيسمسيلت', fr: 'Tissemsilt' },
      { id: '39', name: 'الوادي', fr: 'El Oued' },
      { id: '40', name: 'خنشلة', fr: 'Khenchela' },
      { id: '41', name: 'سوق أهراس', fr: 'Souk Ahras' },
      { id: '42', name: 'تيبازة', fr: 'Tipaza' },
      { id: '43', name: 'ميلة', fr: 'Mila' },
      { id: '44', name: 'عين الدفلى', fr: 'Ain Defla' },
      { id: '45', name: 'النعامة', fr: 'Naama' },
      { id: '46', name: 'عين تموشنت', fr: 'Ain Temouchent' },
      { id: '47', name: 'غرداية', fr: 'Ghardaia' },
      { id: '48', name: 'غليزان', fr: 'Relizane' }
    ];

    let extractedWilaya = 'غير منصوصة';
    for (const w of algerianWilayas) {
      if (customerTexts.includes(w.name) || customerTexts.toLowerCase().includes(w.fr.toLowerCase())) {
        extractedWilaya = `${w.id} - ${w.name}`;
        break;
      }
    }

    // Heuristic 3: Pieces / Quantity extraction
    let pieces = 1;
    const piecesRegexes = [
      /(\d+)\s*(حبة|قطعة|حبات|قطع|قطعات|pieces|piece|pcs|items)/i,
      /(حبة|قطعة|زوج حبات|قطعتين|زوج قطع|ثلاث حبات|ثلاث قطع)/i
    ];
    
    const piecesMatchVal = customerTexts.match(piecesRegexes[0]);
    if (piecesMatchVal) {
      pieces = parseInt(piecesMatchVal[1], 10);
    } else {
      if (customerTexts.includes('زوج قطع') || customerTexts.includes('قطعتين') || customerTexts.includes('زوج حبات')) {
        pieces = 2;
      } else if (customerTexts.includes('ثلاث حبات') || customerTexts.includes('ثلاث قطع')) {
        pieces = 3;
      } else if (customerTexts.includes('أربع حبات') || customerTexts.includes('أربع قطع') || customerTexts.includes('اربع')) {
        pieces = 4;
      }
    }

    // Heuristic 4: Size detection (M, L, XL, XXL, 38, 40, 42, 44 etc.)
    let size = 'M';
    const sizeMatch = customerTexts.match(/\b(M|L|S|XL|XXS|XXL|XXXL|38|39|40|41|42|43|44|45)\b/i);
    if (sizeMatch) {
      size = sizeMatch[0].toUpperCase();
    }

    // Heuristic 5: Product designation
    let productProduct = 'طلب تجاري';
    const apparelWords = [
      'حذاء', 'سباط', 'فستان', 'قميص', 'سروال', 'تيشرت', 'بلوزة', 'حجاب', 'عباية', 'جلباب', 'حقيبة', 'كوسميتيك', 'عطر',
      'سرير', 'طاولة', 'خاتم', 'مجوهرات'
    ];
    for (const word of apparelWords) {
      if (customerTexts.includes(word)) {
        productProduct = word;
        const iIdx = customerTexts.indexOf(word);
        const subStr = customerTexts.slice(iIdx, iIdx + 20).trim();
        if (subStr.length > word.length) {
          productProduct = subStr;
        }
        break;
      }
    }

    // Deduce Total Price calculated by bot
    const totalPrice = pieces * unitPrice;

    return {
      product: productProduct,
      phone: extractedPhone,
      address: customerTexts.includes('العنوان') || customerTexts.includes('حي') || customerTexts.includes('نهج') || customerTexts.includes('شارع')
        ? customerTexts.replace(/.*\b(العنوان|حي|نهج|شارع|في)\s*:/i, '').slice(0, 32).trim()
        : 'حي وسط المدينة العريق',
      wilaya: extractedWilaya,
      pieces,
      size,
      totalPrice
    };
  };

  const handleAutoExtractCustomer = (custId: string) => {
    setMerchantCustomers(prev => prev.map(c => {
      if (c.id === custId) {
        const extracted = extractOrderFromCustomer(c, defaultUnitPrice);
        return {
          ...c,
          extractedOrder: extracted
        };
      }
      return c;
    }));
    showToast(lang === 'ar' ? 'تم إعادة استخلاص تفاصيل الطلب بالذكاء الاصطناعي!' : 'Successfully recalculated extracted order facts!');
  };

  const startEditOrder = (cust: MockCustomer) => {
    setEditingCustomer(cust);
    const ord = cust.extractedOrder || {
      product: 'فستان جديد',
      phone: cust.phoneOrUsername || '',
      address: 'حي الشهداء الوسط',
      wilaya: '16 - الجزائر',
      pieces: 1,
      size: 'M',
      totalPrice: defaultUnitPrice
    };
    setEditOrderProduct(ord.product);
    setEditOrderPhone(ord.phone);
    setEditOrderAddress(ord.address);
    setEditOrderWilaya(ord.wilaya);
    setEditOrderPieces(ord.pieces);
    setEditOrderSize(ord.size);
    setEditOrderTotalPrice(ord.totalPrice || (ord.pieces * defaultUnitPrice));
  };

  const handleSaveManualOrderEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setMerchantCustomers(prev => prev.map(c => {
      if (c.id === editingCustomer.id) {
        return {
          ...c,
          extractedOrder: {
            product: editOrderProduct,
            phone: editOrderPhone,
            address: editOrderAddress,
            wilaya: editOrderWilaya,
            pieces: editOrderPieces,
            size: editOrderSize,
            totalPrice: editOrderTotalPrice
          }
        };
      }
      return c;
    }));

    setEditingCustomer(null);
    showToast(lang === 'ar' ? 'تم حفظ تعديلات الطلبية للزبون يدوياً بنجاح!' : 'Customer order overrides saved manually!');
  };

  // Dispatch manual override message for selected customer in live chat tab
  const handleSendManualMessage = () => {
    if (!manualMessageText.trim()) return;
    
    setMerchantCustomers(prev => prev.map(c => {
      if (c.id === activeCustomerId) {
        const now = new Date();
        const timestampStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        return {
          ...c,
          lastMessage: manualMessageText,
          lastTime: lang === 'ar' ? 'الآن' : 'Just now',
          messages: [
            ...c.messages,
            { sender: 'merchant' as any, text: manualMessageText, timestamp: timestampStr }
          ]
        };
      }
      return c;
    }));
    
    setManualMessageText('');
    showToast(lang === 'ar' ? 'تم إرسال رسالتك اليدوية للزبون بنجاح!' : 'Manual reply successfully appended and dispatched!');
  };

  // Toggle A.I. autopilot for a specific customer trace row
  const toggleCustomerChatbotStatus = (customerId: string) => {
    setMerchantCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const targetStatus = c.status === 'chatbot_active' ? 'paused_manual' : 'chatbot_active';
        showToast(lang === 'ar' 
          ? (targetStatus === 'chatbot_active' ? 'تم تفعيل الرد التلقائي للبوت بنجاح!' : 'تم تعطيل البوت! التحكم الآن يدوي بالكامل.')
          : (targetStatus === 'chatbot_active' ? 'A.I. Autopilot enabled for client!' : 'A.I. Autopilot paused. Manual mode active.'));
        return {
          ...c,
          status: targetStatus as any
        };
      }
      return c;
    }));
  };

  // Add a new Merchant
  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName || !newMerchantEmail) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const resp = await fetch('/api/admin/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMerchantName,
          email: newMerchantEmail,
          plan: newMerchantPlan
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Could not register merchant');

      setSuccessNotice(`Merchant "${newMerchantName}" enrolled under "${newMerchantPlan}" plan! Setup generated credentials.`);
      // Reset form
      setNewMerchantName('');
      setNewMerchantEmail('');
      setNewMerchantPlan('Basic');
      setShowAddModal(false);
      
      // Reload and auto select new item
      fetchMerchants(data.id);
      
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not verify merchant registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign corresponding merchant Tier Plan
  const handleUpdatePlan = async (merchantId: string, newPlan: PlanType) => {
    try {
      const resp = await fetch(`/api/admin/merchants/${merchantId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed updating plan tier');
      }
      
      const updated = await resp.json();
      setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, plan: updated.plan } : m));
      showToast(`Assigned ${newPlan} subscription model!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save changes to custom bot configuration (Identity Prompt, Meta Page IDs)
  const handleSaveBotConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;

    setIsSavingConfig(true);
    try {
      const resp = await fetch(`/api/admin/merchants/${selectedMerchant.id}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botIdentity,
          facebookPageId,
          verifyToken
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed updating bot configuration');
      }

      const updated = await resp.json();
      setMerchants(prev => prev.map(m => m.id === selectedMerchant.id ? updated : m));
      setSelectedMerchant(updated);
      showToast(`Successfully saved ${updated.name}'s custom AI identity!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleGrantTrial = async (merchantId: string, days: number) => {
    try {
      const resp = await fetch(`/api/admin/merchants/${merchantId}/trial`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to grant trial period');
      }
      const updated = await resp.json();
      setMerchants(prev => prev.map(m => m.id === merchantId ? updated : m));
      if (selectedMerchant?.id === merchantId) setSelectedMerchant(updated);
      showToast(Number(days) === 0 ? 'Trial period reset/ended!' : `Granted ${days} days free trial 🇩🇿!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleConfirmPayment = async (merchantId: string, action: 'approve' | 'reject') => {
    try {
      const resp = await fetch(`/api/admin/merchants/${merchantId}/confirm-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to update payment status');
      }
      const updated = await resp.json();
      setMerchants(prev => prev.map(m => m.id === merchantId ? updated : m));
      if (selectedMerchant?.id === merchantId) setSelectedMerchant(updated);
      showToast(action === 'approve' ? 'Payment confirmed manually! Store account activated 🇩🇿' : 'Payment rejected successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMerchantSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedMerchant || !paymentFormTxRef.trim()) return;

    setIsSubmittingPayment(true);
    try {
      const resp = await fetch(`/api/merchant/${authenticatedMerchant.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: paymentFormMethod,
          paymentTxRef: paymentFormTxRef,
          paymentAmount: paymentFormAmount
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Failed to submit payment details');
      }

      const resJson = await resp.json();
      setAuthenticatedMerchant(resJson.merchant);
      setPaymentFormTxRef('');
      showToast(lang === 'ar' ? 'تم تقديم طلب الدفع بنجاح ويرجى الانتظار لتأكيد الإدارة!' : 'Payment details submitted successfully for manual admin confirmation!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };
  const toggleStatus = async (merchantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const resp = await fetch(`/api/admin/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!resp.ok) throw new Error('Status configuration error');

      setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, status: nextStatus as any } : m));
      
      if (selectedMerchant && selectedMerchant.id === merchantId) {
        setSelectedMerchant(prev => prev ? { ...prev, status: nextStatus as any } : null);
      }
      
      showToast(`Merchant account is now ${nextStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Trigger Step 2 Webhook Simulation
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant || !simulatedMessage.trim()) return;

    setIsSimulating(true);
    setSimulationTrace([]);
    setSimulatorReply('');

    try {
      const resp = await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: selectedMerchant.id,
          messageText: simulatedMessage,
          senderId: `cust_fb_id_${Math.floor(Math.random() * 89999 + 10000)}`
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Simulation error');
      }

      setSimulationTrace(data.trace || []);
      setSimulatorReply(data.botReply || '');
      setIsRealAIResponse(data.isRealAI || false);
      
      // Update local message metrics representing DB increments
      setMerchants(prev => 
        prev.map(m => m.id === selectedMerchant.id ? { ...m, messageCount: data.merchant.messageCount } : m)
      );
      setSelectedMerchant(data.merchant);

      showToast("Messenger Webhook processed auto-reply!");
    } catch (err: any) {
      alert(err.message || 'Simulator failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Quick prepended test questions helper
  const insertQuickText = (text: string) => {
    setSimulatedMessage(text);
  };

  const showToast = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const copyToClipboard = (text: string, filename: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Compute summary stats dynamically
  const totalMessageCount = merchants.reduce((sum, m) => sum + m.messageCount, 0);
  const activeCount = merchants.filter(m => m.status === 'active').length;
  const basicCount = merchants.filter(m => m.plan === 'Basic').length;
  const proCount = merchants.filter(m => m.plan === 'Pro').length;
  const premiumCount = merchants.filter(m => m.plan === 'Premium').length;

  return (
    <div id="root-portal" className="min-h-screen bg-[#070708] text-neutral-100 font-sans selection:bg-neutral-800 selection:text-white antialiased">
      
      {/* Toast popup */}
      <AnimatePresence>
        {successNotice && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0d0d11] border border-neutral-800/80 text-neutral-50 px-4.5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 max-w-sm"
          >
            <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wide">{successNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated && !isMerchantAuthenticated ? (
        // BILINGUAL DUAL-ROLE LOGIN PAGE
        <div id="login-layout" className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-radial from-neutral-900 via-[#070708] to-[#070708]">
          <div className="absolute top-0 left-0 right-0 h-[100%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
          
          {/* FLOATING LANGUAGE SELECTOR */}
          <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${lang === 'ar' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              عربي
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${lang === 'en' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              EN
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-6 z-10"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(255,255,255,0.04)] animate-pulse">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                {i18n[lang].appName}
              </h2>
              <p className="mt-1 text-[11px] text-neutral-450 uppercase tracking-widest">
                Meta Conversational Chatbots & Gemini AI
              </p>
            </div>

            <div className="bg-[#0e0e12] border border-neutral-800/70 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-900 via-neutral-800 to-emerald-900" />
              
              {/* ROLE SELECTION TABS */}
              <div className="grid grid-cols-2 gap-2 bg-[#070708] p-1.5 rounded-xl border border-neutral-800/55 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('merchant');
                    setLoginError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${loginRole === 'merchant' ? 'bg-[#181822] text-white border border-neutral-800/60' : 'text-neutral-400 hover:text-white'}`}
                >
                  {i18n[lang].merchantPortal}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole('admin');
                    setLoginError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${loginRole === 'admin' ? 'bg-[#181822] text-white border border-neutral-800/60' : 'text-neutral-400 hover:text-white'}`}
                >
                  {i18n[lang].adminPortal}
                </button>
              </div>

              {loginRole === 'merchant' && isSignUpMode ? (
                // MERCHANT REGISTER / SIGNUP FORM
                <form className="space-y-4 animate-fadeIn" onSubmit={handleSignUp}>
                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-rose-950/40 border border-rose-900/40 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{loginError}</span>
                    </motion.div>
                  )}

                  {/* Brand / Merchant Name */}
                  <div>
                    <label htmlFor="signUpName" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                      {i18n[lang].merchantNameLabel}
                    </label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                        <Bot className="h-4 w-4" />
                      </span>
                      <input
                        id="signUpName"
                        type="text"
                        required
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder={lang === 'ar' ? 'أمثلة: متجر بيلا للملابس' : 'e.g. Bella Boutique'}
                        className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                      />
                    </div>
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label htmlFor="signUpEmail" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                      {i18n[lang].merchantEmail}
                    </label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        id="signUpEmail"
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="owner@boutique.com"
                        className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                      />
                    </div>
                  </div>

                  {/* Login Password */}
                  <div>
                    <label htmlFor="signUpPassword" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                      {i18n[lang].passwordField}
                    </label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        id="signUpPassword"
                        type="password"
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                      />
                    </div>
                  </div>

                  {/* Plan selector block */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-2">
                      {i18n[lang].choosePlan}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Basic', 'Pro', 'Premium'] as PlanType[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSignUpPlan(p)}
                          className={`p-2.5 border rounded-xl text-center flex flex-col items-center justify-center transition cursor-pointer ${
                            signUpPlan === p 
                              ? 'bg-emerald-950/20 border-emerald-500/80 text-white' 
                              : 'bg-[#070708] border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-wider uppercase">{p}</span>
                          <span className="text-[9px] text-neutral-500 mt-0.5 font-mono">
                            {p === 'Basic' ? '1K msgs' : p === 'Pro' ? '10K msgs' : 'Unlimited'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-emerald-400 text-black text-xs font-bold tracking-wider transition hover:bg-emerald-350 disabled:bg-neutral-800 disabled:text-neutral-500 shadow-lg cursor-pointer gap-2 mt-4"
                  >
                    {isSigningUp ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        <span>{i18n[lang].signUpBtn}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUpMode(false);
                        setLoginError(null);
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white transition underline underline-offset-4 cursor-pointer"
                    >
                      {i18n[lang].loginSwitch}
                    </button>
                  </div>
                </form>
              ) : (
                // STANDARD LOGIN FORM (ADMINS AND MERCHANTS)
                <form className="space-y-5" onSubmit={handleLogin}>
                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-rose-950/40 border border-rose-900/40 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{loginError}</span>
                    </motion.div>
                  )}

                  {loginRole === 'admin' ? (
                    // ADMIN EMAIL INPUTS
                    <div>
                      <label htmlFor="email" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 flex justify-between items-center">
                        <span>{i18n[lang].adminEmail}</span>
                        <button
                          type="button"
                          onClick={() => setSecureAdminEmail(!secureAdminEmail)}
                          className="text-[10px] text-neutral-500 hover:text-white transition flex items-center gap-1 font-semibold border border-neutral-800/60 px-2 py-0.5 rounded cursor-pointer"
                        >
                          {secureAdminEmail ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{secureAdminEmail ? (lang === 'ar' ? 'إظهار' : 'Show') : (lang === 'ar' ? 'إخفاء' : 'Hide')}</span>
                        </button>
                      </label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          id="email"
                          type={secureAdminEmail ? "password" : "email"}
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder={secureAdminEmail ? "•••••••••••••••••" : "admin@yourdomain.com"}
                          className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                        />
                      </div>
                    </div>
                  ) : (
                    // MERCHANT EMAIL INPUTS
                    <div>
                      <label htmlFor="merchantEmail" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                        {i18n[lang].merchantEmail}
                      </label>
                      <div className="relative">
                        <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          id="merchantEmail"
                          type="email"
                          required
                          value={merchantEmail}
                          onChange={(e) => setMerchantEmail(e.target.value)}
                          placeholder="merchant@example.com"
                          className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="block text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                      {loginRole === 'admin' ? i18n[lang].secPhrase : i18n[lang].merchantPass}
                    </label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-neutral-500`}>
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`block w-full ${lang === 'ar' ? 'pr-10' : 'pl-10'} pr-4 py-2.5 bg-[#070708] border border-neutral-800/80 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-[#070708] text-xs font-bold tracking-wider transition shadow-lg cursor-pointer"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-neutral-950" />
                    ) : (
                      i18n[lang].proceed
                    )}
                  </button>

                  {loginRole === 'merchant' && (
                    <div className="text-center mt-4 border-t border-neutral-900/60 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUpMode(true);
                          setLoginError(null);
                        }}
                        className="text-[11px] text-neutral-400 hover:text-white transition underline underline-offset-4 cursor-pointer"
                      >
                        {i18n[lang].signUpSwitch}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

            <div className="text-center text-neutral-600 text-[9px] select-none tracking-widest uppercase">
              Free Hosting • Python Fastapi Backends • Neon PostgreSQL Models
            </div>
          </motion.div>
        </div>
      ) : isMerchantAuthenticated && authenticatedMerchant ? (
        // ==========================================
        // --- AUTHENTICATED MERCHANT DASHBOARD -----
        // ==========================================
        <div id="merchant-dashboard-layout" className="min-h-screen flex flex-col bg-[#070708]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* HEADER BAR */}
          <header className="border-b border-[#14141a] bg-[#070708]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5 space-x-reverse">
              <div className="h-9 w-9 rounded-xl bg-[#0e0e12] border border-neutral-800/70 flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-400 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block leading-none font-bold">
                  {i18n[lang].merchantPortal}
                </span>
                <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{authenticatedMerchant.name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 uppercase font-mono tracking-wider font-bold">
                    {i18n[lang].active}
                  </span>
                </span>
              </div>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex items-center space-x-1 space-x-reverse bg-[#0d0d11] p-1 rounded-xl border border-neutral-800/50">
              <button
                onClick={() => setMerchantTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-2 ${merchantTab === 'overview' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-400 hover:text-white'}`}
              >
                <Activity className="h-3.5 w-3.5 text-neutral-400" />
                <span>{i18n[lang].overview}</span>
              </button>
              <button
                onClick={() => setMerchantTab('customers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-2 ${merchantTab === 'customers' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-400 hover:text-white'}`}
              >
                <Users className="h-3.5 w-3.5 text-neutral-400" />
                <span>{i18n[lang].customers}</span>
              </button>
              <button
                onClick={() => setMerchantTab('faqs')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-2 ${merchantTab === 'faqs' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-400 hover:text-white'}`}
              >
                <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                <span>{i18n[lang].faqsTab}</span>
              </button>
              <button
                onClick={() => {
                  setMerchantTab('settings');
                  setBotIdentity(authenticatedMerchant.botIdentity || '');
                  setFacebookPageId(authenticatedMerchant.facebookPageId || '');
                  setVerifyToken(authenticatedMerchant.verifyToken || '');
                  setMerchantPassword(authenticatedMerchant.password || 'password123');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center gap-2 ${merchantTab === 'settings' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-400 hover:text-white'}`}
              >
                <Settings className="h-3.5 w-3.5 text-neutral-400" />
                <span>{i18n[lang].settings}</span>
              </button>
            </div>

            {/* RIGHT PROFILE LOGOUT & LANGUAGE TOGGLE */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* LANGUAGE SWITCH BUTTON */}
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-[#0d0d11] text-[10px] text-neutral-300 font-bold hover:border-neutral-700 transition"
              >
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>

              <div className="hidden md:flex flex-col items-end text-neutral-450">
                <span className="text-[9px] tracking-widest uppercase text-neutral-500 font-bold">{i18n[lang].planLevel}</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">{authenticatedMerchant.plan}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl border border-transparent hover:border-neutral-805 transition cursor-pointer"
                title={i18n[lang].logout}
              >
                <LogOut className="h-4.5 w-4.5 text-rose-500" />
              </button>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            {merchantTab === 'overview' ? (
              // MERCHANT Tab A: OVERVIEW AND METRICS
              <div className="space-y-6">
                
                {/* METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* METRIC 1: MESSAGE COUNTER */}
                  <div className="bg-[#0e0e12] p-6 rounded-2xl border border-neutral-900/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        {i18n[lang].totalMessages}
                      </span>
                      <span className="text-3xl font-bold text-white tracking-tight">
                        {authenticatedMerchant.messageCount}
                      </span>
                      <div className="w-40 bg-[#070708] h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
                          style={{ width: `${Math.min(100, (authenticatedMerchant.messageCount / (authenticatedMerchant.plan === 'Basic' ? 100 : authenticatedMerchant.plan === 'Pro' ? 500 : 2000)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-[#71717a] block mt-1.5">
                        {lang === 'ar' ? `الحد الأقصى لباقة ${authenticatedMerchant.plan}:` : `${authenticatedMerchant.plan} Bundle Limit:`} {authenticatedMerchant.plan === 'Basic' ? '100' : authenticatedMerchant.plan === 'Pro' ? '500' : '2000'}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#070708] border border-neutral-900 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-emerald-400" />
                    </div>
                  </div>

                  {/* METRIC 2: PLAN DETAIL */}
                  <div className="bg-[#0e0e12] p-6 rounded-2xl border border-neutral-900/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        {i18n[lang].planLevel}
                      </span>
                      <span className="text-3xl font-bold text-yellow-500 tracking-tight">
                        {authenticatedMerchant.plan}
                      </span>
                      <span className="text-[10px] text-[#71717a] block mt-2">
                        {lang === 'ar' ? 'مدعوم بنماذج Gemini 3.5 فائقة السرعة' : 'Powered by fast Gemini 3.5 Flash models'}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#070708] border border-neutral-900 flex items-center justify-center">
                      <Layers className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>

                  {/* METRIC 3: ACTIVE FOLLOW-UPS */}
                  <div className="bg-[#0e0e12] p-6 rounded-2xl border border-neutral-900/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        {i18n[lang].customersCount}
                      </span>
                      <span className="text-3xl font-bold text-white tracking-tight">
                        {merchantCustomers.length}
                      </span>
                      <span className="text-[10px] text-[#71717a] block mt-2">
                        {lang === 'ar' ? 'العملاء المتفاعلين مع البوت مؤخراً' : 'Clients active in Messenger CRM'}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#070708] border border-neutral-900 flex items-center justify-center">
                      <Users className="h-6 w-6 text-teal-400" />
                    </div>
                  </div>
                </div>

                {/* ALGERIAN PAYMENT & TRIAL PLANS INTEGRATION (CCP / BARIDIMOB) */}
                <div className="bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Database className="h-44 w-44 text-white" />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Account Status & Instructions (7 Cols) */}
                    <div className="lg:col-span-7 space-y-5">
                      <div>
                        <span className="px-2.5 py-1 text-[9px] bg-amber-950/30 border border-amber-900/50 text-amber-500 rounded-md font-bold font-mono uppercase tracking-wider">
                          🇩🇿 {lang === 'ar' ? 'باقة الاشتراكات وتأكيد الدفع اليدوي' : 'Algiers SaaS Pricing & CCP/Baridimob'}
                        </span>
                        <h2 className="text-lg font-bold text-white mt-2 tracking-tight">
                          {lang === 'ar' ? 'حالة حساب التاجر والمدفوعات اليدوية' : 'Merchant Subscription Account Status'}
                        </h2>
                        <p className="text-neutral-400 text-xs mt-1 leading-relaxed">
                          {lang === 'ar' ? 'نحن نسير أعمالك بالعملة المحلية بالدينار الجزائري (DZD). يمكنك تفعيل الميزات والترقية من خلال إرسال مستحقات الباقة عبر مكاتب البريد CCP أو تطبيق Baridimob.' : 'Maintain your business using your local currency (Algerian Dinars - DZD). Unlock full autopilot answering capabilities by submitting manual payment receipts.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 space-y-2">
                          <span className="text-[9.5px] text-neutral-500 uppercase tracking-wider font-bold">
                            {lang === 'ar' ? 'صك بريدي CCP لإرسال الأموال' : 'Algerie Poste CCP transfer'}
                          </span>
                          <div className="text-xs text-white space-y-1">
                            <p className="text-[11px] text-neutral-400">الحساب البريدي الجاري / No CCP:</p>
                            <p className="font-mono text-emerald-400 font-bold bg-[#0e0e12] px-2 py-1 rounded inline-block text-[11px]">
                              CCP: 0044144994 Key 68
                            </p>
                            <p className="text-[10px] text-neutral-500">اسم المستفيد: صاحب المنصة</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 space-y-2">
                          <span className="text-[9.5px] text-neutral-500 uppercase tracking-wider font-bold">
                            {lang === 'ar' ? 'تطبيق بريديموب Baridimob' : 'Baridimob Transfer RIP'}
                          </span>
                          <div className="text-xs text-white space-y-1">
                            <p className="text-[11px] text-neutral-400">رقم الحساب البريدي RIP No:</p>
                            <p className="font-mono text-yellow-500 font-bold bg-[#0e0e12] px-2 py-1 rounded inline-block text-[11px]">
                              RIP: 00799999004414499403
                            </p>
                            <p className="text-[10px] text-neutral-500">تحويل فوري وآمن 24/7</p>
                          </div>
                        </div>
                      </div>

                      {/* Current Status Highlights */}
                      <div className="p-4 rounded-xl bg-[#14141d]/40 border border-[#21212c]/40 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-400">{lang === 'ar' ? 'الباقة الحالية لماتجركم:' : 'Active Store Bundle Plan:'}</span>
                          <span className="font-bold font-mono text-white text-wrap">{authenticatedMerchant.plan} model</span>
                        </div>

                        {/* Free Trial Expire Date Check */}
                        {(() => {
                          const hasTrial = authenticatedMerchant.trialExpiresAt && new Date(authenticatedMerchant.trialExpiresAt) > new Date();
                          const remainingDays = hasTrial ? Math.ceil((new Date(authenticatedMerchant.trialExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                          return hasTrial ? (
                            <div className="flex items-center space-x-2 text-xs bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg text-amber-500">
                              <span>🎁</span>
                              <span>
                                {lang === 'ar' 
                                  ? `حسابكم يتمتع بفترة تجريبية مجانية ممتازة متبقي منها ${remainingDays} أيام!` 
                                  : `Account is inside active free trial! ${remainingDays} days remaining.`}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[10.5px] text-neutral-500">
                              {lang === 'ar' ? '• لا توجد فترة تجريبية مجانية نشطة حالياً.' : '• No active promotional trial active.'}
                            </div>
                          );
                        })()}

                        {/* Payment Verification Banner */}
                        {(() => {
                          if (authenticatedMerchant.paymentStatus === 'approved') {
                            return (
                              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-950/40 text-emerald-450 text-xs flex items-center gap-2">
                                <span>✓</span>
                                <div>
                                  <strong className="block text-[#4ade80]">{lang === 'ar' ? 'دفع مؤكد بنجاح' : 'Payment approved'}</strong>
                                  <span>{lang === 'ar' ? 'حسابكم غير مقيد ومؤكد تماما من قبل الإدارة.' : 'Billing matches verified DZD amount and active subscription status.'}</span>
                                </div>
                              </div>
                            );
                          } else if (authenticatedMerchant.paymentStatus === 'pending') {
                            return (
                              <div className="p-2.5 rounded-lg bg-yellow-950/20 border border-yellow-955/30 text-yellow-500 text-xs flex items-center gap-2">
                                <span className="animate-spin text-yellow-500">⏳</span>
                                <div>
                                  <strong>{lang === 'ar' ? 'قيد المراجعة والتدقيق اليدوي' : 'Pending Manual Verification'}</strong>
                                  <span className="block text-[11px] text-neutral-300">
                                    {lang === 'ar' 
                                      ? `تم تقديم طلب التحويل بمبلغ ${authenticatedMerchant.paymentAmount || 2000} دينار (الرمز: ${authenticatedMerchant.paymentTxRef}). يرجى الانتظار.` 
                                      : `Claiming ${authenticatedMerchant.paymentAmount || 2000} DZD via ${authenticatedMerchant.paymentMethod} (Ref: ${authenticatedMerchant.paymentTxRef}). Waiting for admin.`
                                    }
                                  </span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-905/30 text-rose-400 text-xs flex items-center gap-2">
                                <span>⚠️</span>
                                <div>
                                  <strong>{lang === 'ar' ? 'بانتظار اتمام عملية الدفع' : 'Payment outstanding'}</strong>
                                  <span>{lang === 'ar' ? 'يرجى تقديم تفاصيل دفع صك CCP أو Baridimob لتفادي تعليق الردود التلقائية للبوت.' : 'Autopilot answers might be capped if no CCP or Baridimob transfer claim is submitted.'}</span>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>

                    {/* Right: Submission Form (5 Cols) */}
                    <div className="lg:col-span-5 bg-neutral-950/65 border border-neutral-900 rounded-xl p-5 space-y-4">
                      <div className="border-b border-neutral-900/80 pb-2.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          {lang === 'ar' ? 'تقديم طلب تأكيد الدفع 🇩🇿' : 'Submit Transfer Claim Slip'}
                        </h4>
                        <p className="text-[10.5px] text-neutral-500 mt-1">
                          {lang === 'ar' ? 'بعد إرسال المستحقات، املأ هذه الخانات لتفعيل حسابك.' : 'After transferring funds, fill in this form for fast verification.'}
                        </p>
                      </div>

                      <form onSubmit={handleMerchantSubmitPayment} className="space-y-4 text-xs text-neutral-250">
                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">
                            {lang === 'ar' ? 'طريقة التحويل المستخدمة' : 'Transfer mechanism'}
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentFormMethod('ccp')}
                              className={`py-2 text-center rounded-xl font-bold transition border cursor-pointer ${paymentFormMethod === 'ccp' ? 'bg-[#181822] text-white border-neutral-800' : 'bg-[#070708] border-neutral-900 text-neutral-450 hover:border-neutral-800'}`}
                            >
                              CCP Post 🇩🇿
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentFormMethod('baridimob')}
                              className={`py-2 text-center rounded-xl font-bold transition border cursor-pointer ${paymentFormMethod === 'baridimob' ? 'bg-[#181822] text-white border-neutral-800' : 'bg-[#070708] border-neutral-900 text-neutral-450 hover:border-neutral-800'}`}
                            >
                              Baridimob App RIP
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-450 mb-1">
                            {lang === 'ar' ? 'المبلغ المحول بالدينار (DZD)' : 'Transferred Amount in DZD'}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              required
                              value={paymentFormAmount}
                              onChange={(e) => setPaymentFormAmount(Number(e.target.value))}
                              placeholder="e.g. 2000"
                              className="w-full block bg-[#070708] border border-neutral-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono font-bold"
                            />
                            <span className="absolute right-3.5 top-2.5 text-[10px] text-neutral-500 font-bold font-mono">DZD</span>
                          </div>
                          <span className="text-[9.5px] text-[#71717a] mt-1 block">
                            {lang === 'ar' ? 'تنويه: باقة Basic تبلغ 2,000 دج • Pro تبلغ 5,000 دج • Premium تبلغ 10,000 دج.' : 'Guidance: Basic is 2,000 DZD • Pro is 5,000 DZD • Premium is 10,000 DZD.'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1 font-sans">
                            {lang === 'ar' ? 'الرمز التعريفي للتحويل / رقم المعاملة بريديموب أو رقم الحوالة' : 'Transaction unique reference (Tx code / slip key)'}
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentFormTxRef}
                            onChange={(e) => setPaymentFormTxRef(e.target.value)}
                            placeholder="e.g. TX-BARIDI-39402 or SLIP_123"
                            className="w-full block bg-[#070708] border border-neutral-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingPayment}
                          className="w-full py-2.5 bg-neutral-100 hover:bg-white text-[#070708] font-bold rounded-xl text-center cursor-pointer transition flex items-center justify-center space-x-2 shadow-lg"
                        >
                          {isSubmittingPayment ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-neutral-900" />
                          ) : (
                            <>
                              <span>🇩🇿</span>
                              <span>{lang === 'ar' ? 'تقديم إشعار الدفع الفوري' : 'Submit Verification Request'}</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* TWO-COLUMN LOWER SUMMARY: ACTIVITY TIMELINE & QUICK TEST BOX */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* TIMELINE FEED */}
                  <div className="lg:col-span-6 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{lang === 'ar' ? 'آخر الأحداث والمحادثات المباشرة' : 'Live CRM Interactions Stream'}</span>
                    </h3>
                    
                    <div className="space-y-4 pt-2">
                      {merchantCustomers.map((cust, idx) => (
                        <div key={cust.id} className="flex gap-3 text-xs border-b border-neutral-900/60 pb-3 last:border-0 last:pb-0">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{cust.name}</span>
                              <span className="text-[9px] text-[#71717a] font-mono">{cust.lastTime}</span>
                            </div>
                            <p className="text-neutral-400 text-[11px] font-sans">
                              {lang === 'ar' ? 'الرسالة الواردة:' : 'Incoming:'} "{cust.lastMessage}"
                            </p>
                            <span className={`inline-flex items-center text-[9px] font-mono font-bold mt-1 ${cust.status === 'chatbot_active' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                              {cust.status === 'chatbot_active' ? '● Bot Active & Replied with Gemini' : '○ Paused (Manual control mode)'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INTUITIVE GEMINI SANDBOX INTEGRATED IN OVERVIEW FOR CONVENIENCE */}
                  <div className="lg:col-span-6 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>{i18n[lang].testBot}</span>
                      </h3>
                      <p className="text-neutral-400 text-xs">
                        {lang === 'ar' ? 'اختبر رد الذكاء الاصطناعي بناءً على هويتك ونبرتك الحالية فوراً:' : 'Test exactly how Gemini AI responds according to your current persona prompt instruction:'}
                      </p>

                      <form className="space-y-4 mt-3" onSubmit={handleSimulateWebhook}>
                        <div className="space-y-2">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                            {i18n[lang].simulateText}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={simulatedMessage}
                              onChange={(e) => setSimulatedMessage(e.target.value)}
                              placeholder={lang === 'ar' ? 'سؤال عن السعر أو موقع الفرع...' : 'Ask about prices, models, or location...'}
                              className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-750 transition"
                            />
                            <button
                              type="submit"
                              disabled={isSimulating}
                              className={`absolute ${lang === 'ar' ? 'left-2.5' : 'right-2.5'} top-1.5 px-3 py-1.5 bg-neutral-100 text-black rounded-lg text-[10px] font-bold transition hover:bg-white`}
                            >
                              {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : (lang === 'ar' ? 'أرسل' : 'Simulate')}
                            </button>
                          </div>
                        </div>
                      </form>

                      {/* QUICK QUESTIONS SELECTOR */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest block font-bold">
                          {i18n[lang].quickTestQ}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSimulatedMessage(lang === 'ar' ? 'كم سعر فستان بيلا فلورال المتاح لديكم؟' : 'What is the price of Bella Floral dress?')}
                            className="text-[10px] px-2.5 py-1.5 bg-[#070708] border border-neutral-900 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-800 transition cursor-pointer"
                          >
                            Dress Price
                          </button>
                          <button
                            onClick={() => setSimulatedMessage(lang === 'ar' ? 'أين يقع متجر بيروت أو باريس؟' : 'Where is your store in Paris?')}
                            className="text-[10px] px-2.5 py-1.5 bg-[#070708] border border-neutral-900 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-800 transition cursor-pointer"
                          >
                            Store Location
                          </button>
                          <button
                            onClick={() => setSimulatedMessage(lang === 'ar' ? 'أهلاً، هل توفرون خامات كلاسيكية وبكم؟' : 'Hello, do you have silk blouses?')}
                            className="text-[10px] px-2.5 py-1.5 bg-[#070708] border border-neutral-900 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-800 transition cursor-pointer"
                          >
                            Apparel list
                          </button>
                        </div>
                      </div>

                      {/* SIMULATION TRACE OUTPUT */}
                      <AnimatePresence>
                        {simulatorReply && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 p-4 bg-neutral-950 rounded-xl border border-neutral-900 space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-neutral-905 pb-2">
                              <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-widest uppercase">
                                [GEMINI AUTO-REPLY SIMULATION]
                              </span>
                              <span className="text-[10px] font-bold text-neutral-400">
                                {isRealAIResponse ? "⚡ Powered by Live Gemini" : "🤖 Local Smart Rule Clasp"}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-200 leading-relaxed font-sans">{simulatorReply}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="text-[9px] text-[#52525b] uppercase font-bold tracking-widest pt-4">
                      {lang === 'ar' ? 'مدعوم بطبقة وكلاء Gemini AI الآمنة' : 'Secured server-side via Gemini API Proxy'}
                    </div>
                  </div>
                </div>

              </div>
            ) : merchantTab === 'customers' ? (
              // MERCHANT Tab B: DUAL-MODE CONTACTS & ORDERS ENGINE WITH ALGERIAN AI EXTRACTION
              <div className="space-y-6">
                
                {/* DIRECT SUB-TABS SELECTOR */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-[#0d0d12] border border-neutral-800 rounded-2xl p-4.5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="h-4.5 w-4.5 text-emerald-400" />
                      <span>{lang === 'ar' ? 'نظام إدارة وطلبيات الزبائن (CRM)' : 'Followers & AI Orders Database'}</span>
                    </h3>
                    <p className="text-xs text-neutral-450">
                      {lang === 'ar' ? 'استخلاص فوري ومباشر لبيانات الطلبيات (الولاية، الهاتف والمستحقات) بالذكاء الاصطناعي مع تحكم يدوي' : 'Real-time NLP customer data extraction & merchant ledger with manual override capabilities.'}
                    </p>
                  </div>

                  {/* SUBTAB TOGGLES */}
                  <div className="flex gap-1.5 self-stretch sm:self-auto bg-neutral-950/80 p-1 rounded-xl border border-neutral-900">
                    <button
                      type="button"
                      onClick={() => setCustomerSubTab('orders')}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer ${customerSubTab === 'orders' ? 'bg-[#181822] text-emerald-400 font-bold border border-neutral-800/40' : 'text-neutral-450 hover:text-white'}`}
                    >
                      <Database className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'ar' ? '📋 جدول الطلبيات المستخلصة' : 'AI Extracted Orders'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerSubTab('chat')}
                      className={`px-3.5 py-2 text-xs font-bold rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer ${customerSubTab === 'chat' ? 'bg-[#181822] text-amber-400 font-bold border border-neutral-800/40' : 'text-neutral-450 hover:text-white'}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span>{lang === 'ar' ? '💬 الدردشة والمحاكاة التفاعلية' : 'Live Chat & Simulation'}</span>
                    </button>
                  </div>
                </div>

                {/* MODE A: AI EXTRACTED CLIENT ORDERS TABLE */}
                {customerSubTab === 'orders' ? (
                  <div className="bg-[#0e0e12] border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5">
                    
                    {/* FILTERING & CONFIGURATION BAR */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-neutral-900 pb-5">
                      
                      {/* Search Bar */}
                      <div className="md:col-span-4 relative">
                        <span className="absolute left-3 top-3 text-neutral-500">
                          <Search className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          placeholder={lang === 'ar' ? 'ابحث باسم الزبون، رقم هاتفه أو المنتج...' : 'Search customer, phone, product...'}
                          className="w-full bg-[#070708] border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition"
                        />
                      </div>

                      {/* State/Wilaya Selector */}
                      <div className="md:col-span-3 flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase shrink-0">
                          <Filter className="h-3.5 w-3.5 inline mr-1 text-emerald-400" /> {lang === 'ar' ? 'الولاية:' : 'Wilaya:'}
                        </span>
                        <select
                          value={orderFilterWilaya}
                          onChange={(e) => setOrderFilterWilaya(e.target.value)}
                          className="flex-1 bg-[#070708] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700"
                        >
                          <option value="all">{lang === 'ar' ? 'الكل (58 ولاية)' : 'All Wilayas'}</option>
                          <option value="16 - الجزائر">16 - الجزائر</option>
                          <option value="31 - وهران">31 - وهران</option>
                          <option value="25 - قسنطينة">25 - قسنطينة</option>
                          <option value="19 - سطيف">19 - سطيف</option>
                          <option value="09 - البليدة">09 - البليدة</option>
                          <option value="23 - عنابة">23 - عنابة</option>
                          <option value="05 - باتنة">05 - باتنة</option>
                        </select>
                      </div>

                      {/* Default Unit Price (المبلغ الافتراصي للقطعة للتاجر) */}
                      <div className="md:col-span-3 flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase shrink-0">
                          <Tag className="h-3.5 w-3.5 inline mr-1 text-amber-500" /> {lang === 'ar' ? 'سعر الحبة (دج):' : 'Unit Price (DZD):'}
                        </span>
                        <input
                          type="number"
                          value={defaultUnitPrice}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            setDefaultUnitPrice(val);
                            // Auto recalculate prices if not customized
                            setMerchantCustomers(prev => prev.map(c => {
                              if (c.extractedOrder) {
                                return {
                                  ...c,
                                  extractedOrder: {
                                    ...c.extractedOrder,
                                    totalPrice: c.extractedOrder.pieces * val
                                  }
                                };
                              }
                              return c;
                            }));
                          }}
                          className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-neutral-700"
                          title="تلقائياً يحسب البوت السعر الإجمالي بالضرب في كمية القطع"
                        />
                      </div>

                      {/* Add Manually customer button */}
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newId = `cust-${Math.floor(Math.random() * 90000 + 10000)}`;
                            const newCust: MockCustomer = {
                              id: newId,
                              name: lang === 'ar' ? 'زبون جديد' : 'New Client',
                              lastMessage: 'أهلاً، حاب نسجل طلبية جديدة',
                              lastTime: 'منذ ثواني',
                              phoneOrUsername: '0550000000',
                              platform: 'facebook',
                              status: 'paused_manual',
                              messages: [
                                { sender: 'customer', text: 'سلام، حاب نسجل طلبية جديدة', timestamp: '12:00' }
                              ],
                              extractedOrder: {
                                product: 'منتج تجاري افتراضي',
                                phone: '0550000000',
                                address: 'حي وسط المدينة العريق',
                                wilaya: '16 - الجزائر',
                                pieces: 1,
                                size: 'M',
                                totalPrice: defaultUnitPrice
                              }
                            };
                            setMerchantCustomers(prev => [newCust, ...prev]);
                            startEditOrder(newCust);
                            showToast(lang === 'ar' ? 'تم إنشاء حقل زبون يدوي وتنشيط نموذج التحرير!' : 'Created placeholder client profile!');
                          }}
                          className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-450 text-black text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle className="h-4 w-4 shrink-0" />
                          <span>{lang === 'ar' ? 'إضافة زبون يدوياً' : 'Add Order'}</span>
                        </button>
                      </div>

                    </div>

                    {/* SORT CONTROLS INFO HEADER */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-neutral-400 px-1">
                      <div>
                        {lang === 'ar' ? (
                          <span>يرتب الجدول الزبائن والطلبيات المكتشفة تلقائياً بناءً على <b>قيمة المستحقات الإجمالية 💰</b></span>
                        ) : (
                          <span>Table automatically sorts active buyers by <b>total calculated dues 💰</b></span>
                        )}
                      </div>
                      <div className="flex gap-2.5 mt-2 sm:mt-0">
                        <button
                          onClick={() => {
                            setOrderSortBy('totalPrice');
                            setOrderSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          }}
                          className={`font-semibold transition text-[11px] ${orderSortBy === 'totalPrice' ? 'text-emerald-400 underline font-bold' : 'text-neutral-550'}`}
                        >
                          {lang === 'ar' ? 'مرتب حسب السعر ' : 'Sort Price: '}
                          {orderSortBy === 'totalPrice' && (orderSortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                        <span className="text-neutral-700">|</span>
                        <button
                          onClick={() => {
                            setOrderSortBy('pieces');
                            setOrderSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          }}
                          className={`font-semibold transition text-[11px] ${orderSortBy === 'pieces' ? 'text-teal-400 underline font-bold' : 'text-neutral-550'}`}
                        >
                          {lang === 'ar' ? 'حسب قطع الحبات ' : 'Sort Pieces: '}
                          {orderSortBy === 'pieces' && (orderSortDirection === 'asc' ? '↑' : '↓')}
                        </button>
                      </div>
                    </div>

                    {/* MAIN EXTRACETD CUSTOMERS TABLE */}
                    <div className="border border-neutral-900 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs text-neutral-300 border-collapse">
                        <thead>
                          <tr className="bg-neutral-950/80 border-b border-neutral-900 text-[10px] text-neutral-400 uppercase tracking-widest text-center select-none">
                            <th className="py-3 px-4 text-right font-bold text-neutral-450">{lang === 'ar' ? 'الزبون والمنصة' : 'Buyer Profile'}</th>
                            <th className="py-3 px-4 text-right font-bold text-neutral-450">{lang === 'ar' ? '🛍️ ماذا اشترى' : 'Product bought'}</th>
                            <th className="py-3 px-4 text-center font-bold text-neutral-450">{lang === 'ar' ? '📞 رقم الهاتف' : 'Phone'}</th>
                            <th className="py-3 px-4 text-right font-bold text-neutral-450">{lang === 'ar' ? '📍 الولاية بالجزائر' : 'Algerian Wilaya'}</th>
                            <th className="py-3 px-4 text-right font-bold text-neutral-450">{lang === 'ar' ? '🏠 العنوان بالتفصيل' : 'Detailed Address'}</th>
                            <th className="py-3 px-4 text-center font-bold text-neutral-450">{lang === 'ar' ? '📐 المقاس' : 'Size'}</th>
                            <th className="py-3 px-4 text-center font-bold text-neutral-450">{lang === 'ar' ? '📦 القطع' : 'Pieces'}</th>
                            <th className="py-3 px-4 text-center font-bold text-neutral-450">{lang === 'ar' ? '💰 الإجمالي المحسوب' : 'Total Amount'}</th>
                            <th className="py-3 px-4 text-center font-bold text-neutral-450">{lang === 'ar' ? 'الإجراء المتخذ' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900/60 font-sans">
                          {(() => {
                            // Filter logic
                            let filtered = merchantCustomers.filter(cust => {
                              const searchLower = orderSearchQuery.toLowerCase().trim();
                              const matchesSearch = !searchLower || 
                                cust.name.toLowerCase().includes(searchLower) ||
                                cust.phoneOrUsername.toLowerCase().includes(searchLower) ||
                                (cust.extractedOrder && cust.extractedOrder.product.toLowerCase().includes(searchLower)) ||
                                (cust.extractedOrder && cust.extractedOrder.phone.toLowerCase().includes(searchLower));

                              const matchesWilaya = orderFilterWilaya === 'all' || 
                                (cust.extractedOrder && cust.extractedOrder.wilaya === orderFilterWilaya);

                              return matchesSearch && matchesWilaya;
                            });

                            // Sorting logic
                            filtered.sort((a, b) => {
                              let valA: any = '';
                              let valB: any = '';

                              if (orderSortBy === 'name') {
                                valA = a.name;
                                valB = b.name;
                              } else if (orderSortBy === 'pieces') {
                                valA = a.extractedOrder ? a.extractedOrder.pieces : 0;
                                valB = b.extractedOrder ? b.extractedOrder.pieces : 0;
                              } else if (orderSortBy === 'totalPrice') {
                                valA = a.extractedOrder ? a.extractedOrder.totalPrice : 0;
                                valB = b.extractedOrder ? b.extractedOrder.totalPrice : 0;
                              }

                              if (valA < valB) return orderSortDirection === 'asc' ? -1 : 1;
                              if (valA > valB) return orderSortDirection === 'asc' ? 1 : -1;
                              return 0;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={9} className="py-12 text-center text-neutral-550 italic">
                                    {lang === 'ar' ? 'لا توجد طلبيات مطابقة للبحث للتصفية المحددة حالياً.' : 'No customer orders match the filter queries.'}
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map(cust => {
                              const ord = cust.extractedOrder || {
                                product: 'لم يتم الاستخلاص',
                                phone: 'غير مسجل',
                                address: 'بانتظار تفاصيل المحادثات',
                                wilaya: 'غير محددة',
                                pieces: 0,
                                size: 'M',
                                totalPrice: 0
                              };

                              return (
                                <tr key={cust.id} className="hover:bg-neutral-950/40 transition group">
                                  
                                  {/* Profile & social channel logo */}
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center gap-3 justify-start">
                                      <img
                                        src={cust.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                                        alt={cust.name}
                                        className="h-9 w-9 rounded-full object-cover border border-neutral-800 shrink-0"
                                      />
                                      <div className="min-w-0">
                                        <div className="font-bold text-white text-xs truncate">{cust.name}</div>
                                        <span className={`inline-flex items-center px-1 text-[8px] font-bold rounded mt-0.5 ${cust.platform === 'facebook' ? 'text-blue-400 bg-blue-950/50' : cust.platform === 'instagram' ? 'text-pink-400 bg-pink-950/50' : 'text-emerald-400 bg-emerald-950/50'}`}>
                                          {cust.platform.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Product bought details block */}
                                  <td className="py-3.5 px-4 text-right">
                                    <span className="inline-flex items-center gap-1 text-xs text-neutral-200 bg-[#16161e]/80 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-sans font-bold text-wrap whitespace-normal">
                                      <ShoppingBag className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                      <span>{ord.product}</span>
                                    </span>
                                  </td>

                                  {/* Phone number */}
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 font-mono text-center">
                                      <Phone className="h-3 w-3 text-neutral-500" />
                                      <span 
                                        onClick={() => {
                                          navigator.clipboard.writeText(ord.phone);
                                          showToast(lang === 'ar' ? 'تم نسخ الهاتف بنجاح!' : 'Phone copied!');
                                        }}
                                        className="text-white hover:text-emerald-400 border-b border-dashed border-neutral-700 hover:border-emerald-500 transition px-1 py-0.5 cursor-pointer"
                                        title="Click to copy phone"
                                      >
                                        {ord.phone}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Algerian Wilaya state */}
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1 bg-teal-950/20 text-teal-400 border border-teal-900/40 rounded-lg px-2.5 py-1 font-bold">
                                      <MapPin className="h-3 w-3 text-teal-400" />
                                      <span>🇩🇿 {ord.wilaya}</span>
                                    </div>
                                  </td>

                                  {/* Address */}
                                  <td className="py-3.5 px-4 text-right leading-relaxed max-w-[150px] truncate text-neutral-400 text-[11px]" title={ord.address}>
                                    {ord.address}
                                  </td>

                                  {/* Size */}
                                  <td className="py-3.5 px-4 text-center">
                                    <span className="inline-block px-2 py-0.5 bg-neutral-900 text-neutral-300 rounded font-semibold text-[10px] text-center border border-neutral-800">
                                      {ord.size}
                                    </span>
                                  </td>

                                  {/* Pieces */}
                                  <td className="py-3.5 px-4 text-center font-bold text-xs font-mono text-amber-400">
                                    {ord.pieces}
                                  </td>

                                  {/* Dynamic totalPrice in DZD */}
                                  <td className="py-3.5 px-4 text-center font-bold text-xs font-mono text-emerald-400">
                                    {ord.totalPrice.toLocaleString()} {lang === 'ar' ? 'دج' : 'DZD'}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        type="button"
                                        onClick={() => startEditOrder(cust)}
                                        className="p-1.5 bg-[#16161e] border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                                        title={lang === 'ar' ? 'تعديل بيانات العميل يدوياً' : 'Edit details'}
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAutoExtractCustomer(cust.id)}
                                        className="p-1.5 bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/10 rounded-lg transition-all cursor-pointer"
                                        title={lang === 'ar' ? 'إعادة استخلاص بالذكاء الاصطناعي' : 'Re-run AI extraction'}
                                      >
                                        <Bot className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الزبون والطلب؟' : 'Delete order?')) {
                                            setMerchantCustomers(prev => prev.filter(p => p.id !== cust.id));
                                            showToast(lang === 'ar' ? 'تم حذف ملف الزبون والطلبية.' : 'Removed customer.');
                                          }
                                        }}
                                        className="p-1.5 bg-rose-950/30 border border-rose-900/40 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-all cursor-pointer"
                                        title={lang === 'ar' ? 'حذف الزبون' : 'Delete'}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* METRICS & REPORT SUB-LEDGER */}
                    <div className="bg-[#0b0b0f] border border-neutral-900 rounded-xl p-4.5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <div className="flex items-center gap-4 text-neutral-400">
                        <span>{lang === 'ar' ? 'إجمالي الطلبات المستخلصة:' : 'Total Extracted Orders:'} <strong className="text-white font-mono font-bold text-sm">{merchantCustomers.filter(c => c.extractedOrder).length}</strong></span>
                        <span className="text-neutral-800">|</span>
                        <span>{lang === 'ar' ? 'إجمالي القطع الشاملة:' : 'Total Pieces Combined:'} <strong className="text-amber-400 font-mono font-bold text-sm">{merchantCustomers.reduce((acc, c) => acc + (c.extractedOrder?.pieces || 0), 0)}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-400">{lang === 'ar' ? 'السيولة الإجمالية المكتشفة:' : 'Combined AI Sales Pipeline:'}</span>
                        <strong className="text-emerald-400 font-mono text-base ml-2 font-bold">
                          {merchantCustomers.reduce((acc, c) => acc + (c.extractedOrder?.totalPrice || 0), 0).toLocaleString()} {lang === 'ar' ? 'دينار جزائري (دج)' : 'DZD'}
                        </strong>
                      </div>
                    </div>

                  </div>
                ) : (
                  
                  // MODE B: STANDARD CLIENT MESSAGES FLOW + INTERACTIVE INCOMING SIMULATOR
                  <div className="bg-[#0e0e12] border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                      
                      {/* SIDEBAR FOR INDIVIDUAL SELECTIONS (5 cols) */}
                      <div className="lg:col-span-5 border-r border-neutral-900/80 bg-[#0c0c10] flex flex-col justify-between">
                        <div>
                          <div className="p-4 border-b border-neutral-900/80">
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                              {lang === 'ar' ? 'الدردشة الحية والتحكم بمود وعيون البوت' : 'Follower Contacts Directory'}
                            </h3>
                            <p className="text-[11px] text-[#71717a] mt-0.5">
                              {lang === 'ar' ? 'اضغط لتعديل محادثة أي زبون أو إرسال تدابير تحكم وعمليات فورية' : 'Click followers to oversee conversation state or override automated bot manually.'}
                            </p>
                          </div>

                          <div className="divide-y divide-neutral-900/60 max-h-[420px] overflow-y-auto">
                            {merchantCustomers.map((cust) => {
                              const isActive = activeCustomerId === cust.id;
                              return (
                                <div
                                  key={cust.id}
                                  onClick={() => {
                                    setActiveCustomerId(cust.id);
                                    setManualMessageText('');
                                  }}
                                  className={`p-4 transition cursor-pointer flex items-center gap-3.5 ${isActive ? 'bg-[#181822]/40 border-l-2 border-emerald-400' : 'hover:bg-neutral-900/20'}`}
                                >
                                  <img
                                    src={cust.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                                    alt={cust.name}
                                    className="h-10 w-10 rounded-full object-cover shrink-0 border border-neutral-800"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-white text-xs block truncate">{cust.name}</span>
                                      <span className="text-[9px] text-neutral-500 shrink-0 font-mono">{cust.lastTime}</span>
                                    </div>
                                    <p className="text-neutral-450 text-[11px] truncate mt-0.5">{cust.lastMessage}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${cust.status === 'chatbot_active' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                                        {cust.status === 'chatbot_active' ? i18n[lang].chatbotActiveStatus : i18n[lang].pausedManual}
                                      </span>
                                      <span className="text-[8px] font-mono text-neutral-500 uppercase">{cust.platform}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 bg-[#0a0a0d] border-t border-neutral-900 text-[10px] text-neutral-500">
                          {lang === 'ar' ? `باقات التاجر تمكنك من دمج حسابات مسنجر وواتساب بلا حدود` : `Unlimited custom WhatsApp channels integrated.`}
                        </div>
                      </div>

                      {/* INDIVIDUAL WORKSPACE ACTION STREAM (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col justify-between bg-[#0e0e12]">
                        {(() => {
                          const activeCust = merchantCustomers.find(c => c.id === activeCustomerId);
                          if (!activeCust) {
                            return (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-neutral-500">
                                <Users className="h-12 w-12 text-neutral-800 mb-2" />
                                <span>{i18n[lang].noCustomersFound}</span>
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* CONVERSATION TOP */}
                              <div className="p-4 border-b border-neutral-900/80 bg-neutral-950/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={activeCust.avatarUrl}
                                    alt={activeCust.name}
                                    className="h-9 w-9 rounded-full object-cover border border-neutral-800"
                                  />
                                  <div>
                                    <span className="font-bold text-white text-xs block">{activeCust.name}</span>
                                    <span className="text-[10px] font-mono text-neutral-500 block">{activeCust.phoneOrUsername} • Sandbox Sync</span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => toggleCustomerChatbotStatus(activeCust.id)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center gap-1.5 ${activeCust.status === 'chatbot_active' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-800/40' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${activeCust.status === 'chatbot_active' ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                                  <span>{activeCust.status === 'chatbot_active' ? i18n[lang].chatbotActiveStatus : i18n[lang].pausedManual}</span>
                                </button>
                              </div>

                              {/* ALGERIAN ORDER HUD OVERLAY IN CHAT */}
                              {activeCust.extractedOrder && (
                                <div className="mx-4 mt-4 p-3 bg-neutral-950 border border-emerald-950/40 rounded-xl flex items-center justify-between gap-3 text-xs leading-relaxed">
                                  <div className="flex items-center gap-2 justify-start shrink-0">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{lang === 'ar' ? 'البيانات المستخلصة:' : 'AI Info Extracted:'}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-neutral-400 text-right flex-1 select-none">
                                    <span>👗 {activeCust.extractedOrder.product}</span>
                                    <span>• 📞 {activeCust.extractedOrder.phone}</span>
                                    <span>• 📍 {activeCust.extractedOrder.wilaya}</span>
                                    <span>• 💰 الإجمالي: <strong className="text-emerald-400">{activeCust.extractedOrder.totalPrice.toLocaleString()} دج</strong></span>
                                  </div>
                                  <button
                                    onClick={() => startEditOrder(activeCust)}
                                    className="px-2 py-1 bg-[#16161e] text-[10px] hover:text-white hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 font-bold"
                                  >
                                    {lang === 'ar' ? 'تعديل ✍️' : 'Edit'}
                                  </button>
                                </div>
                              )}

                              {/* CHAT BUBBLES */}
                              <div className="p-5 flex-1 max-h-[300px] overflow-y-auto space-y-4 bg-radial from-neutral-950/50 via-[#0e0e12] to-[#0e0e12]">
                                {activeCust.messages.map((msg, mIdx) => {
                                  const isCustomer = msg.sender === 'customer';
                                  const isBot = msg.sender === 'bot';
                                  return (
                                    <div
                                      key={mIdx}
                                      className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}
                                    >
                                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs relative ${isCustomer ? 'bg-[#181822]/80 text-[#f4f4f5] border border-neutral-800/40 rounded-tl-none' : isBot ? 'bg-[#0a0a0d] border border-emerald-950/40 text-neutral-200 rounded-tr-none' : 'bg-teal-950/10 border border-teal-900/40 text-teal-300 rounded-tr-none'}`}>
                                        {!isCustomer && (
                                          <span className="text-[8px] font-bold tracking-wider text-neutral-550 uppercase block mb-1">
                                            {isBot ? '🤖 Gemini Bot auto-reply' : '🛒 Store Merchant overrided'}
                                          </span>
                                        )}
                                        <p className="leading-relaxed font-sans">{msg.text}</p>
                                        <span className="text-[8px] text-[#71717a] font-mono mt-1 block text-right">{msg.timestamp}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* ACTIONS FOOTER: TWO CHANNELS (MANUAL RESPONSE + INTERACTIVE CUSTOMER SIMULATOR) */}
                              <div className="p-4 border-t border-neutral-900/80 bg-neutral-950/60 space-y-4">
                                
                                {/* 1. INTERACTIVE CUSTOMER SIMULATOR */}
                                <div className="bg-gradient-to-r from-purple-950/10 to-transparent border border-purple-950/30 p-3 rounded-xl space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">
                                      {lang === 'ar' ? '⚡ محاكي رسائل الزبون الـواردة بالذكاء الاصطناعي' : '⚡ Simulate Incoming Customer Message'}
                                    </span>
                                    <span className="text-[8.5px] text-neutral-500">{lang === 'ar' ? 'اكتب رسالة كزبون واختبر الاستخلاص التلقائي' : 'Test AI parsing instant heuristics'}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      id="sim-customer-message-input"
                                      placeholder={lang === 'ar' ? 'مثال: حاب نطلب قطعتين مقاس XL الهاتف ديالي 0555331199 في وهران' : 'e.g., Send order info, phone, state...'}
                                      className="flex-1 bg-[#030304] border border-neutral-900 text-xs px-3.5 py-2 text-white placeholder-neutral-700 rounded-xl"
                                      onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                          const el = e.currentTarget;
                                          if (!el.value.trim()) return;
                                          
                                          const custMsg = el.value.trim();
                                          el.value = '';

                                          // 1. Append Customer message
                                          const now = new Date();
                                          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                          
                                          // Prepare temp customer
                                          setMerchantCustomers(prev => prev.map(c => {
                                            if (c.id === activeCustomerId) {
                                              const updatedMessages = [
                                                ...c.messages,
                                                { sender: 'customer' as any, text: custMsg, timestamp: timeStr }
                                              ];

                                              // Compute NLP extraction on the fly
                                              const tempCust: MockCustomer = {
                                                ...c,
                                                messages: updatedMessages
                                              };
                                              const docExtraction = extractOrderFromCustomer(tempCust, defaultUnitPrice);

                                              // Simulate dynamic bot reply
                                              const botReplyText = lang === 'ar'
                                                ? `شكراً لتواصلك معنا! لقد سجلنا طلبك لـ "${docExtraction.product}" بمقاس ${docExtraction.size} لولاية ${docExtraction.wilaya} بسعر إجمالي ${docExtraction.totalPrice.toLocaleString()} دج. رقم هاتفك هو ${docExtraction.phone}. سيقوم مندوبنا بالاتصال بك قريباً كود (CONF-AI).`
                                                : `Thank you! Saved order for "${docExtraction.product}" size ${docExtraction.size} for state ${docExtraction.wilaya} (Dues: ${docExtraction.totalPrice} DZD). Phone: ${docExtraction.phone}.`;

                                              return {
                                                ...c,
                                                lastMessage: custMsg,
                                                lastTime: lang === 'ar' ? 'الآن' : 'Just now',
                                                messages: [
                                                  ...updatedMessages,
                                                  { sender: 'bot' as any, text: botReplyText, timestamp: timeStr }
                                                ],
                                                extractedOrder: docExtraction
                                              };
                                            }
                                            return c;
                                          }));
                                          showToast(lang === 'ar' ? 'تمت محاكاة رسالة الزبون والرد بالذكاء الاصطناعي واستخلصنا البيانات!' : 'Appended simulation and updated dynamic order extract!');
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const el = document.getElementById('sim-customer-message-input') as HTMLInputElement;
                                        if (el && el.value.trim()) {
                                          const event = new KeyboardEvent('keydown', { key: 'Enter' });
                                          el.dispatchEvent(event);
                                        }
                                      }}
                                      className="px-3.5 bg-purple-600 hover:bg-purple-550 text-white rounded-xl text-xs font-bold transition duration-150"
                                    >
                                      {lang === 'ar' ? 'محاكاة استقبال' : 'Simulate'}
                                    </button>
                                  </div>
                                </div>

                                {/* 2. STANDARD MERCHANT REPLY OVERRIDE */}
                                <div className="space-y-1.5 pt-1">
                                  <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block">
                                    {lang === 'ar' ? '✍️ تدخل يدوي باسم التاجر (تعطيل البوت مؤقتاً)' : i18n[lang].manualReply}
                                  </span>
                                  <div className="flex gap-2">
                                    <textarea
                                      value={manualMessageText}
                                      onChange={(e) => setManualMessageText(e.target.value)}
                                      rows={1}
                                      placeholder={i18n[lang].typeYourMessage}
                                      className="flex-1 bg-[#070708] border border-neutral-800 text-xs rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-750 resize-none placeholder-neutral-550"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                          e.preventDefault();
                                          handleSendManualMessage();
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={handleSendManualMessage}
                                      className="px-4.5 bg-emerald-400 text-black hover:bg-emerald-350 transition duration-150 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0"
                                    >
                                      <Send className="h-3.5 w-3.5 shrink-0" />
                                      <span>{i18n[lang].send}</span>
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </>
                          );
                        })()}
                      </div>

                    </div>
                  </div>
                )}

                {/* MODAL POPUP FOR MANUAL ORDER ENTRY/EDIT OVERRIDES */}
                <AnimatePresence>
                  {editingCustomer && (
                    <div id="ai-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="bg-[#0e0e12] border border-neutral-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
                      >
                        {/* HEADER */}
                        <div className="p-4.5 border-b border-neutral-900 bg-[#0c0c10] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                              {lang === 'ar' ? 'تعديل وتأكيد الطلبية للزبون يدوياً' : 'Approve & Adjust Extracted Order'}
                            </h3>
                          </div>
                          <button
                            onClick={() => setEditingCustomer(null)}
                            className="text-neutral-500 hover:text-white transition cursor-pointer"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {/* SUB-FORM */}
                        <form onSubmit={handleSaveManualOrderEdit} className="p-5 space-y-4">
                          <p className="text-[11px] text-[#8e8e9c] leading-relaxed select-none">
                            {lang === 'ar' ? `قم بتأكيد البيانات التي استخلصها البوت لـ ${editingCustomer.name}. يتم حساب السعر الإجمالي بالضرب المباشر في سعر القطعة الافتراضي أو يمكنك إدخال المبلغ النهائي يدوياً.` : `Review parsed details for ${editingCustomer.name}.`}
                          </p>

                          {/* Product bought */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '🛍️ ماذا اشترى (المنتج):' : 'Item bought:'}</label>
                            <input
                              type="text"
                              required
                              value={editOrderProduct}
                              onChange={(e) => setEditOrderProduct(e.target.value)}
                              className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          {/* Phone Number */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '📞 رقم هاتف الزبون:' : 'Customer Phone:'}</label>
                            <input
                              type="text"
                              required
                              value={editOrderPhone}
                              onChange={(e) => setEditOrderPhone(e.target.value)}
                              className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                            />
                          </div>

                          {/* State / Wilaya selection drop down */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '🗺️ الولاية بالجزائر:' : 'Algerian State:'}</label>
                            <select
                              value={editOrderWilaya}
                              onChange={(e) => setEditOrderWilaya(e.target.value)}
                              className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-205 focus:outline-none"
                            >
                              <option value="16 - الجزائر">16 - الجزائر</option>
                              <option value="31 - وهران">31 - وهران</option>
                              <option value="25 - قسنطينة">25 - قسنطينة</option>
                              <option value="19 - سطيف">19 - سطيف</option>
                              <option value="09 - البليدة">09 - البليدة</option>
                              <option value="23 - عنابة">23 - عنابة</option>
                              <option value="05 - باتنة">05 - باتنة</option>
                              <option value="15 - تيزي وزو">15 - تيزي وزو</option>
                              <option value="13 - تلمسان">13 - تلمسان</option>
                              <option value="34 - برج بوعريريج">34 - برج بوعريريج</option>
                              <option value="35 - بومرداس">35 - بومرداس</option>
                              <option value="غير محددة">{lang === 'ar' ? 'غير منصوصة' : 'Not specified'}</option>
                            </select>
                          </div>

                          {/* Detailed address */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '🏠 العنوان بالتفصيل:' : 'Street Address:'}</label>
                            <input
                              type="text"
                              required
                              value={editOrderAddress}
                              onChange={(e) => setEditOrderAddress(e.target.value)}
                              className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            {/* Size selection */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '📐 المقاس:' : 'Size:'}</label>
                              <input
                                type="text"
                                value={editOrderSize}
                                onChange={(e) => setEditOrderSize(e.target.value)}
                                className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                                placeholder="e.g. M, L, XL, S"
                              />
                            </div>

                            {/* Quantity selection */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-neutral-400 block font-bold uppercase">{lang === 'ar' ? '📦 عدد القطع:' : 'Pieces:'}</label>
                              <input
                                type="number"
                                required
                                min={1}
                                value={editOrderPieces}
                                onChange={(e) => {
                                  const pcs = Math.max(1, parseInt(e.target.value) || 1);
                                  setEditOrderPieces(pcs);
                                  setEditOrderTotalPrice(pcs * defaultUnitPrice);
                                }}
                                className="w-full bg-[#050507] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          {/* Total calculated price override */}
                          <div className="space-y-1">
                            <label className="text-[10px] text-yellow-400 block font-bold uppercase">{lang === 'ar' ? '💰 المبلغ المالي الإجمالي المحسوب (دج):' : 'Total Price (DZD):'}</label>
                            <input
                              type="number"
                              required
                              value={editOrderTotalPrice}
                              onChange={(e) => setEditOrderTotalPrice(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-full bg-[#050507] border border-amber-900 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold font-mono"
                            />
                            <span className="text-[9px] text-neutral-500 block mt-1">{lang === 'ar' ? '* تم حسابه تلقائياً من (القطع × سعر الحبة) ويمكنك تعديله يدوياً.' : '* Multiplied pieces by default unit price.'}</span>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex gap-2.5 pt-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditingCustomer(null)}
                              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-emerald-400 hover:bg-emerald-350 text-black rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>{lang === 'ar' ? 'تأكيد وحفظ الطلب' : 'Save configuration'}</span>
                            </button>
                          </div>

                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            ) : merchantTab === 'faqs' ? (
              // MERCHANT Tab CC: FAQS LIBRARY SYSTEM
              <div id="merchant-faqs-system" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* FAQ CREATION FORM (5 Columns) */}
                <div className="lg:col-span-5 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 h-fit space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <HelpCircle className="h-4.5 w-4.5 text-emerald-400" />
                      <span>{i18n[lang].faqTitle}</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      {i18n[lang].faqCheckFirst}
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleAddFaq}>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-450 uppercase tracking-wider block font-bold">
                        {i18n[lang].faqQuestionLabel}
                      </label>
                      <input
                        type="text"
                        value={newFaqQuestion}
                        onChange={(e) => setNewFaqQuestion(e.target.value)}
                        required
                        placeholder={lang === 'ar' ? 'أمثلة: ما هي سياسة الاسترجاع؟' : 'e.g. What is your return policy?'}
                        className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-750"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-450 uppercase tracking-wider block font-bold">
                        {i18n[lang].faqAnswerLabel}
                      </label>
                      <textarea
                        value={newFaqAnswer}
                        onChange={(e) => setNewFaqAnswer(e.target.value)}
                        rows={4}
                        required
                        placeholder={lang === 'ar' ? 'أدخل الرد النموذجي الذي سيقوم البوت بإرساله فوراً...' : 'Enter the pre-approved answer the bot will display instantly...'}
                        className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-750 leading-relaxed font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingFaq}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-400 text-black hover:bg-emerald-350 disabled:bg-neutral-800 disabled:text-neutral-500 font-bold text-xs transition tracking-wide cursor-pointer flex justify-center items-center gap-2"
                    >
                      {isSavingFaq ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>{i18n[lang].faqAddBtn}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* FAQ LIST PANE (7 Columns) */}
                <div className="lg:col-span-7 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 space-y-4 flex flex-col">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest block font-mono">
                      {lang === 'ar' ? `قائمة الأسئلة الشائعة المعتمدة (${faqs.length})` : `APPROVED FAQ LIST (${faqs.length})`}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {isFetchingFaqs ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-neutral-500">
                      <RefreshCw className="h-8 w-8 animate-spin text-neutral-700 mb-2" />
                      <span className="text-xs font-mono">Loading FAQ library...</span>
                    </div>
                  ) : faqs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-neutral-900 rounded-xl text-neutral-500">
                      <HelpCircle className="h-10 w-10 text-neutral-800 mb-3" />
                      <p className="text-xs leading-relaxed max-w-sm">
                        {i18n[lang].faqNoItems}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 text-right select-text text-wrap">
                      {faqs.map((faq) => (
                        <div
                          key={faq.id}
                          className="bg-[#070708] border border-neutral-850 rounded-xl p-4 flex gap-4 justify-between items-start hover:border-neutral-800 transition"
                        >
                          <div className="space-y-1.5 flex-1 select-text">
                            <h4 className="text-xs font-bold text-white flex items-start gap-1.5 leading-relaxed">
                              <span className="text-emerald-400 font-mono mt-0.5">Q:</span>
                              <span>{faq.question}</span>
                            </h4>
                            <p className="text-xs text-neutral-400 leading-relaxed font-sans pl-4 border-l border-neutral-850 text-wrap whitespace-normal">
                              <span className="text-neutral-500 font-mono mr-1">A:</span>
                              {faq.answer}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-1 px-1.5 rounded-lg border border-transparent bg-neutral-950 hover:bg-neutral-900 text-rose-500 hover:text-rose-450 transition cursor-pointer shrink-0"
                            title={i18n[lang].faqDeleteBtn}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // MERCHANT Tab C: AUTOMATION SETTINGS & WEBHOOK INTEGRATIONS
              <div id="settings-integration-portal" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AUTOMATION PROMPT FORM (7 columns) */}
                <div className="lg:col-span-7 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Bot className="h-4.5 w-4.5 text-emerald-400" />
                      <span>{i18n[lang].botIdentity}</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {i18n[lang].botDetailsDesc}
                    </p>
                  </div>

                  <form className="space-y-5" onSubmit={handleSaveMerchantConfig}>
                    <div className="space-y-2">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                        {lang === 'ar' ? 'نص توجيهات سلوك الذكاء الاصطناعي (System Prompt):' : 'A.I. Roleplay Instructions Prompt:'}
                      </label>
                      <textarea
                        value={botIdentity}
                        onChange={(e) => setBotIdentity(e.target.value)}
                        rows={6}
                        required
                        className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-750 font-sans leading-relaxed"
                        placeholder="أنت بوت آلي متواجد لخدمة عملاء Bella Boutique. الموديلات تشتمل على فساتين الصيف والبلوزات الحرير الطبيعي..."
                      />
                    </div>

                    {/* PASSWORDS TUNING AND RECRYSTALLIZATION */}
                    <div className="pt-4 border-t border-neutral-905 space-y-4">
                      <h4 className="text-xs font-bold text-neutral-300">
                        {i18n[lang].savePass}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest block font-bold mb-1.5">
                            {lang === 'ar' ? 'معرّف الصفحة فيسبوك (Facebook Page ID)' : 'Facebook Page ID (Page ID key)'}
                          </label>
                          <input
                            type="text"
                            value={facebookPageId}
                            onChange={(e) => setFacebookPageId(e.target.value)}
                            className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-neutral-750 transition font-mono"
                            placeholder="e.g. page_floral_boutique"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest block font-bold mb-1.5">
                            {lang === 'ar' ? 'رمز تحقق الويب هوك (Verify Token)' : 'Webhook Verify Token Key'}
                          </label>
                          <input
                            type="text"
                            value={verifyToken}
                            onChange={(e) => setVerifyToken(e.target.value)}
                            className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-neutral-750 transition font-mono"
                            placeholder="e.g. token_secret"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#a1a1aa] uppercase tracking-widest block font-bold mb-1.5">
                          {i18n[lang].passwordField}
                        </label>
                        <input
                          type="password"
                          value={merchantPassword}
                          onChange={(e) => setMerchantPassword(e.target.value)}
                          className="w-full bg-[#070708] border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-neutral-750 transition"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="inline-flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-bold transition shadow-lg shrink-0 cursor-pointer"
                    >
                      {isSavingConfig ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      <span>{i18n[lang].saveChanges}</span>
                    </button>
                  </form>
                </div>

                {/* COPYABLE WEBHOOK PARAMETERS & GRAPH API HOOKS (5 columns) */}
                <div className="lg:col-span-5 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#fafafa] tracking-tight flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-emerald-400" />
                      <span>{i18n[lang].connectedPlatforms}</span>
                    </h3>
                    <p className="text-xs text-neutral-450 mt-1">
                      {i18n[lang].platformTitle}
                    </p>
                  </div>

                  {/* WEBHOOK CALLBACK BOX PARAMETERS */}
                  <div className="space-y-4 pt-2">
                    
                    {/* PARAMETER A: URL */}
                    <div className="space-y-2 bg-[#070708] p-4 rounded-xl border border-neutral-900">
                      <span className="text-[9px] font-bold text-neutral-450 uppercase block font-mono">
                        {i18n[lang].webhookUrl}
                      </span>
                      <div className="flex gap-2">
                        <code className="text-[10px] font-mono select-all bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-900 text-neutral-400 truncate flex-1 block">
                          {window.location.origin}/api/webhook
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/api/webhook`, 'webhook_url')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 text-neutral-300 rounded text-[10px] cursor-pointer shrink-0 font-bold"
                        >
                          {copiedFile === 'webhook_url' ? i18n[lang].copied : i18n[lang].copyLink}
                        </button>
                      </div>
                    </div>

                    {/* PARAMETER B: VERIFY TOKEN */}
                    <div className="space-y-2 bg-[#070708] p-4 rounded-xl border border-neutral-900">
                      <span className="text-[9px] font-bold text-neutral-450 uppercase block font-mono">
                        {i18n[lang].verifyTokenTitle}
                      </span>
                      <div className="flex gap-2">
                        <code className="text-[10px] font-mono select-all bg-neutral-950 px-2.5 py-1.5 rounded-lg border border-neutral-900 text-neutral-400 truncate flex-1 block">
                          {authenticatedMerchant.verifyToken || 'bella_secret'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(authenticatedMerchant.verifyToken || 'bella_secret', 'verify_token')}
                          className="px-2 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 hover:border-neutral-700 text-neutral-300 rounded text-[10px] cursor-pointer shrink-0 font-bold"
                        >
                          {copiedFile === 'verify_token' ? i18n[lang].copied : i18n[lang].copyLink}
                        </button>
                      </div>
                    </div>

                    {/* GRAPH API EXPLANATION LIST */}
                    <div className="space-y-3 pt-3">
                      <span className="text-[10px] font-bold text-[#8a8a93] uppercase tracking-widest block">
                        {i18n[lang].metaInstructions}
                      </span>
                      <div className="space-y-2 text-[10px] text-neutral-400 leading-relaxed font-sans">
                        <p>{i18n[lang].metaStep1}</p>
                        <p>{i18n[lang].metaStep2}</p>
                        <p>{i18n[lang].metaStep3}</p>
                        <p>{i18n[lang].metaStep4}</p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-[#14141a] py-6 text-center text-[10px] text-neutral-500 bg-[#070708] select-none">
            {i18n[lang].allRights}
          </footer>
        </div>
      ) : (
        // AUTHENTICATED ADMIN DASHBOARD
        <div id="dashboard-layout" className="min-h-screen flex flex-col">
          {/* HEADER BAR */}
          <header className="border-b border-[#14141a] bg-[#070708]/90 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="h-9 w-9 rounded-xl bg-[#0e0e12] border border-neutral-800/70 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-neutral-200" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest block leading-none font-bold">
                  SaaS Control panel
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  Messenger AI Agent Sandbox
                </span>
              </div>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex items-center space-x-1 bg-[#0d0d11] p-1 rounded-xl border border-neutral-800/50">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center space-x-2 ${activeTab === 'dashboard' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-450 hover:text-white'}`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Active Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center space-x-2 ${activeTab === 'code' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-450 hover:text-white'}`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Replit Python Setup</span>
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition cursor-pointer flex items-center space-x-2 ${activeTab === 'plans' ? 'bg-[#181822] text-white border border-neutral-800/30' : 'text-neutral-450 hover:text-white'}`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>SaaS Pricing Plans 🇩🇿</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end text-neutral-450">
                <span className="text-[9px] tracking-widest uppercase text-neutral-500 font-bold">Active Principal</span>
                <span className="text-xs font-mono text-neutral-300">{adminEmail}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-neutral-450 hover:text-white hover:bg-neutral-900 rounded-xl border border-transparent hover:border-neutral-800 transition cursor-pointer"
                title="Disconnect from Dashboard"
              >
                <LogOut className="h-5 w-5 text-rose-500" />
              </button>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            {activeTab === 'dashboard' && (
              <>
                {/* METRICS BENTO HEADER */}
                <div id="stats-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* METRIC 1: TOTAL MERCHANTS */}
                  <div className="bg-[#0e0e12] p-5 rounded-2xl border border-neutral-900 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        Active Merchants
                      </span>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {isLoading ? '...' : `${activeCount} / ${merchants.length}`}
                      </span>
                      <span className="text-[10px] text-[#71717a] block mt-1">
                        Live message proxies active
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#070708] flex items-center justify-center border border-neutral-900/60">
                      <Users className="h-5 w-5 text-neutral-300" />
                    </div>
                  </div>

                  {/* METRIC 2: TOTAL MESSAGES */}
                  <div className="bg-[#0e0e12] p-5 rounded-2xl border border-neutral-900 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        Total Messages
                      </span>
                      <span className="text-2xl font-bold text-white tracking-tight">
                        {isLoading ? '...' : totalMessageCount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#71717a] block mt-1">
                        Processed replies from Gemini
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#070708] flex items-center justify-center border border-neutral-900/60">
                      <MessageSquare className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>

                  {/* METRIC 3: PLAN SPLIT */}
                  <div className="bg-[#0e0e12] p-5 rounded-2xl border border-neutral-900 flex items-center justify-between col-span-1 sm:col-span-2">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-[#8a8a93] uppercase block mb-1">
                        Merchant Tier Groups
                      </span>
                      <div className="grid grid-cols-3 gap-6 mt-2">
                        <div className="flex items-end space-x-2">
                          <span className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">Basic:</span>
                          <span className="text-base text-white font-mono leading-none">{basicCount}</span>
                        </div>
                        <div className="flex items-end space-x-2">
                          <span className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">Pro:</span>
                          <span className="text-base text-yellow-500 font-mono leading-none">{proCount}</span>
                        </div>
                        <div className="flex items-end space-x-2">
                          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Premium:</span>
                          <span className="text-base text-teal-400 font-mono leading-none">{premiumCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#070708] flex items-center justify-center border border-neutral-900/60">
                      <Layers className="h-5 w-5 text-neutral-400" />
                    </div>
                  </div>

                </div>

                {/* ERROR IN DASHBOARD */}
                {errorMsg && (
                  <div className="p-4 bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-xl text-xs flex items-center space-x-3 shadow-md">
                    <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* TWO-COLUMN LAYOUT: MERCHANTS DIRECTORY & Webhook SIMULATOR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT: DATABASE DIRECTORY (7 Cols) */}
                  <div className="lg:col-span-7 bg-[#0e0e12] border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                    <div>
                      {/* TABLE CONTROLS HEADER */}
                      <div className="px-6 py-5 border-b border-neutral-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
                            <span>Admin Store Database</span>
                            <span className="px-2 py-0.5 text-[8px] bg-neutral-900 text-emerald-400 border border-neutral-800/80 rounded-md font-mono uppercase tracking-wider font-bold">
                              Step 2 Sync
                            </span>
                            {postgresStatus?.connected && (
                              <span className="px-2 py-0.5 text-[8px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-md font-mono uppercase tracking-wider font-bold flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Neon Postgres Active
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Manage stores and subscription levels. Click any store to launch the Webhook Sandbox.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowAddModal(true)}
                          className="inline-flex items-center space-x-2 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-white text-[#070708] text-xs font-bold tracking-wider transition shadow-lg shrink-0 cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Register Merchant</span>
                        </button>
                      </div>

                      {/* MERCHANTS DATABASE TABLE */}
                      <div className="overflow-x-auto">
                        {isLoading && merchants.length === 0 ? (
                          <div className="py-24 text-center">
                            <RefreshCw className="h-7 w-7 text-neutral-400 animate-spin mx-auto mb-3" />
                            <span className="text-xs text-neutral-500 font-mono">Querying tables...</span>
                          </div>
                        ) : merchants.length === 0 ? (
                          <div className="py-20 text-center">
                            <Users className="h-8 w-8 text-neutral-700 mx-auto mb-3" />
                            <h4 className="text-xs font-semibold text-neutral-350">No registered merchants found</h4>
                            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs mx-auto">
                              Add your first store profile to get starter Meta webhook parameters generated.
                            </p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#14141a] text-[9px] font-bold tracking-widest text-neutral-500 uppercase select-none">
                                <th className="px-5 py-4">Client Detail / ID</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Plan Level</th>
                                <th className="px-5 py-4 text-center">Messages</th>
                                <th className="px-5 py-4 text-right">Suspend Trigger</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#14141a] text-xs">
                              {merchants.map((m) => {
                                const isSelected = selectedMerchant?.id === m.id;
                                return (
                                  <tr 
                                    key={m.id} 
                                    onClick={() => selectMerchantProfile(m)}
                                    className={`transition cursor-pointer ${
                                      isSelected 
                                        ? 'bg-[#181822]/40 hover:bg-[#181822]/50 border-l-2 border-emerald-400' 
                                        : 'hover:bg-neutral-900/30'
                                    }`}
                                  >
                                    <td className="px-5 py-4">
                                      <div className="font-bold text-white flex items-center space-x-1.5">
                                        <span>{m.name}</span>
                                        {isSelected && <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />}
                                      </div>
                                      <div className="text-neutral-500 text-[10px] font-mono mt-0.5">{m.email}</div>
                                      
                                      {/* Algerian Dialect Quick Switcher */}
                                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextDialect = !m.algerianDialect;
                                            fetch(`/api/admin/merchants/${m.id}/config`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ algerianDialect: nextDialect })
                                            }).then(r => r.json()).then(updated => {
                                              setMerchants(prev => prev.map(item => item.id === m.id ? updated : item));
                                              if (selectedMerchant?.id === m.id) setSelectedMerchant(updated);
                                              showToast(`Algerian Dialect setup updated for ${m.name}!`);
                                            });
                                          }}
                                          className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[8px] font-bold border transition leading-none cursor-pointer ${m.algerianDialect ? 'bg-[#0f241a] text-emerald-400 border-emerald-900/50' : 'bg-[#15151e] hover:bg-neutral-850 text-neutral-400 border-neutral-750'}`}
                                        >
                                          <span>🇩🇿 {m.algerianDialect ? 'Darja Active / لهجة جزائرية' : 'Standard Arabic / عربي فصحى'}</span>
                                        </button>
                                      </div>

                                      {/* Trial period Grant/Status controls */}
                                      {(() => {
                                        const hasTrial = m.trialExpiresAt && new Date(m.trialExpiresAt) > new Date();
                                        const remainingDays = hasTrial ? Math.ceil((new Date(m.trialExpiresAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                                        return (
                                          <div className="flex items-center space-x-1.5 mt-1.5" onClick={e => e.stopPropagation()}>
                                            <span className="text-[9px] text-[#71717a] font-bold">Free Trial:</span>
                                            {hasTrial ? (
                                              <div className="flex items-center space-x-1.5">
                                                <span className="bg-[#241a0f] text-yellow-500 border border-amber-900 px-1.5 py-0.5 rounded text-[8px] font-mono leading-none font-bold">
                                                  🎁 {remainingDays} Days Left
                                                </span>
                                                <button
                                                  onClick={() => handleGrantTrial(m.id, 0)}
                                                  className="text-rose-450 hover:text-rose-350 text-[9px] font-bold px-1 transition"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center space-x-1">
                                                <button
                                                  onClick={() => handleGrantTrial(m.id, 7)}
                                                  className="bg-[#121217] hover:bg-neutral-800 text-neutral-350 border border-neutral-800 px-1.5 py-0.5 rounded text-[8px] font-bold transition leading-none"
                                                >
                                                  +7d
                                                </button>
                                                <button
                                                  onClick={() => handleGrantTrial(m.id, 30)}
                                                  className="bg-[#121217] hover:bg-neutral-800 text-neutral-350 border border-neutral-800 px-1.5 py-0.5 rounded text-[8px] font-bold transition leading-none"
                                                >
                                                  +30d
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      {/* Pending manual payments action panel */}
                                      {m.paymentStatus === 'pending' && (
                                        <div className="mt-2.5 p-2 bg-[#2d210b] border border-amber-900/60 rounded-xl space-y-1.5" onClick={e => e.stopPropagation()}>
                                          <div className="flex items-center justify-between font-bold text-[10px]">
                                            <span className="text-yellow-450">🇩🇿 Pending Payment Verification ({m.paymentMethod})</span>
                                            <span className="font-mono text-[9px] font-bold text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-750">
                                              {m.paymentAmount || 2000} DZD
                                            </span>
                                          </div>
                                          <p className="text-[9.5px] text-neutral-400">
                                            Tx Reference: <span className="font-mono text-neutral-200 bg-neutral-950 px-1 py-0.5 rounded">{m.paymentTxRef}</span>
                                          </p>
                                          <div className="flex items-center space-x-2 pt-0.5">
                                            <button
                                              onClick={() => handleConfirmPayment(m.id, 'approve')}
                                              className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-2 py-0.5 rounded text-[9px] transition"
                                            >
                                              Approve & Activate 🇩🇿
                                            </button>
                                            <button
                                              onClick={() => handleConfirmPayment(m.id, 'reject')}
                                              className="bg-neutral-850 hover:bg-neutral-800 text-rose-450 font-bold px-2 py-0.5 rounded text-[9px] border border-neutral-800 transition"
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    <td className="px-5 py-4">
                                      <div className="space-y-1">
                                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase ${
                                          m.status === 'active' 
                                            ? 'bg-[#0f241a] text-emerald-400 border border-emerald-900/40' 
                                            : 'bg-rose-950/30 text-rose-400 border border-rose-905/30'
                                        }`}>
                                          <span className={`h-1 w-1 rounded-full ${m.status === 'active' ? 'bg-emerald-400' : 'bg-rose-450'}`} />
                                          <span>{m.status}</span>
                                        </span>
                                        {m.paymentStatus === 'approved' && (
                                          <div className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1">
                                            <span>✓ Paid (DZD approved)</span>
                                          </div>
                                        )}
                                      </div>
                                    </td>

                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                      <select
                                        value={m.plan}
                                        onChange={(e) => handleUpdatePlan(m.id, e.target.value as PlanType)}
                                        className="bg-[#070708] border border-neutral-800 p-1 rounded text-[11px] text-neutral-300 focus:outline-none focus:border-neutral-700 transition"
                                      >
                                        <option value="Basic">Basic Model (500 Msg)</option>
                                        <option value="Pro">Pro Model (2000 Msg)</option>
                                        <option value="Premium">Premium Model (Unlimited)</option>
                                        {plans.filter(p => !['Basic', 'Pro', 'Premium'].includes(p.name)).map(p => (
                                          <option key={p.id} value={p.name}>{p.name} ({p.messageLimit === -1 || p.messageLimit >= 999999 ? 'Unlimited' : `${p.messageLimit} Msg`})</option>
                                        ))}
                                      </select>
                                      {(() => {
                                        const foundP = plans.find(p => p.name.toLowerCase() === m.plan.toLowerCase());
                                        const dzdPrice = foundP ? foundP.priceDZD : (m.plan === 'Basic' ? 2000 : m.plan === 'Pro' ? 5000 : m.plan === 'Premium' ? 10000 : 0);
                                        return (
                                          <div className="text-[10px] text-neutral-400 font-mono mt-1 font-semibold">{dzdPrice.toLocaleString()} DZD</div>
                                        );
                                      })()}
                                    </td>

                                    <td className="px-5 py-4 text-center font-mono">
                                      <span className="text-xs text-neutral-300 font-bold bg-[#070708] px-2 py-0.5 border border-neutral-900 rounded">
                                        {m.messageCount}
                                      </span>
                                    </td>

                                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => toggleStatus(m.id, m.status)}
                                        className={`p-1 px-2 rounded-[6px] text-[9px] font-bold tracking-wider uppercase border transition cursor-pointer ${
                                          m.status === 'active'
                                            ? 'bg-rose-950/20 text-rose-400 border-rose-900/30 hover:bg-rose-950/40'
                                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/40'
                                        }`}
                                      >
                                        {m.status === 'active' ? 'Suspend' : 'Activate'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {selectedMerchant && (
                      <div className="p-6 bg-[#0c0c10] border-t border-neutral-900 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4 text-neutral-400" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-350">
                            Configure Store Bot Meta Identifiers
                          </h4>
                        </div>

                        <form onSubmit={handleSaveBotConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">
                              Custom Brand Persona / Prompt Instructions (Gemini AI System Prompts)
                            </label>
                            <textarea
                              rows={3}
                              value={botIdentity}
                              onChange={(e) => setBotIdentity(e.target.value)}
                              placeholder="e.g. You are an AI automated help bot for Bella Boutique. Be elegant and talk about floral shoes."
                              className="w-full block bg-[#070708] border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition"
                            />
                            <span className="text-[10px] text-neutral-500 mt-1 block">
                              Our automated backend appends these rules directly as SystemInstructions to Google Gemini AI calls.
                            </span>
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                              Facebook Page ID (Page ID key)
                            </label>
                            <input
                              type="text"
                              value={facebookPageId}
                              onChange={(e) => setFacebookPageId(e.target.value)}
                              placeholder="e.g. page_floral_boutique"
                              className="w-full block bg-[#070708] border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                              Webhook Verify Token (Subscribe Handshake)
                            </label>
                            <input
                              type="text"
                              value={verifyToken}
                              onChange={(e) => setVerifyToken(e.target.value)}
                              placeholder="e.g. token_secret"
                              className="w-full block bg-[#070708] border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono"
                            />
                          </div>

                          <div className="md:col-span-2 flex justify-end">
                            <button
                              type="submit"
                              disabled={isSavingConfig}
                              className="px-4 py-2 bg-neutral-100 hover:bg-white text-[#070708] rounded-xl text-xs font-bold tracking-wide transition shadow-lg flex items-center space-x-2 cursor-pointer"
                            >
                              {isSavingConfig ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-neutral-900" />
                              ) : (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Update AI Brand Settings</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* RIGHT: CHAT WEBHOOK SIMULATOR WORKSPACE (5 Cols) */}
                  <div className="lg:col-span-12 xl:col-span-5 lg:col-start-1 xl:col-start-8 lg:row-start-2 xl:row-start-1 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden space-y-6">
                    <div>
                      <div className="flex items-center justify-between border-b border-[#21212c] pb-4">
                        <div className="flex items-center space-x-2.5">
                          <Bot className="h-5 w-5 text-emerald-400" />
                          <div>
                            <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                              Sandbox Webhook Simulator
                            </h3>
                            <span className="text-[10px] text-neutral-400 block font-mono">
                              Recipient Store: {selectedMerchant ? selectedMerchant.name : 'No store selected'}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded px-2.5 py-0.5 uppercase font-mono tracking-widest font-bold">
                          Step 2 Agent
                        </span>
                      </div>

                      {selectedMerchant ? (
                        <div className="space-y-5 pt-4">
                          {/* BOT INFO */}
                          <div className="bg-[#070708] border border-neutral-900 rounded-xl p-4.5 text-xs text-neutral-350 space-y-2">
                            <div className="flex items-center space-x-2 text-neutral-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold uppercase tracking-wider text-[10px]">Active Simulated Persona</span>
                            </div>
                            <p className="font-sans leading-relaxed text-xs italic text-neutral-450 text-wrap whitespace-normal">
                              "{selectedMerchant.botIdentity || 'No Custom prompt identity set.'}"
                            </p>
                            <div className="flex space-x-4 pt-1 border-t border-neutral-900/80 font-mono text-[9px] text-neutral-500">
                              <span>Page ID: {selectedMerchant.facebookPageId}</span>
                              <span>Verify Token: {selectedMerchant.verifyToken}</span>
                            </div>
                          </div>

                          {/* SAMPLE PROMPTS SELECTOR */}
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1aa] block mb-2">
                              Quick-Test Questions:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => insertQuickText("Hi, do you have any red floral dresses on sale?")}
                                className="px-2.5 py-1 text-[11px] bg-[#070708] border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg transition text-left cursor-pointer"
                              >
                                Ask recommendation
                              </button>
                              <button
                                type="button"
                                onClick={() => insertQuickText("What are your specials today and what is the cost?")}
                                className="px-2.5 py-1 text-[11px] bg-[#070708] border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg transition text-left cursor-pointer"
                              >
                                Query specials & pricing
                              </button>
                              <button
                                type="button"
                                onClick={() => insertQuickText("Where is your shop located? Can I come over?")}
                                className="px-2.5 py-1 text-[11px] bg-[#070708] border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg transition text-left cursor-pointer"
                              >
                                Request store location
                              </button>
                            </div>
                          </div>

                          {/* SIMULATED MESSENGER INTERFACE */}
                          <form onSubmit={handleSimulateWebhook} className="space-y-3.5">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5">
                                Simulated Incoming Messenger Text:
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Type your simulated customer message..."
                                  value={simulatedMessage}
                                  onChange={(e) => setSimulatedMessage(e.target.value)}
                                  className="w-full pr-12 pl-4 py-3 bg-[#070708] border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-neutral-750 transition placeholder-neutral-650"
                                />
                                <button
                                  type="submit"
                                  disabled={isSimulating || !simulatedMessage.trim()}
                                  className="absolute right-2 top-1.5 p-2 bg-neutral-100 hover:bg-white text-[#070708] rounded-lg transition cursor-pointer"
                                  title="Submit simulated webhook packet"
                                >
                                  {isSimulating ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-neutral-900" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </form>

                          {/* LIVE CONSOLE LOGS TRACE */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-wider text-neutral-450">
                              <Terminal className="h-3.5 w-3.5 text-neutral-500" />
                              <span className="font-bold">Real-time Webhook Console Trace</span>
                            </div>

                            <div className="bg-[#040405] border border-neutral-[#151522] rounded-xl p-4 font-mono text-[10px] text-neutral-400 space-y-2.5 max-h-[180px] overflow-y-auto">
                              {simulationTrace.length === 0 ? (
                                <div className="text-neutral-600 italic py-4 text-center select-none text-[11px]">
                                  No simulated events captured yet. Send a message to trace pipeline execution states.
                                </div>
                              ) : (
                                simulationTrace.map((log, index) => {
                                  let color = "text-neutral-400";
                                  if (log.includes("[BLOCKED]") || log.includes("[ERROR]")) color = "text-rose-400";
                                  if (log.includes("[Outgoing") || log.includes("[6]")) color = "text-emerald-400";
                                  if (log.includes("[5]")) color = "text-yellow-400";
                                  return (
                                    <div key={index} className={`leading-normal border-b border-neutral-950/40 pb-1 ${color}`}>
                                      {log}
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* OUTPUT RESPONSE BUBBLE */}
                            {simulatorReply && (
                              <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#181822]/40 border border-emerald-950/40 rounded-2xl p-4.5 space-y-2.5 relative"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-emerald-400">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[10px] tracking-wider uppercase font-bold">Bot reply received</span>
                                  </div>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isRealAIResponse ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'}`}>
                                    {isRealAIResponse ? 'LIVE GEMINI 3.5 AI RESPONSE' : 'MOCK CLASSIFIER REPLY'}
                                  </span>
                                </div>
                                <div className="p-3 bg-neutral-950/70 border border-neutral-[#151522] rounded-xl text-neutral-100 text-xs italic font-sans leading-relaxed text-wrap whitespace-normal">
                                  "{simulatorReply}"
                                </div>
                                <div className="text-[9px] text-neutral-500 font-mono text-right">
                                  Sent back via Meta Send Graph API protocol
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-24 text-center text-neutral-600 select-none">
                          <HelpCircle className="h-10 w-10 mx-auto text-neutral-850 mb-3" />
                          <h4 className="text-xs font-semibold">Select a Store profile to load simulator</h4>
                          <p className="text-[11px] mt-1 max-w-[220px] mx-auto text-neutral-500">
                            Select any customer profile from the database store tree on the left.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-neutral-900 text-center">
                      <span className="text-[9.5px] tracking-wider text-neutral-600 font-mono uppercase block">
                        Mocking dynamic webhook pipeline logic • Step 2 compliant
                      </span>
                    </div>
                  </div>

                </div>

                {/* MODAL FOR REGISTERING NEW MERCHANT */}
                <AnimatePresence>
                  {showAddModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0e0e12] border border-neutral-800/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
                      >
                        <div className="px-6 py-5 border-b border-neutral-[#22222e] flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">Enroll Merchant Customer profile</h4>
                          <button 
                            onClick={() => setShowAddModal(false)}
                            className="text-neutral-400 hover:text-white text-xs cursor-pointer font-bold"
                          >
                            Cancel
                          </button>
                        </div>

                        <form onSubmit={handleAddMerchant} className="p-6 space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1.5">
                              Merchant name
                            </label>
                            <input
                              type="text"
                              required
                              value={newMerchantName}
                              onChange={(e) => setNewMerchantName(e.target.value)}
                              placeholder="e.g. Bella Boutique"
                              className="block w-full px-3.5 py-2.5 bg-[#070708] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1.5">
                              Store Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={newMerchantEmail}
                              onChange={(e) => setNewMerchantEmail(e.target.value)}
                              placeholder="e.g. sales@bellaboutique.com"
                              className="block w-full px-3.5 py-2.5 bg-[#070708] border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#a1a1aa] mb-1.5">
                              Initial Subscription tier
                            </label>
                            <div className="grid grid-cols-3 gap-2.5">
                              {['Basic', 'Pro', 'Premium'].map((plan) => (
                                <button
                                  key={plan}
                                  type="button"
                                  onClick={() => setNewMerchantPlan(plan as PlanType)}
                                  className={`py-2 px-3 border rounded-xl text-xs font-bold cursor-pointer transition ${
                                    newMerchantPlan === plan
                                      ? 'bg-neutral-100 border-neutral-100 text-neutral-950'
                                      : 'bg-[#070708] border-neutral-800 text-neutral-450 hover:border-neutral-700'
                                  }`}
                                >
                                  {plan}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-end">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-neutral-100 hover:bg-white text-[#070708] rounded-xl text-xs font-bold tracking-wider transition shadow-lg cursor-pointer animate-pulse"
                            >
                              {isSubmitting ? 'Registering...' : 'Complete enrollment'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
            {activeTab === 'code' && (
              // STEP 2 REPLIT PYTHON CODE GUIDE
              <div id="code-config-panel" className="relative space-y-6">
                
                {/* HERO REFERENCE CARD */}
                <div className="bg-gradient-to-br from-[#0e0e12] to-[#070708] border border-neutral-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Database className="h-44 w-44 text-white" />
                  </div>
                  <div className="max-w-xl">
                    <span className="px-2.5 py-1 text-[9px] bg-[#181822] border border-neutral-800 text-emerald-400 rounded-md font-bold font-mono uppercase tracking-wider">
                      STEP 2 TUTORIAL
                    </span>
                    <h2 className="text-xl font-bold text-white mt-3 tracking-tight">
                      Deploy Python FastAPI Webhook Handler
                    </h2>
                    <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                      We have upgraded your zero-budget Python FastAPI code to fully support Meta Messenger API payloads, webhook registration handshake (`GET /api/webhook`), and automated Gemini AI text answers!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* STEP BY STEP TUTORIAL GUIDE */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#0e0e12] border border-neutral-900 rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                        Configuration Instructions
                      </h3>
                      
                      <div className="space-y-4 text-xs">
                        <div className="flex space-x-3">
                          <span className="h-5 w-5 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                          <div>
                            <h4 className="font-bold text-white">Create on Replit</h4>
                            <p className="text-neutral-450 text-[11px] mt-0.5">Start or open your Python Repl of type **FastAPI**.</p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <span className="h-5 w-5 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                          <div>
                            <h4 className="font-bold text-white">Secrets Configuration</h4>
                            <p className="text-neutral-[#a1a1aa] text-[11px] mt-0.5">Under Tools &gt; Secrets define:</p>
                            <span className="font-mono text-[9px] text-[#22c55e] bg-neutral-950 px-1 py-0.5 rounded block mt-1">GEMINI_API_KEY = [Your-Gemini-API-Key]</span>
                            <span className="font-mono text-[9px] text-neutral-450 bg-neutral-950 px-1 py-0.5 rounded block mt-0.5">DATABASE_URL = [PostgreSQL string URL]</span>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <span className="h-5 w-5 bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                          <div>
                            <h4 className="font-bold text-white">Register Meta Webhook</h4>
                            <p className="text-[#a1a1aa] text-[11px] mt-0.5">In Facebook Developers Messenger Configuration:</p>
                            <p className="text-[#a1a1aa] text-[11px] mt-0.5">1. Set Callback URL: <code className="bg-neutral-950 p-1 rounded text-[#22c55e]">https://[your-repl].replit.app/api/webhook</code></p>
                            <p className="text-[#a1a1aa] text-[11px] mt-0.5">2. Set Verify Token matching your merchant token (e.g., <code className="bg-neutral-950 p-1 rounded">bella_secret</code>)</p>
                            <p className="text-[#a1a1aa] text-[11px] mt-0.5">3. Complete verification & select page messages events subscription!</p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <span className="h-5 w-5 bg-[#14141d] text-emerald-400 border border-neutral-800 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                          <div>
                            <h4 className="font-bold text-white font-sans">Ready!</h4>
                            <p className="text-[#a1a1aa] text-[11px] mt-0.5">Whenever a customer chats, Meta will hit the POST endpoint, triggering Gemini AI automatically!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT CODES SECTION (2 Cols) */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* FILE 1: main.py */}
                    <div className="bg-[#0e0e12] border border-[#1d1d26] rounded-2xl overflow-hidden shadow-2xl">
                      <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-[#20202a] flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-bold font-mono text-white">main.py (FastAPI Code)</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(pythonMainCode, 'main.py')}
                          className="p-1 px-2 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-300 rounded transitions text-[10px] cursor-pointer font-bold flex items-center space-x-1"
                        >
                          {copiedFile === 'main.py' ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4 bg-neutral-950">
                        <pre className="text-[11px] font-mono leading-relaxed text-neutral-400 overflow-x-auto max-h-[400px]">
                          {pythonMainCode}
                        </pre>
                      </div>
                    </div>

                    {/* FILE 2: requirements.txt */}
                    <div className="bg-[#0e0e12] border border-neutral-900 rounded-xl overflow-hidden shadow-xl">
                      <div className="px-5 py-3 bg-neutral-950 border-b border-neutral-900 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileCode className="h-4 w-4 text-neutral-400" />
                          <span className="text-xs font-bold font-mono text-white">requirements.txt</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(pythonRequirementsCode, 'requirements.txt')}
                          className="p-1 px-2 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-neutral-300 rounded transition text-[10px] cursor-pointer font-bold flex items-center space-x-1"
                        >
                          {copiedFile === 'requirements.txt' ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Specs</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4 bg-neutral-950">
                        <pre className="text-[11px] font-mono leading-relaxed text-neutral-400 overflow-x-auto">
                          {pythonRequirementsCode}
                        </pre>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {activeTab === 'plans' && (
              <div id="plans-config-panel" className="space-y-6">
                
                {/* HERO REFERENCE CARD */}
                <div className="bg-[#0e0e12] border border-neutral-900 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Database className="h-44 w-44 text-white" />
                  </div>
                  <div className="max-w-xl">
                    <span className="px-2.5 py-1 text-[9px] bg-[#0f241a] border border-emerald-900/50 text-emerald-400 rounded-md font-bold font-mono uppercase tracking-wider">
                      Algerian Pricing Plans (DZD / DA) 🇩🇿
                    </span>
                    <h2 className="text-xl font-bold text-white mt-3 tracking-tight">
                      Manage Dynamic SaaS Tiers
                    </h2>
                    <p className="text-neutral-450 text-xs mt-1.5 leading-relaxed">
                      Create, edit and delete custom Algerian pricing plans priced in Algerian Dinar (DZD/DA). Adjust monthly limits or declare customized features. Newly created plans will be instantly available for assignment in the merchant lists.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* LEFT: ADD / EDIT PLAN FORM (1 Col) */}
                  <div className="lg:col-span-1 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-neutral-[#202029] pb-3">
                      <h3 className="text-xs font-bold tracking-widest text-[#a1a1aa] uppercase">
                        {editingPlanId ? 'Edit Pricing Plan 📁' : 'Create Dynamic Plan 🇩🇿'}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Declare subscription price in DZD and messaging capabilities.
                      </p>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-4 text-xs text-neutral-200">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-450 mb-1">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          required
                          value={planFormName}
                          onChange={(e) => setPlanFormName(e.target.value)}
                          placeholder="e.g. Pro, Premium, Gold, Professional"
                          className="w-full block bg-[#070708] border border-neutral-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-450 mb-1">
                          Price in DZD (month)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min={0}
                            value={planFormPrice}
                            onChange={(e) => setPlanFormPrice(Number(e.target.value))}
                            placeholder="e.g. 5000"
                            className="w-full block bg-[#070708] border border-neutral-800 rounded-xl py-2 px-3 pr-12 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono font-bold"
                          />
                          <span className="absolute right-3.5 top-2 text-[10px] text-neutral-500 font-bold font-mono">DZD</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-450">
                            Monthly Message Limit
                          </label>
                          <button
                            type="button"
                            onClick={() => setPlanFormLimit(planFormLimit === -1 ? 1000 : -1)}
                            className="text-[9px] text-emerald-450 font-bold hover:underline"
                          >
                            {planFormLimit === -1 ? 'Set Numeric Limit' : 'Make Unlimited'}
                          </button>
                        </div>
                        {planFormLimit === -1 ? (
                          <div className="bg-[#070708] border border-emerald-950 p-2.5 rounded-xl text-[11px] text-emerald-400 font-bold text-center">
                            ∞ Unlimited Messages (-1 value)
                          </div>
                        ) : (
                          <input
                            type="number"
                            required
                            min={1}
                            value={planFormLimit}
                            onChange={(e) => setPlanFormLimit(Number(e.target.value))}
                            placeholder="e.g. 2000"
                            className="w-full block bg-[#070708] border border-neutral-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-neutral-700 transition font-mono font-bold"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-450 mb-1">
                          Features list (One feature per line)
                        </label>
                        <textarea
                          rows={4}
                          value={planFormFeaturesText}
                          onChange={(e) => setPlanFormFeaturesText(e.target.value)}
                          placeholder="e.g.&#10;500 Messages limit&#10;Algerian Dialect bot&#10;Meta FB Integration"
                          className="w-full block bg-[#070708] border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-neutral-700 transition placeholder-neutral-700"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingPlan}
                          className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-white text-neutral-950 font-bold rounded-xl text-center cursor-pointer transition flex items-center justify-center space-x-1.5"
                        >
                          {isSavingPlan ? (
                            <RefreshCw className="h-3 w-3 animate-spin text-neutral-900" />
                          ) : (
                            <span>{editingPlanId ? 'Save Changes' : 'Create Tier Plan'}</span>
                          )}
                        </button>
                        {editingPlanId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(null);
                              setPlanFormName('');
                              setPlanFormPrice(2000);
                              setPlanFormLimit(500);
                              setPlanFormFeaturesText('');
                            }}
                            className="py-2 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-400 font-bold rounded-xl text-center cursor-pointer transition border border-neutral-800"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* RIGHT: PLANS LIST CATALOGUE GRID (2 Cols) */}
                  <div className="lg:col-span-2 bg-[#0e0e12] border border-neutral-900 rounded-2xl p-5 space-y-4">
                    <div className="border-b border-neutral-[#202029] pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                          Dynamic Pricing Options Dashboard
                        </h3>
                        <p className="text-[11px] text-neutral-500 mt-1">
                          Live list of active SaaS plans rendered dynamically in real-time.
                        </p>
                      </div>
                      <span className="font-mono text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-bold">
                        {plans.length + 3} Plans Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* DEFAULT PLANS SHOWN FOR CONVENIENCE */}
                      <div className="border border-neutral-900 p-4 rounded-xl space-y-3 bg-[#070708]/60 relative">
                        <div className="absolute top-2.5 right-2.5 text-[8px] tracking-wider uppercase bg-neutral-900 text-neutral-500 rounded border border-neutral-800 px-1 py-0.5">
                          System Default
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Basic Plan</h4>
                          <p className="text-[10px] font-mono text-neutral-400 mt-1 font-bold">2,000 DZD / month</p>
                        </div>
                        <ul className="text-[10px] text-neutral-500 space-y-1">
                          <li>• 500 Messages limit</li>
                          <li>• Standard FB Messenger agent proxy</li>
                          <li>• Algerian Dialect bot option</li>
                        </ul>
                      </div>

                      <div className="border border-neutral-900 p-4 rounded-xl space-y-3 bg-[#070708]/60 relative">
                        <div className="absolute top-2.5 right-2.5 text-[8px] tracking-wider uppercase bg-neutral-900 text-neutral-500 rounded border border-neutral-800 px-1 py-0.5">
                          System Default
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Pro Plan</h4>
                          <p className="text-[10px] font-mono text-yellow-500 mt-1 font-bold">5,000 DZD / month</p>
                        </div>
                        <ul className="text-[10px] text-neutral-500 space-y-1">
                          <li>• 2,000 Messages limit</li>
                          <li>• Advanced FB Messenger agent proxy</li>
                          <li>• Fast-response times on Gemini AI</li>
                        </ul>
                      </div>

                      <div className="border border-neutral-900 p-4 rounded-xl space-y-3 bg-[#070708]/60 relative col-span-1 md:col-span-2">
                        <div className="absolute top-2.5 right-2.5 text-[8px] tracking-wider uppercase bg-neutral-900 text-neutral-500 rounded border border-neutral-800 px-1 py-0.5">
                          System Default
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Premium Plan</h4>
                          <p className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">10,000 DZD / month</p>
                        </div>
                        <ul className="text-[10px] text-neutral-500 space-y-1">
                          <li>• Unlimited messages</li>
                          <li>• Custom FAQ assistant integration options</li>
                        </ul>
                      </div>

                      {/* CLIENT DYNAMIC PLANS */}
                      {plans.map((p) => (
                        <div key={p.id} className="border border-neutral-800 p-4 rounded-xl space-y-3 bg-[#070708] hover:border-neutral-700 transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white">{p.name}</h4>
                              <p className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                                {p.priceDZD.toLocaleString()} DZD / month
                              </p>
                            </div>
                            <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingPlanId(p.id);
                                  setPlanFormName(p.name);
                                  setPlanFormPrice(p.priceDZD);
                                  setPlanFormLimit(p.messageLimit);
                                  setPlanFormFeaturesText((p.features || []).join('\n'));
                                }}
                                className="text-neutral-400 hover:text-white px-1 py-0.5 text-[10px] font-bold cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePlan(p.id)}
                                className="text-rose-450 hover:text-rose-350 px-1 py-0.5 text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <ul className="text-[10px] text-neutral-400 space-y-1 pt-1.5 border-t border-neutral-900">
                            <li>• Limit: <strong>{p.messageLimit === -1 ? 'Unlimited' : p.messageLimit.toLocaleString()} Msg</strong></li>
                            {(p.features || []).map((f, fi) => (
                              <li key={fi}>• {f}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
