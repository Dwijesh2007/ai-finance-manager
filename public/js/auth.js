// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAafX__be-OFBGPleEGX6NJ33-s8feCG9M",
    authDomain: "ai-finance-77385.firebaseapp.com",
    projectId: "ai-finance-77385",
    storageBucket: "ai-finance-77385.firebasestorage.app",
    messagingSenderId: "30909076871",
    appId: "1:30909076871:web:d6b05c600a8937a2f5af22"
};


let isDemoMode = false;

try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Listen for persistent auth state changes
        auth.onAuthStateChanged(user => {
            if (user) {
                initApp(user);
            } else {
                initApp(null);
            }
        });
    } else {
        console.warn("Real Firebase environment not configured. Transitioning to Intelligent Demo Mode for presentation.");
        isDemoMode = true;
        
        // Show login screen manually for demo
        initApp(null); 
    }
} catch (error) {
    console.error("Firebase SDK mounting error:", error);
    isDemoMode = true;
    initApp(null);
}

// UI Elements mapping
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');

let isLoginMode = true;

// Tab behavior for Auth Modal
tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authSubmitBtn.textContent = 'Login';
    authError.textContent = '';
});

tabRegister.addEventListener('click', () => {
    isLoginMode = false;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    authSubmitBtn.textContent = 'Register';
    authError.textContent = '';
});

// Primary auth execution handler
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    authError.textContent = '';

    if (isDemoMode) {
        // Bypass real auth purely for showcasing UI interactivity when API keys are not ready
        console.log("Demo Authentication Emulated gracefully.");
        
        // Simulating network delay
        authSubmitBtn.textContent = 'Authenticating...';
        authSubmitBtn.style.opacity = '0.7';

        setTimeout(() => {
            initApp({ email: email, uid: 'demo-user-123' });
            authSubmitBtn.textContent = 'Login';
            authSubmitBtn.style.opacity = '1';
        }, 800);
        return;
    }

    try {
        if (isLoginMode) {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } else {
            await firebase.auth().createUserWithEmailAndPassword(email, password);
            // In full stack flow, setup initial document map for user id in Firestore here
        }
    } catch (error) {
        authError.textContent = error.message;
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    if (isDemoMode) {
        initApp(null);
    } else {
        firebase.auth().signOut();
    }
});
