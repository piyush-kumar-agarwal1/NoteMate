const User = require('../models/users.model');

async function getMe(req, res) {
    try {
        const user = await User.findOne({ email: req.usertoken.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getMe
};