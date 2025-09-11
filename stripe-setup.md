# Stripe Configuration Guide

## Configuração do Stripe para Elite Store

### 1. Criar Conta no Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Clique em "Start now" para criar uma conta
3. Complete o processo de verificação da conta

### 2. Obter Chaves da API

#### Chaves de Teste (Development):
1. No dashboard do Stripe, vá para **Developers** → **API keys**
2. Copie a **Publishable key** (começa com `pk_test_`)
3. Copie a **Secret key** (começa com `sk_test_`)

#### Chaves de Produção (Live):
1. Ative o modo "Live" no dashboard
2. Complete a verificação da conta
3. Copie as chaves de produção

### 3. Configurar no Código

#### No arquivo `script.js`, linha ~19:
```javascript
// Substitua esta linha:
const stripePublishableKey = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE';

// Por sua chave real:
const stripePublishableKey = 'pk_test_51...'; // Sua chave aqui
```

### 4. Backend para Pagamentos (Necessário para Produção)

Para um sistema completo de pagamentos, você precisará de um backend. Aqui está um exemplo básico em Node.js:

#### Instalar dependências:
```bash
npm init -y
npm install express stripe cors
```

#### Exemplo de servidor (server.js):
```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe uses cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      }
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 5. Webhooks (Recomendado)

Configure webhooks no Stripe para receber notificações de pagamentos:

1. No dashboard: **Developers** → **Webhooks**
2. Adicione endpoint: `https://seusite.com/webhook`
3. Selecione eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 6. Configurações de Segurança

#### Domínios Autorizados:
1. No dashboard: **Settings** → **API keys**
2. Adicione seu domínio nos "Restrict to domains"

#### Configurar HTTPS:
- Stripe requer HTTPS em produção
- Use Netlify, Vercel, ou similar para SSL automático

### 7. Modo de Teste

#### Cartões de Teste do Stripe:
- **Visa**: 4242 4242 4242 4242
- **Visa (debit)**: 4000 0566 5566 5556
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005
- **Declined**: 4000 0000 0000 0002

#### Data de Expiração: Qualquer data futura
#### CVC: Qualquer 3 dígitos (4 para Amex)
#### CEP: Qualquer CEP válido

### 8. Customização Avançada

#### Temas do Stripe Elements:
```javascript
const cardElement = elements.create('card', {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Inter, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
});
```

#### Múltiplas Moedas:
- Configure no dashboard: **Settings** → **Payment methods**
- Adicione moedas suportadas

### 9. Monitoramento

#### Dashboard Analytics:
- Visualize transações em tempo real
- Relatórios de vendas
- Análise de conversão

#### Logs de Eventos:
- Monitore tentativas de pagamento
- Debug erros de integração

### 10. Checklist de Produção

- [ ] Chaves de produção configuradas
- [ ] HTTPS habilitado
- [ ] Webhooks configurados
- [ ] Domínios restritos
- [ ] Conta Stripe verificada
- [ ] Testes com cartões reais
- [ ] Políticas de reembolso definidas
- [ ] Suporte ao cliente configurado

### Suporte

- **Documentação**: [stripe.com/docs](https://stripe.com/docs)
- **Suporte**: [support.stripe.com](https://support.stripe.com)
- **Status**: [status.stripe.com](https://status.stripe.com)
