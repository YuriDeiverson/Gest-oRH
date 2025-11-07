# 📘 Guia Prático de Componentes UI

Este guia fornece exemplos práticos de como usar os componentes do design system.

---

## 🔘 Button (Botão)

### Exemplo Básico

```tsx
import { Button } from "./components/ui";

// Botão primário padrão
<Button variant="primary">Clique Aqui</Button>;
```

### Todas as Variantes

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="md">Médio (padrão)</Button>
<Button size="lg">Grande</Button>
```

### Com Loading

```tsx
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={handleSubmit}>
  Salvar
</Button>;
```

### Com Ícone

```tsx
<Button icon={<span>🔍</span>}>Pesquisar</Button>
```

### Full Width

```tsx
<Button fullWidth variant="primary">
  Botão de Largura Completa
</Button>
```

---

## 📝 Input (Campo de Texto)

### Exemplo Básico

```tsx
import { Input } from "./components/ui";

<Input label="Nome" type="text" placeholder="Digite seu nome" />;
```

### Com Validação de Erro

```tsx
const [errors, setErrors] = useState({});

<Input
  label="Email"
  type="email"
  name="email"
  required
  fullWidth
  error={errors.email}
  placeholder="seu@email.com"
/>;
```

### Com Helper Text

```tsx
<Input label="Senha" type="password" helperText="Mínimo de 8 caracteres" />
```

### Com Ícone

```tsx
<Input label="Pesquisar" icon={<span>🔍</span>} placeholder="Buscar..." />
```

### Textarea

```tsx
import { Textarea } from "./components/ui";

<Textarea
  label="Mensagem"
  rows={5}
  placeholder="Digite sua mensagem..."
  helperText="Máximo de 500 caracteres"
/>;
```

---

## 📦 Card (Cartão)

### Card Simples

```tsx
import { Card, CardBody } from "./components/ui";

<Card variant="elevated">
  <CardBody>Conteúdo do card</CardBody>
</Card>;
```

### Card Completo

```tsx
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
} from "./components/ui";

<Card variant="elevated" padding="lg">
  <CardHeader
    title="Título do Card"
    subtitle="Subtítulo explicativo"
    action={<Badge variant="success">Novo</Badge>}
  />
  <CardBody>
    <p>Conteúdo principal do card com informações importantes.</p>
  </CardBody>
  <CardFooter align="right">
    <Button variant="outline">Cancelar</Button>
    <Button variant="primary">Confirmar</Button>
  </CardFooter>
</Card>;
```

### Card com Hover

```tsx
<Card variant="outlined" hoverable>
  <CardBody>Card clicável com efeito hover</CardBody>
</Card>
```

### Variantes de Card

```tsx
// Card com fundo cinza e borda
<Card variant="default">
  <CardBody>Default Card</CardBody>
</Card>

// Card com sombra elevada
<Card variant="elevated">
  <CardBody>Elevated Card</CardBody>
</Card>

// Card com borda destacada
<Card variant="outlined">
  <CardBody>Outlined Card</CardBody>
</Card>
```

---

## 🏷️ Badge (Etiqueta)

### Variantes

```tsx
import { Badge } from './components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

### Tamanhos

```tsx
<Badge size="sm">Pequeno</Badge>
<Badge size="md">Médio</Badge>
<Badge size="lg">Grande</Badge>
```

### Badge Dot (Indicador)

```tsx
<Badge variant="success" dot />
<Badge variant="error" dot />
```

### Exemplo Prático - Status

```tsx
const getStatusBadge = (status: string) => {
  const variants = {
    active: "success",
    pending: "warning",
    inactive: "error",
  };

  return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
};
```

---

## 💬 Alert (Alerta)

### Variantes

```tsx
import { Alert } from './components/ui';

<Alert variant="success" title="Sucesso!">
  Operação realizada com sucesso!
</Alert>

<Alert variant="error" title="Erro">
  Ocorreu um erro ao processar sua solicitação.
</Alert>

<Alert variant="warning" title="Atenção">
  Verifique os dados antes de continuar.
</Alert>

<Alert variant="info" title="Informação">
  Esta é uma mensagem informativa.
</Alert>
```

### Com Botão de Fechar

```tsx
const [showAlert, setShowAlert] = useState(true);

{
  showAlert && (
    <Alert
      variant="success"
      title="Bem-vindo!"
      onClose={() => setShowAlert(false)}
    >
      Sua conta foi criada com sucesso.
    </Alert>
  );
}
```

### Sem Título

```tsx
<Alert variant="info">Mensagem simples sem título</Alert>
```

---

## ⏳ Loading (Carregamento)

### Spinner (Padrão)

```tsx
import { Loading } from './components/ui';

<Loading />
<Loading size="sm" />
<Loading size="lg" />
```

### Com Texto

```tsx
<Loading size="lg" text="Carregando dados..." />
```

### Variante Dots

```tsx
<Loading variant="dots" />
<Loading variant="dots" size="lg" />
```

### Full Screen

```tsx
{
  isLoading && <Loading fullScreen size="lg" text="Processando..." />;
}
```

---

## 🎨 Exemplos Combinados

### Formulário Completo

```tsx
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Textarea,
  Button,
  Alert,
} from "./components/ui";

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // ... lógica de envio
  };

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader
        title="Entre em Contato"
        subtitle="Preencha o formulário abaixo"
      />

      <CardBody>
        {success && (
          <Alert variant="success" onClose={() => setSuccess(false)}>
            Mensagem enviada com sucesso!
          </Alert>
        )}

        {error && (
          <Alert variant="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <Input
            label="Nome"
            type="text"
            required
            fullWidth
            placeholder="Seu nome"
          />

          <Input
            label="Email"
            type="email"
            required
            fullWidth
            placeholder="seu@email.com"
          />

          <Textarea
            label="Mensagem"
            required
            fullWidth
            rows={5}
            placeholder="Digite sua mensagem..."
          />
        </form>
      </CardBody>

      <CardFooter align="right">
        <Button variant="outline" type="button">
          Limpar
        </Button>
        <Button variant="primary" type="submit" loading={loading}>
          Enviar
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Lista de Cards

```tsx
import { Card, CardHeader, CardBody, Badge, Button } from "./components/ui";

function UserList({ users }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {users.map((user) => (
        <Card key={user.id} variant="elevated" hoverable>
          <CardHeader
            title={user.name}
            subtitle={user.email}
            action={
              <Badge variant={user.active ? "success" : "error"}>
                {user.active ? "Ativo" : "Inativo"}
              </Badge>
            }
          />
          <CardBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div>
                <strong>Empresa:</strong> {user.company}
              </div>
              <div>
                <strong>Função:</strong> {user.role}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
```

### Dashboard com Filtros

```tsx
import { Button, Card, CardBody, Badge, Loading } from "./components/ui";

function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <Button
          variant={filter === "all" ? "primary" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={filter === "active" ? "primary" : "outline"}
          onClick={() => setFilter("active")}
        >
          Ativos
        </Button>
        <Button
          variant={filter === "inactive" ? "primary" : "outline"}
          onClick={() => setFilter("inactive")}
        >
          Inativos
        </Button>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <Loading size="lg" text="Carregando..." />
      ) : (
        <Card variant="elevated">
          <CardBody>{/* Conteúdo do dashboard */}</CardBody>
        </Card>
      )}
    </div>
  );
}
```

### Modal de Confirmação (Exemplo Conceitual)

```tsx
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Alert,
} from "./components/ui";

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Card variant="elevated" style={{ maxWidth: "500px", width: "90%" }}>
        <CardHeader title={title} />
        <CardBody>
          <Alert variant={type === "danger" ? "warning" : "info"}>
            {message}
          </Alert>
        </CardBody>
        <CardFooter align="right">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={type} onClick={onConfirm}>
            Confirmar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Uso:
<ConfirmationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleDelete}
  title="Confirmar Exclusão"
  message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
  type="danger"
/>;
```

---

## 🎯 Dicas de Uso

### Consistência

- Use sempre os mesmos componentes UI
- Mantenha a hierarquia de variantes (primary > secondary > outline)
- Siga os tamanhos padrão (sm, md, lg)

### Acessibilidade

- Sempre forneça labels nos inputs
- Use mensagens de erro descritivas
- Mantenha contraste adequado

### Performance

- Importe apenas os componentes necessários
- Use React.memo() quando apropriado
- Evite re-renders desnecessários

### Responsividade

- Use `fullWidth` em inputs em mobile
- Adapte grids com media queries
- Teste em diferentes tamanhos de tela

---

## 📱 Layout Responsivo

### Container Responsivo

```tsx
<div
  style={{
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "var(--spacing-6)",
  }}
>
  {/* Conteúdo */}
</div>
```

### Grid Responsivo

```tsx
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "var(--spacing-6)",
  }}
>
  {/* Cards */}
</div>
```

### Stack Vertical (Mobile)

```tsx
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-4)",
  }}
>
  {/* Componentes empilhados */}
</div>
```

---

## 🚀 Próximos Passos

Agora que você conhece os componentes básicos, explore:

1. Combine componentes para criar layouts complexos
2. Customize com CSS quando necessário (use variáveis do design system)
3. Crie seus próprios componentes seguindo os mesmos padrões
4. Contribua com novos componentes para a biblioteca!

---

**Documentação completa em:** `DESIGN_SYSTEM.md`
