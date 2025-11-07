import request from "supertest";
import app from "../server";
import prisma from "../lib/prisma";

describe("Referral API", () => {
  let member1Id: string;
  let member2Id: string;
  let referralId: string;

  beforeAll(async () => {
    // Criar dois membros para testes de indicações
    const members = await Promise.all([
      createMember("Membro 1", "membro1-ref@example.com"),
      createMember("Membro 2", "membro2-ref@example.com"),
    ]);

    member1Id = members[0];
    member2Id = members[1];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createMember(name: string, email: string): Promise<string> {
    const intentionResponse = await request(app).post("/api/intentions").send({
      name,
      email,
      company: "Test Company",
      reason: "Testing",
    });

    const approveResponse = await request(app)
      .patch(`/api/intentions/${intentionResponse.body.data.id}/approve`)
      .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`);

    const token = approveResponse.body.data.token;

    const memberResponse = await request(app)
      .post(`/api/members/register/${token}`)
      .send({
        phone: "+55 11 98765-4321",
        profession: "Empresário",
        segment: "Serviços",
      });

    return memberResponse.body.data.id;
  }

  describe("POST /api/referrals", () => {
    it("should create a new referral", async () => {
      const referralData = {
        giverId: member1Id,
        receiverId: member2Id,
        companyName: "Empresa Indicada",
        contactName: "João da Silva",
        contactInfo: "joao@empresa.com / (11) 99999-9999",
        opportunity: "Oportunidade de venda de software",
      };

      const response = await request(app)
        .post("/api/referrals")
        .send(referralData)
        .expect(201);

      expect(response.body.message).toBe("Indicação criada com sucesso!");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.status).toBe("NEW");
      expect(response.body.data.giverId).toBe(member1Id);
      expect(response.body.data.receiverId).toBe(member2Id);

      referralId = response.body.data.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/referrals")
        .send({
          giverId: member1Id,
          receiverId: member2Id,
        })
        .expect(400);

      expect(response.body.error).toBe("Todos os campos são obrigatórios");
    });

    it("should return 404 if member not found", async () => {
      const response = await request(app)
        .post("/api/referrals")
        .send({
          giverId: "non-existent",
          receiverId: member2Id,
          companyName: "Test",
          contactName: "Test",
          contactInfo: "Test",
          opportunity: "Test",
        })
        .expect(404);

      expect(response.body.error).toBe("Membro não encontrado");
    });
  });

  describe("GET /api/referrals/member/:memberId", () => {
    it("should list referrals for a member", async () => {
      const response = await request(app)
        .get(`/api/referrals/member/${member1Id}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it("should filter referrals given by member", async () => {
      const response = await request(app)
        .get(`/api/referrals/member/${member1Id}?type=given`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((referral: any) => {
        expect(referral.giverId).toBe(member1Id);
      });
    });

    it("should filter referrals received by member", async () => {
      const response = await request(app)
        .get(`/api/referrals/member/${member2Id}?type=received`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((referral: any) => {
        expect(referral.receiverId).toBe(member2Id);
      });
    });
  });

  describe("GET /api/referrals/:id", () => {
    it("should get referral by id", async () => {
      const response = await request(app)
        .get(`/api/referrals/${referralId}`)
        .expect(200);

      expect(response.body.data.id).toBe(referralId);
      expect(response.body.data).toHaveProperty("giver");
      expect(response.body.data).toHaveProperty("receiver");
    });

    it("should return 404 for non-existent referral", async () => {
      const response = await request(app)
        .get("/api/referrals/non-existent-id")
        .expect(404);

      expect(response.body.error).toBe("Indicação não encontrada");
    });
  });

  describe("PATCH /api/referrals/:id/status", () => {
    it("should update referral status to IN_CONTACT", async () => {
      const response = await request(app)
        .patch(`/api/referrals/${referralId}/status`)
        .send({ status: "IN_CONTACT" })
        .expect(200);

      expect(response.body.message).toBe("Status atualizado com sucesso");
      expect(response.body.data.status).toBe("IN_CONTACT");
    });

    it("should update referral status to NEGOTIATING", async () => {
      const response = await request(app)
        .patch(`/api/referrals/${referralId}/status`)
        .send({ status: "NEGOTIATING" })
        .expect(200);

      expect(response.body.data.status).toBe("NEGOTIATING");
    });

    it("should update referral status to CLOSED", async () => {
      const response = await request(app)
        .patch(`/api/referrals/${referralId}/status`)
        .send({ status: "CLOSED" })
        .expect(200);

      expect(response.body.data.status).toBe("CLOSED");
    });

    it("should return 400 for invalid status", async () => {
      const response = await request(app)
        .patch(`/api/referrals/${referralId}/status`)
        .send({ status: "INVALID_STATUS" })
        .expect(400);

      expect(response.body.error).toContain("Status inválido");
    });
  });

  describe("GET /api/referrals/stats (Admin)", () => {
    it("should return referral statistics", async () => {
      const response = await request(app)
        .get("/api/referrals/stats")
        .set("Authorization", `Bearer ${process.env.ADMIN_TOKEN}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("total");
      expect(response.body.data).toHaveProperty("byStatus");
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/referrals/:id", () => {
    it("should update referral data", async () => {
      const updateData = {
        companyName: "Empresa Atualizada",
        contactName: "Maria Santos",
        contactInfo: "maria@empresa.com",
        opportunity: "Nova oportunidade de parceria",
        status: "NEW",
      };

      const response = await request(app)
        .patch(`/api/referrals/${referralId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Indicação atualizada com sucesso");
      expect(response.body.data.companyName).toBe(updateData.companyName);
    });
  });

  describe("DELETE /api/referrals/:id", () => {
    it("should delete a referral", async () => {
      const response = await request(app)
        .delete(`/api/referrals/${referralId}`)
        .expect(200);

      expect(response.body.message).toBe("Indicação deletada com sucesso");

      // Verificar se foi realmente deletado
      await request(app).get(`/api/referrals/${referralId}`).expect(404);
    });
  });
});
