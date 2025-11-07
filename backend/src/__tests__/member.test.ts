import request from "supertest";
import app from "../server";
import prisma from "../lib/prisma";

describe("Member API", () => {
  let approvedToken: string;
  let memberId: string;

  beforeAll(async () => {
    // Criar e aprovar uma intenção para testes
    const createResponse = await request(app).post("/api/intentions").send({
      name: "Teste Membro",
      email: "membro@example.com",
      company: "Teste Corp",
      reason: "Testes",
    });

    const intentionId = createResponse.body.data.id;

    const approveResponse = await request(app)
      .patch(`/api/intentions/${intentionId}/approve`)
      .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`);

    approvedToken = approveResponse.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/members/register/:token", () => {
    it("should complete member registration with valid token", async () => {
      const memberData = {
        phone: "+55 11 98765-4321",
        linkedin: "https://linkedin.com/in/testemembro",
        profession: "Desenvolvedor",
        segment: "Tecnologia",
        companyDescription: "Empresa de software",
      };

      const response = await request(app)
        .post(`/api/members/register/${approvedToken}`)
        .send(memberData)
        .expect(201);

      expect(response.body.message).toBe(
        "Cadastro completo realizado com sucesso!",
      );
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.phone).toBe(memberData.phone);
      expect(response.body.data.profession).toBe(memberData.profession);
      expect(response.body.data.isActive).toBe(true);

      memberId = response.body.data.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post(`/api/members/register/fake-token`)
        .send({ phone: "123456789" })
        .expect(400);

      expect(response.body.error).toContain("obrigatórios");
    });

    it("should return 409 if token already used", async () => {
      const response = await request(app)
        .post(`/api/members/register/${approvedToken}`)
        .send({
          phone: "+55 11 98765-4321",
          profession: "Desenvolvedor",
          segment: "Tecnologia",
        })
        .expect(409);

      expect(response.body.error).toBe("Cadastro já foi completado");
    });
  });

  describe("GET /api/members (Admin)", () => {
    it("should list all members", async () => {
      const response = await request(app)
        .get("/api/members")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      const member = response.body.data[0];
      expect(member).toHaveProperty("id");
      expect(member).toHaveProperty("intention");
      expect(member).toHaveProperty("_count");
    });

    it("should filter active members", async () => {
      const response = await request(app)
        .get("/api/members?isActive=true")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      response.body.data.forEach((member: any) => {
        expect(member.isActive).toBe(true);
      });
    });
  });

  describe("GET /api/members/:id (Admin)", () => {
    it("should get member by id", async () => {
      const response = await request(app)
        .get(`/api/members/${memberId}`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data.id).toBe(memberId);
      expect(response.body.data).toHaveProperty("intention");
      expect(response.body.data).toHaveProperty("indicationsGiven");
      expect(response.body.data).toHaveProperty("indicationsReceived");
    });

    it("should return 404 for non-existent member", async () => {
      const response = await request(app)
        .get("/api/members/non-existent-id")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(404);

      expect(response.body.error).toBe("Membro não encontrado");
    });
  });

  describe("GET /api/members/stats (Admin)", () => {
    it("should return member statistics", async () => {
      const response = await request(app)
        .get("/api/members/stats")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("members");
      expect(response.body.data.members).toHaveProperty("total");
      expect(response.body.data.members).toHaveProperty("active");
      expect(response.body.data.members).toHaveProperty("inactive");
      expect(response.body.data).toHaveProperty("referrals");
      expect(response.body.data).toHaveProperty("thanks");
    });
  });

  describe("PATCH /api/members/:id (Admin)", () => {
    it("should update member data", async () => {
      const updateData = {
        phone: "+55 11 99999-8888",
        profession: "Desenvolvedor Senior",
      };

      const response = await request(app)
        .patch(`/api/members/${memberId}`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Membro atualizado com sucesso");
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.profession).toBe(updateData.profession);
    });
  });

  describe("PATCH /api/members/:id/deactivate (Admin)", () => {
    it("should deactivate a member", async () => {
      const response = await request(app)
        .patch(`/api/members/${memberId}/deactivate`)
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.message).toBe("Membro desativado com sucesso");
      expect(response.body.data.isActive).toBe(false);
    });
  });
});
