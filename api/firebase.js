const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        const serviceAccountConfig = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountConfig && serviceAccountConfig.length > 10) {
            const serviceAccount = JSON.parse(serviceAccountConfig);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin successfully initialized.");
        } else {
            // Do NOT call initializeApp() empty, this throws CONFIGURATION_NOT_FOUND in Vercel function edge instances
            console.warn("Firebase Admin NOT initialized. Add FIREBASE_SERVICE_ACCOUNT_KEY to your Vercel Environment Variables to use Auth Middleware.");
        }
    }
} catch (e) {
    console.error("Firebase init error", e);
}

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = { admin, verifyToken };
