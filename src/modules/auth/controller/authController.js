import bcrypt from "bcrypt";
import { prisma } from "#/prisma.js";
import { generateToken } from "#/utils/jwt.js";
export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("req body",req.body)
    const user = await prisma.account.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = generateToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
};
