import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
export const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, passwordHash, role });
        res.status(201).json(user);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
