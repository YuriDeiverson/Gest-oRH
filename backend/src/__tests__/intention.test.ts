import request from "supertest";
import app from "../server";
import prisma from "../lib/prisma";

describe("Intention API", () => {
  beforeAll(async () => {
    // Limpar banco de dados antes dos testes
    await prisma.intention.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/intentions", () => {
    it("should create a new intention", async () => {
      const intentionData = {
        name: "João Silva",
        email: "joao@example.com",
        company: "Empresa XYZ",
        reason: "Quero expandir minha rede de contatos",
      };

      const response = await request(app)
        .post("/api/intentions")
        .send(intentionData)
        .expect(201);

      expect(response.body.message).toBe(
        "Intenção de participação enviada com sucesso!",
      );
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.email).toBe(intentionData.email);
      expect(response.body.data.status).toBe("PENDING");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/intentions")
        .send({ name: "João Silva" })
        .expect(400);

      expect(response.body.error).toBe("Todos os campos são obrigatórios");
    });

    it("should return 409 if email already exists", async () => {
      const intentionData = {
        name: "João Silva",
        email: "joao@example.com",
        company: "Empresa XYZ",
        reason: "Quero expandir minha rede",
      };

      await request(app)
        .post("/api/intentions")
        .send(intentionData)
        .expect(409);
    });
  });

  describe("GET /api/intentions (Admin)", () => {
    it("should return 401 without admin token", async () => {
      await request(app).get("/api/intentions").expect(401);
    });

    it("should list intentions with admin token", async () => {
      const response = await request(app)
        .get("/api/intentions")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should filter intentions by status", async () => {
      const response = await request(app)
        .get("/api/intentions?status=PENDING")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((intention: any) => {
        expect(intention.status).toBe("PENDING");
      });
    });
  });

  describe("PATCH /api/intentions/:id/approve (Admin)", () => {
    it("should approve an intention and generate token", async () => {
      // Primeiro, criar uma intenção
      const createResponse = await request(app).post("/api/intentions").send({
        name: "Maria Santos",
        email: "maria@example.com",
        company: "ABC Ltda",
        reason: "Networking",
      });

      const intentionId = createResponse.body.data.id;

      // Aprovar a intenção
      const response = await request(app)
        .patch(`/api/intentions/${intentionId}/approve`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.message).toBe("Intenção aprovada com sucesso!");
      expect(response.body.data.status).toBe("APPROVED");
      expect(response.body.data.token).toBeTruthy();
      expect(response.body.registrationLink).toBeTruthy();
    });

    it("should return 400 if intention is not pending", async () => {
      const createResponse = await request(app).post("/api/intentions").send({
        name: "Pedro Costa",
        email: "pedro@example.com",
        company: "DEF Ltda",
        reason: "Negócios",
      });

      const intentionId = createResponse.body.data.id;

      // Aprovar a primeira vez
      await request(app)
        .patch(`/api/intentions/${intentionId}/approve`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      // Tentar aprovar novamente
      const response = await request(app)
        .patch(`/api/intentions/${intentionId}/approve`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(400);

      expect(response.body.error).toBe(
        "Apenas intenções pendentes podem ser aprovadas",
      );
    });
  });

  describe("PATCH /api/intentions/:id/reject (Admin)", () => {
    it("should reject a pending intention", async () => {
      const createResponse = await request(app).post("/api/intentions").send({
        name: "Ana Lima",
        email: "ana@example.com",
        company: "GHI Corp",
        reason: "Parcerias",
      });

      const intentionId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/intentions/${intentionId}/reject`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.message).toBe("Intenção rejeitada");
      expect(response.body.data.status).toBe("REJECTED");
    });
  });

  describe("GET /api/intentions/validate/:token", () => {
    it("should validate a valid token", async () => {
      // Criar e aprovar uma intenção
      const createResponse = await request(app).post("/api/intentions").send({
        name: "Carlos Oliveira",
        email: "carlos@example.com",
        company: "JKL SA",
        reason: "Crescimento",
      });

      const intentionId = createResponse.body.data.id;

      const approveResponse = await request(app)
        .patch(`/api/intentions/${intentionId}/approve`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`);

      const token = approveResponse.body.data.token;

      // Validar o token
      const response = await request(app)
        .get(`/api/intentions/validate/${token}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.data.name).toBe("Carlos Oliveira");
      expect(response.body.data.email).toBe("carlos@example.com");
    });

    it("should return 404 for invalid token", async () => {
      const response = await request(app)
        .get("/api/intentions/validate/invalid-token")
        .expect(404);

      expect(response.body.error).toBe("Token inválido");
    });
  });
});
