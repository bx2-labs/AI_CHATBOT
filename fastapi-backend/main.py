import os
import uuid
import httpx
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

# Import free google-genai SDK
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
ACCESS_TOKEN_EXPIRE_MINUTES = 480 # 8 Hours

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
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- SQLALCHEMY MODELS ---
class AdminDB(Base):
    __tablename__ = "admins"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class FAQDB(Base):
    __tablename__ = "merchant_faqs"
    id = Column(String, primary_key=True, default=lambda: f"faq-{uuid.uuid4().hex[:12]}")
    merchant_id = Column(String, index=True, nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)

class MerchantDB(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    plan = Column(String, default="Basic") # Basic, Pro, Premium
    status = Column(String, default="active") # active, suspended, pending
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # --- New Fields Added for Step 2 Webhooks ---
    bot_identity = Column(String, nullable=True)
    facebook_page_id = Column(String, nullable=True)
    verify_token = Column(String, nullable=True)
    password = Column(String, default="password123")

# Create tables if they do not exist
Base.metadata.create_all(bind=engine)

# --- DEPENDENCY ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS ---
class FAQCreateSchema(BaseModel):
    question: str
    answer: str

class FAQResponseSchema(BaseModel):
    id: str
    merchant_id: str
    question: str
    answer: str

    class Config:
        from_attributes = True

class MerchantCreateSchema(BaseModel):
    name: str
    email: EmailStr
    plan: Optional[str] = "Basic" # Basic, Pro, Premium
    status: Optional[str] = "active"

class MerchantUpdatePlanSchema(BaseModel):
    plan: str # Basic, Pro, Premium

class MerchantConfigSchema(BaseModel):
    bot_identity: Optional[str] = None
    facebook_page_id: Optional[str] = None
    verify_token: Optional[str] = None

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

class MerchantSignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    plan: Optional[str] = "Basic"

class MerchantLoginSchema(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AdminCreateSchema(BaseModel):
    email: EmailStr
    password: str

# --- APP INITIALIZATION ---
app = FastAPI(
    title="Messenger AI Chatbot SaaS Backend",
    description="SaaS platform backend with admin dashboard controls, plan management, and merchant tracking.",
    version="1.1.0"
)

# CORS Middlewares to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize free Gemini AI on configuration
def get_gemini_response(prompt: str, system_instruction: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return f"[Warning: GEMINI_API_KEY not set in Environment]. Default fallback reply processing: Hello! How can we assist you today?"
        
    if not GEMINI_AVAILABLE:
        return "[Error: google-genai package not found]. Fallback reply processing."

    try:
        # Client handles free requests cleanly
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )
        return response.text or "I missed that. Could you repeat?"
    except Exception as e:
        return f"Thanks for contacting us! We'll reply shortly. (Error: {str(e)})"


# Helper to verify JWT token and retrieve current admin
def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    admin = db.query(AdminDB).filter(AdminDB.email == token_data.email).first()
    if admin is None:
        raise credentials_exception
    return admin

# Seed Admin User on startup if empty schema
@app.on_event("startup")
def startup_populate_db():
    db = SessionLocal()
    # Check if we have any admin, if not seed default superadmin
    default_admin_email = "admin@chatbot.com"
    existing_admin = db.query(AdminDB).filter(AdminDB.email == default_admin_email).first()
    if not existing_admin:
        hashed_pw = get_password_hash("admin123")
        new_admin = AdminDB(
            id=str(uuid.uuid4()),
            email=default_admin_email,
            hashed_password=hashed_pw
        )
        db.add(new_admin)
        db.commit()
        print(f"[*] Default Admin created: {default_admin_email} / pass: admin123")
    db.close()


# --- API ENDPOINTS ---

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Messenger AI Chatbot SaaS Platform",
        "has_gemini_library": GEMINI_AVAILABLE,
        "endpoints": {
            "Admin Login": "/api/admin/login",
            "Merchants List": "/api/admin/merchants (Auth required)",
            "Add Merchant": "/api/admin/merchants (Auth required)",
            "Update Merchant Config": "/api/admin/merchants/{id}/config (Auth required)",
            "Meta Webhook GET (Verify)": "/api/webhook",
            "Meta Webhook POST (Events)": "/api/webhook"
        }
    }

# Admin standard JWT login
@app.post("/api/admin/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(AdminDB).filter(AdminDB.email == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": admin.email})
    return {"access_token": access_token, "token_type": "bearer"}


# Add a new merchant (Auth Required)
@app.post("/api/admin/merchants", response_model=MerchantResponseSchema, status_code=201)
def add_new_merchant(
    merchant: MerchantCreateSchema, 
    current_admin: AdminDB = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    existing = db.query(MerchantDB).filter(MerchantDB.email == merchant.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Merchant with this email address already exists")
    
    clean_name = "".join(c for c in merchant.name if c.isalnum() or c.isspace())
    slug_name = clean_name.lower().replace(" ", "_")

    db_merchant = MerchantDB(
        id=str(uuid.uuid4()),
        name=merchant.name,
        email=merchant.email,
        plan=merchant.plan,
        status=merchant.status if merchant.status else "active",
        message_count=0,
        bot_identity=f"You are a professional assistant for {merchant.name}. Answer customer warm and limit responses to 30 words.",
        facebook_page_id=f"page_{slug_name}_{uuid.uuid4().hex[:4]}",
        verify_token=f"token_verify_{slug_name}"
    )
    db.add(db_merchant)
    db.commit()
    db.refresh(db_merchant)
    return db_merchant


# Assign a plan to a merchant (Auth Required)
@app.put("/api/admin/merchants/{merchant_id}/plan", response_model=MerchantResponseSchema)
def assign_merchant_plan(
    merchant_id: str,
    payload: MerchantUpdatePlanSchema,
    current_admin: AdminDB = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    valid_plans = ["Basic", "Pro", "Premium"]
    if payload.plan not in valid_plans:
        raise HTTPException(status_code=400, detail="Invalid plan")
        
    db_merchant = db.query(MerchantDB).filter(MerchantDB.id == merchant_id).first()
    if not db_merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    db_merchant.plan = payload.plan
    db.commit()
    db.refresh(db_merchant)
    return db_merchant


# Update bot identity / Verify Token / FB Page settings
@app.put("/api/admin/merchants/{merchant_id}/config", response_model=MerchantResponseSchema)
def configure_merchant_bot(
    merchant_id: str,
    payload: MerchantConfigSchema,
    current_admin: AdminDB = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_merchant = db.query(MerchantDB).filter(MerchantDB.id == merchant_id).first()
    if not db_merchant:
        raise HTTPException(status_code=404, detail="Merchant profile not found")
        
    if payload.bot_identity is not None:
        db_merchant.bot_identity = payload.bot_identity
    if payload.facebook_page_id is not None:
        db_merchant.facebook_page_id = payload.facebook_page_id
    if payload.verify_token is not None:
        db_merchant.verify_token = payload.verify_token
        
    db.commit()
    db.refresh(db_merchant)
    return db_merchant


# View all merchants
@app.get("/api/admin/merchants", response_model=List[MerchantResponseSchema])
def list_all_merchants(
    current_admin: AdminDB = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(MerchantDB).all()


@app.post("/api/merchant/signup")
def merchant_signup(payload: MerchantSignupSchema, db: Session = Depends(get_db)):
    existing = db.query(MerchantDB).filter(MerchantDB.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Merchant with this email address already exists")
    
    clean_name = "".join(c for c in payload.name if c.isalnum() or c.isspace())
    slug_name = clean_name.lower().replace(" ", "_") or "brand"

    db_merchant = MerchantDB(
        id=f"merchant-{uuid.uuid4().hex[:8]}",
        name=payload.name,
        email=payload.email,
        plan=payload.plan if payload.plan else "Basic",
        status="active",
        message_count=0,
        bot_identity=f"You are a professional assistant for {payload.name}. Answer customers warmly and limit responses to 30 words.",
        facebook_page_id=f"page_{slug_name}_{uuid.uuid4().hex[:4]}",
        verify_token=f"token_verify_{slug_name}",
        password=payload.password
    )
    db.add(db_merchant)
    db.commit()
    db.refresh(db_merchant)
    return {
        "success": True,
        "message": "Merchant account registered successfully",
        "merchant": {
            "id": db_merchant.id,
            "name": db_merchant.name,
            "email": db_merchant.email,
            "plan": db_merchant.plan,
            "status": db_merchant.status,
            "message_count": db_merchant.message_count,
            "bot_identity": db_merchant.bot_identity,
            "facebook_page_id": db_merchant.facebook_page_id,
            "verify_token": db_merchant.verify_token
        }
    }


@app.post("/api/merchant/login")
def merchant_login(payload: MerchantLoginSchema, db: Session = Depends(get_db)):
    merchant = db.query(MerchantDB).filter(MerchantDB.email == payload.email).first()
    if not merchant:
        raise HTTPException(status_code=401, detail="No merchant found with this email")
    if merchant.status != "active":
        raise HTTPException(status_code=403, detail="Merchant profile is inactive")
    
    if payload.password == merchant.password or payload.password == merchant.verify_token:
        return {
            "success": True,
            "token": f"mock-merchant-token-{merchant.id}",
            "merchant": {
                "id": merchant.id,
                "name": merchant.name,
                "email": merchant.email,
                "plan": merchant.plan,
                "status": merchant.status,
                "message_count": merchant.message_count,
                "bot_identity": merchant.bot_identity,
                "facebook_page_id": merchant.facebook_page_id,
                "verify_token": merchant.verify_token
            }
        }
    raise HTTPException(status_code=401, detail="Incorrect password or security token")


# ===============================================
# ---- STEP 2: META MESSENGER WEBHOOK ROUTES -----
# ===============================================

# --- MERCHANT FAQ SYSTEM API ENDPOINTS ---

@app.get("/api/merchant/{id}/faqs", response_model=List[FAQResponseSchema])
def get_merchant_faqs(id: str, db: Session = Depends(get_db)):
    merchant = db.query(MerchantDB).filter(MerchantDB.id == id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return db.query(FAQDB).filter(FAQDB.merchant_id == id).all()

@app.post("/api/merchant/{id}/faqs", response_model=FAQResponseSchema)
def create_merchant_faq(id: str, payload: FAQCreateSchema, db: Session = Depends(get_db)):
    merchant = db.query(MerchantDB).filter(MerchantDB.id == id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    new_faq = FAQDB(
        merchant_id=id,
        question=payload.question.strip(),
        answer=payload.answer.strip()
    )
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq

@app.delete("/api/merchant/{id}/faqs/{faq_id}")
def delete_merchant_faq(id: str, faq_id: str, db: Session = Depends(get_db)):
    merchant = db.query(MerchantDB).filter(MerchantDB.id == id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
        
    faq = db.query(FAQDB).filter(FAQDB.id == faq_id, FAQDB.merchant_id == id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ item not found")
        
    db.delete(faq)
    db.commit()
    return {"success": True, "message": "FAQ successfully deleted"}


# ===============================================
# ---- STEP 2: META MESSENGER WEBHOOK ROUTES -----
# ===============================================

@app.get("/api/webhook")
@app.get("/webhook")
def verify_meta_webhook(
    hub_mode: Optional[str] = None,
    hub_verify_token: Optional[str] = None,
    hub_challenge: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Standard GET path used by Meta developers to authorize and connect 
    their Messenger Webhook connection safely.
    """
    if hub_mode == "subscribe" and hub_verify_token:
        # Cross-examine token with registered merchants
        matched = db.query(MerchantDB).filter(MerchantDB.verify_token == hub_verify_token).first()
        if matched:
            print(f"[*] Meta Webhook verified for merchant: {matched.name}")
            return int(hub_challenge) if (hub_challenge and hub_challenge.isdigit()) else hub_challenge
            
    raise HTTPException(status_code=403, detail="Verification token mismatch or mode unsupported")


@app.post("/api/webhook")
@app.post("/webhook")
async def receive_meta_webhook_event(payload: dict, db: Session = Depends(get_db)):
    """
    Standard POST path used by Meta servers to forward messages from customer clients.
    Checks plan quota limit, checks FAQ library first, then uses Gemini.
    """
    if payload.get("object") != "page":
        raise HTTPException(status_code=404, detail="Not supported")

    def clean_string(s: str) -> str:
        import re
        cleaned = s.lower().strip()
        return re.sub(r'[?.,!\u061f()]', '', cleaned).strip()

    for entry in payload.get("entry", []):
        page_id = entry.get("id")
        messaging = entry.get("messaging", [])
        
        # Pull matching store
        merchant = db.query(MerchantDB).filter(MerchantDB.facebook_page_id == page_id).first()
        if not merchant or merchant.status != "active":
            continue

        # Enforce quota limits
        limit = 100 if merchant.plan == "Basic" else 500 if merchant.plan == "Pro" else 2000
        if merchant.message_count >= limit:
            print(f"[*] Blocked: Merchant {merchant.name} has hit the maximum message count ({merchant.message_count}/{limit})")
            continue

        for event in messaging:
            if "message" in event and "text" in event["message"]:
                sender_id = event["sender"]["id"]
                message_text = event["message"]["text"]
                
                # Check for matching FAQ question first
                msg_clean = clean_string(message_text)
                matched_faq = None
                faqs_list = db.query(FAQDB).filter(FAQDB.merchant_id == merchant.id).all()
                
                for faq in faqs_list:
                    q_clean = clean_string(faq.question)
                    if msg_clean == q_clean or msg_clean in q_clean or q_clean in msg_clean:
                        matched_faq = faq
                        break

                if matched_faq:
                    bot_reply = matched_faq.answer
                    print(f"[*] FAQ match found: {matched_faq.question} -> {bot_reply}")
                else:
                    # Fetch identity prompt Instruction
                    sys_prompt = merchant.bot_identity or f"You are an AI assistant for {merchant.name}. Respond politely in under 30 words."
                    
                    # Request response via free Google Gemini
                    bot_reply = get_gemini_response(prompt=message_text, system_instruction=sys_prompt)
                
                # Increment metrics
                merchant.message_count += 1
                
                print(f"[*] Bot Auto-Reply to {sender_id}: {bot_reply}")
                
    db.commit()
    return "EVENT_RECEIVED"
