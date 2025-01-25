const jwt = require("jsonwebtoken");

module.exports = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        console.log(token);
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Auth failed",
                    success: false,
                });
            } else {
                req.body.userId = decoded.id;
                next();
            }
        });
    } catch (error) {
        return res.status(401).send({
            message: "Auth failed",
            success: false,
        });
    }
};