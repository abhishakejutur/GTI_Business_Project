import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { employeeId, password } = req.body;  

    try {
      const user = await prisma.$queryRaw`SELECT * FROM UserMaster WHERE EmployeeId = ${employeeId}`;

      if (user.length === 0) {
        return res.status(401).json({ error: "Invalid Employee ID or password." });
      }

      if (password !== user[0].Password) {
        return res.status(401).json({ error: "Invalid Employee ID or password." });
      }

      res.status(200).json({ employeeId: user[0].EmployeeId });
    } catch (error) {
      console.error("Internal server error:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
