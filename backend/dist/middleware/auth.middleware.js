import authService from '../services/auth.service.js';
// Authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Validate the session
        const user = await authService.validateSession(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        // Attach the user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export default { authenticate };
