import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {

        console.log("===== isAuth CALLED =====");
        console.log("Headers Cookie:", req.headers.cookie);
        console.log("Cookies:", req.cookies);

        let { token } = req.cookies;

        if (!token) {
            return res.status(400).json({
                message: "user does not have a token"
            });
        }

        console.log("Headers Cookie:", req.headers.cookie);
        console.log("Cookies:", req.cookies);
        console.log("Token:", token);
        console.log("Token Type:", typeof token);

        if (typeof token !== "string") {
            return res.status(400).json({
                message: "Invalid token format",
                token,
                type: typeof token,
            });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!verifyToken) {
            return res.status(400).json({
                message: "user does not have a valid token"
            });
        }

        req.userId = verifyToken.userId;

        next();

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

export default isAuth;