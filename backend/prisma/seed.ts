import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar intenção de demonstração (membro principal)
  const demoIntention = await prisma.intention.upsert({
    where: { email: "demo@member.com" },
    update: {},
    create: {
      name: "João Silva Demo",
      email: "demo@member.com",
      company: "Tech Solutions Ltda",
      reason:
        "Quero expandir minha rede de contatos e gerar novas oportunidades de negócio",
      status: "APPROVED",
    },
  });

  console.log("✅ Intenção de demonstração criada:", demoIntention.email);

  // Criar membro de demonstração
  const demoMember = await prisma.member.upsert({
    where: { intentionId: demoIntention.id },
    update: {},
    create: {
      intentionId: demoIntention.id,
      phone: "+55 11 98765-4321",
      linkedin: "https://linkedin.com/in/joaosilva",
      profession: "Desenvolvedor Full Stack",
      segment: "Tecnologia da Informação",
      companyDescription:
        "Empresa de soluções tecnológicas com foco em desenvolvimento web e mobile",
      isActive: true,
    },
  });

  console.log("✅ Membro de demonstração criado:", demoMember.id);

  // Criar outros membros para indicações
  const member2Intention = await prisma.intention.upsert({
    where: { email: "maria@empresa.com" },
    update: {},
    create: {
      name: "Maria Santos",
      email: "maria@empresa.com",
      company: "Marketing Pro",
      reason: "Networking",
      status: "APPROVED",
    },
  });

  const member2 = await prisma.member.upsert({
    where: { intentionId: member2Intention.id },
    update: {},
    create: {
      intentionId: member2Intention.id,
      phone: "+55 11 91234-5678",
      profession: "Gerente de Marketing",
      segment: "Marketing Digital",
      isActive: true,
    },
  });

  const member3Intention = await prisma.intention.upsert({
    where: { email: "carlos@tech.com" },
    update: {},
    create: {
      name: "Carlos Oliveira",
      email: "carlos@tech.com",
      company: "DataCorp",
      reason: "Parcerias",
      status: "APPROVED",
    },
  });

  const member3 = await prisma.member.upsert({
    where: { intentionId: member3Intention.id },
    update: {},
    create: {
      intentionId: member3Intention.id,
      phone: "+55 11 99876-5432",
      profession: "Analista de Dados",
      segment: "Ciência de Dados",
      isActive: true,
    },
  });

  console.log("✅ Membros adicionais criados");

  // Criar indicações dadas pelo membro demo
  const referral1 = await prisma.referral.upsert({
    where: { id: "demo-referral-1" },
    update: {},
    create: {
      id: "demo-referral-1",
      giverId: demoMember.id,
      receiverId: member2.id,
      companyName: "XYZ Consultoria",
      contactName: "Ana Paula Silva",
      contactInfo: "ana.paula@xyzconsultoria.com | (11) 3456-7890",
      opportunity:
        "Projeto de desenvolvimento de sistema web para gestão de vendas",
      status: "IN_CONTACT",
    },
  });

  const referral2 = await prisma.referral.upsert({
    where: { id: "demo-referral-2" },
    update: {},
    create: {
      id: "demo-referral-2",
      giverId: demoMember.id,
      receiverId: member3.id,
      companyName: "ABC Tecnologia",
      contactName: "Roberto Lima",
      contactInfo: "roberto@abctech.com | (11) 2345-6789",
      opportunity: "Implementação de dashboard de análise de dados",
      status: "NEGOTIATING",
    },
  });

  console.log("✅ Indicações dadas criadas:", 2);

  // Criar indicações recebidas pelo membro demo
  const referral3 = await prisma.referral.upsert({
    where: { id: "demo-referral-3" },
    update: {},
    create: {
      id: "demo-referral-3",
      giverId: member2.id,
      receiverId: demoMember.id,
      companyName: "StartupTech",
      contactName: "Fernando Costa",
      contactInfo: "fernando@startuptech.com | (11) 98765-4321",
      opportunity: "Desenvolvimento de aplicativo mobile para delivery",
      status: "NEW",
    },
  });

  const referral4 = await prisma.referral.upsert({
    where: { id: "demo-referral-4" },
    update: {},
    create: {
      id: "demo-referral-4",
      giverId: member3.id,
      receiverId: demoMember.id,
      companyName: "Digital Solutions",
      contactName: "Juliana Martins",
      contactInfo: "juliana@digitalsol.com | (11) 99999-8888",
      opportunity: "Modernização de sistema legado em empresa de logística",
      status: "CLOSED",
    },
  });

  console.log("✅ Indicações recebidas criadas:", 2);

  console.log("\n📧 Credenciais de demonstração:");
  console.log("   Email: demo@member.com");
  console.log("\n📊 Dados mockados:");
  console.log("   - Indicações dadas: 2");
  console.log("   - Indicações recebidas: 2");
  console.log("   - Outros membros: 2");
  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
