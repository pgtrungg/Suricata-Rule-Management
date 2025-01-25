const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Tạo access token và refresh token
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,);
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        // Lưu refresh token vào cookie
        res.cookie('refreshToken', refreshToken);

        res.cookie('token', accessToken);
        res.status(200).json({ message: 'Login successful', user: { username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken; // Lấy refresh token từ cookie
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    try {
        // Xác minh refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Tạo token mới
        const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Gửi token mới cho client
        res.cookie('token', newAccessToken);
        res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
        console.error('Invalid or expired refresh token:', error);
        res.status(403).json({ message: 'Refresh token expired or invalid' });
    }
}
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
}
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (err) {
        console.error('Error registering:', err);
        res.status(500).json({ message: 'Failed to register' });
    }
}

