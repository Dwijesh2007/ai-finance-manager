const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
    if (!admin.apps.length) {
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : null;

        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin successfully initialized.");
        } else {
            console.warn("Firebase Admin initialized without service account config. Perfect for local dev/testing without active Auth DB.");
            admin.initializeApp();
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
