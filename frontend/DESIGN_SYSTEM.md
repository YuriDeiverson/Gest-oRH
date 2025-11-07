# Design System

Este documento descreve o sistema de design da plataforma, inspirado no **Apple Human Interface Guidelines**, com foco em minimalismo, clareza e usabilidade.

## 🎨 Filosofia de Design

### Princípios Fundamentais

1. **Clareza** - O conteúdo é rei. Hierarquia visual clara e consistente.
2. **Deferência** - A UI deve facilitar a compreensão sem competir com o conteúdo.
3. **Profundidade** - Camadas visuais e movimentos realistas criam hierarquia.

### Características

- Design minimalista e limpo
- Espaçamento generoso e respiro visual
- Tipografia clara e legível
- Cores neutras com acentos sutis
- Animações suaves e funcionais
- Foco em acessibilidade

---

## 🎨 Paleta de Cores

### Cores Neutras (Grays)

```css
--color-white: #ffffff
--color-gray-50: #f9fafb
--color-gray-100: #f3f4f6
--color-gray-200: #e5e7eb
--color-gray-300: #d1d5db
--color-gray-400: #9ca3af
--color-gray-500: #6b7280
--color-gray-600: #4b5563
--color-gray-700: #374151
--color-gray-800: #1f2937
--color-gray-900: #111827
```

### Cores Primárias (Blue - Apple)

```css
--color-primary-300: #7dd3fc
--color-primary-500: #007aff (Apple Blue)
--color-primary-600: #0066d6
--color-primary-700: #0056b3
```

### Cores de Feedback

```css
Success (Green):
--color-success-400: #6ee7b7
--color-success-500: #34c759
--color-success-600: #2ca64d

Warning (Orange):
--color-warning-500: #ff9500

Error (Red):
--color-error-300: #fca5a5
--color-error-500: #ff3b30
--color-error-600: #dc2626
--color-error-700: #b91c1c
```

---

## 📝 Tipografia

### Família de Fonte

```css
--font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif;
```

### Escala de Tamanhos

```css
--font-size-xs: 0.75rem    (12px)
--font-size-sm: 0.875rem   (14px)
--font-size-base: 1rem     (16px)
--font-size-lg: 1.125rem   (18px)
--font-size-xl: 1.25rem    (20px)
--font-size-2xl: 1.5rem    (24px)
--font-size-3xl: 1.875rem  (30px)
--font-size-4xl: 2.25rem   (36px)
--font-size-5xl: 3rem      (48px)
--font-size-6xl: 3.75rem   (60px)
```

### Pesos de Fonte

```css
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Altura de Linha

```css
--line-height-tight: 1.25
--line-height-normal: 1.5
--line-height-relaxed: 1.75
```

---

## 📏 Espaçamento

Sistema de espaçamento baseado em múltiplos de 4px:

```css
--spacing-1: 0.25rem  (4px)
--spacing-2: 0.5rem   (8px)
--spacing-3: 0.75rem  (12px)
--spacing-4: 1rem     (16px)
--spacing-5: 1.25rem  (20px)
--spacing-6: 1.5rem   (24px)
--spacing-8: 2rem     (32px)
--spacing-10: 2.5rem  (40px)
--spacing-12: 3rem    (48px)
--spacing-16: 4rem    (64px)
--spacing-20: 5rem    (80px)
--spacing-24: 6rem    (96px)
```

---

## 🔲 Border Radius

```css
--border-radius-sm: 0.25rem   (4px)
--border-radius-md: 0.5rem    (8px)
--border-radius-lg: 0.75rem   (12px)
--border-radius-xl: 1rem      (16px)
--border-radius-full: 9999px
```

---

## 🌑 Sombras (Shadows)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## ⚡ Transições

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🧩 Componentes

### Button

Botão versátil com múltiplas variantes e estados.

#### Variantes

- `primary` - Ação principal (azul)
- `secondary` - Ação secundária (cinza)
- `outline` - Botão com borda
- `ghost` - Botão transparente
- `danger` - Ação destrutiva (vermelho)

#### Tamanhos

- `sm` - Pequeno (height: 32px)
- `md` - Médio (height: 40px, padrão)
- `lg` - Grande (height: 48px)

#### Props

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

#### Exemplo de Uso

```tsx
import { Button } from "./components/ui";

<Button variant="primary" size="lg" loading={isLoading}>
  Enviar
</Button>;
```

---

### Input & Textarea

Campos de entrada de texto com suporte a labels, erros e ícones.

#### Props

```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
```

#### Exemplo de Uso

```tsx
import { Input, Textarea } from './components/ui';

<Input
  label="Nome"
  type="text"
  required
  fullWidth
  placeholder="Seu nome"
  error={errors.name}
/>

<Textarea
  label="Mensagem"
  rows={5}
  helperText="Máximo de 500 caracteres"
/>
```

---

### Card

Container flexível para organizar conteúdo.

#### Componentes

- `Card` - Container principal
- `CardHeader` - Cabeçalho com título e ação
- `CardBody` - Conteúdo principal
- `CardFooter` - Rodapé com ações

#### Variantes

- `default` - Fundo cinza claro com borda
- `elevated` - Sombra elevada
- `outlined` - Borda destacada

#### Props

```typescript
interface CardProps {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}
```

#### Exemplo de Uso

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "./components/ui";

<Card variant="elevated" padding="lg" hoverable>
  <CardHeader
    title="Título"
    subtitle="Subtítulo"
    action={<Badge>Novo</Badge>}
  />
  <CardBody>Conteúdo do card</CardBody>
  <CardFooter align="right">
    <Button variant="outline">Cancelar</Button>
    <Button variant="primary">Salvar</Button>
  </CardFooter>
</Card>;
```

---

### Badge

Indicador visual para status, contagens e categorias.

#### Variantes

- `default` - Cinza neutro
- `primary` - Azul
- `success` - Verde
- `warning` - Laranja
- `error` - Vermelho
- `info` - Azul claro

#### Props

```typescript
interface BadgeProps {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}
```

#### Exemplo de Uso

```tsx
import { Badge } from './components/ui';

<Badge variant="success">Ativo</Badge>
<Badge variant="warning" size="sm">Pendente</Badge>
<Badge variant="primary" dot />
```

---

### Alert

Mensagens de feedback para o usuário.

#### Variantes

- `success` - Mensagem de sucesso
- `error` - Mensagem de erro
- `warning` - Aviso
- `info` - Informação

#### Props

```typescript
interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  onClose?: () => void;
}
```

#### Exemplo de Uso

```tsx
import { Alert } from "./components/ui";

<Alert variant="success" title="Sucesso!" onClose={() => setShow(false)}>
  Operação realizada com sucesso!
</Alert>;
```

---

### Loading

Indicador de carregamento com duas variantes.

#### Variantes

- `spinner` - Spinner rotativo (padrão)
- `dots` - Pontos animados

#### Props

```typescript
interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots";
  fullScreen?: boolean;
  text?: string;
}
```

#### Exemplo de Uso

```tsx
import { Loading } from './components/ui';

<Loading size="lg" text="Carregando..." />
<Loading variant="dots" fullScreen />
```

---

## 📱 Responsividade

### Breakpoints

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

### Media Queries

```css
/* Mobile */
@media (max-width: 640px) {
}

/* Tablet */
@media (max-width: 768px) {
}

/* Desktop */
@media (max-width: 1024px) {
}
```

---

## ♿ Acessibilidade

### Princípios

1. **Contraste de Cores** - Todas as combinações atendem WCAG AA
2. **Focus Visible** - Estados de foco claramente visíveis
3. **Semântica HTML** - Uso correto de tags semânticas
4. **ARIA Labels** - Atributos ARIA quando necessário
5. **Navegação por Teclado** - Todos os componentes acessíveis via teclado

### Estados de Foco

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

---

## 🎭 Animações

### Princípios

- Animações sutis e funcionais
- Duração curta (150-300ms)
- Easing natural (cubic-bezier)
- Sem animações desnecessárias

### Exemplos

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Spin (Loading) */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 📦 Estrutura de Arquivos

```
frontend/src/
├── styles/
│   └── design-system.css    # Variáveis CSS globais
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   ├── Input.tsx
│   │   ├── Input.css
│   │   ├── Card.tsx
│   │   ├── Card.css
│   │   ├── Badge.tsx
│   │   ├── Badge.css
│   │   ├── Alert.tsx
│   │   ├── Alert.css
│   │   ├── Loading.tsx
│   │   ├── Loading.css
│   │   └── index.ts         # Exports
│   └── [feature components]
└── index.css                 # Global styles
```

---

## 🚀 Como Usar

### 1. Importar o Design System

O design system é importado automaticamente via `index.css`:

```css
@import "./styles/design-system.css";
```

### 2. Usar Componentes

```tsx
import { Button, Card, Input, Alert } from "./components/ui";
```

### 3. Acessar Variáveis CSS

```css
.custom-class {
  color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-base);
}
```

---

## 📚 Referências

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Desenvolvido com ❤️ seguindo as melhores práticas de UI/UX**
