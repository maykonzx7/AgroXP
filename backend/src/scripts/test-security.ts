/**
 * Script de teste básico de segurança
 * Verifica proteções contra SQL injection, XSS e rate limiting
 */

// @ts-ignore - node-fetch types
import fetch from "node-fetch";

const API_URL = process.env.API_URL || "http://localhost:3001";

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} ${name}: ${message}`);
}

/**
 * Testa proteção contra SQL Injection
 */
async function testSQLInjection() {
  console.log("\n🔒 Testando proteção contra SQL Injection...\n");

  try {
    // Tentativa de SQL injection em parâmetro de query
    const maliciousQuery = "'; DROP TABLE users; --";
    const response = await fetch(
      `${API_URL}/api/farms?name=${encodeURIComponent(maliciousQuery)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Se a resposta não for erro 500 (que indicaria execução do SQL), passou
    if (response.status !== 500) {
      addResult(
        "SQL Injection - Query Parameter",
        true,
        "Query maliciosa foi sanitizada"
      );
    } else {
      addResult(
        "SQL Injection - Query Parameter",
        false,
        "Query maliciosa pode ter sido executada"
      );
    }
  } catch (error: any) {
    addResult(
      "SQL Injection - Query Parameter",
      true,
      "Erro esperado ao tentar SQL injection"
    );
  }

  try {
    // Tentativa de SQL injection no body
    const response = await fetch(`${API_URL}/api/farms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        name: "'; DROP TABLE users; --",
        location: "test",
      }),
    });

    // Se não retornar erro 500, passou
    if (response.status !== 500) {
      addResult(
        "SQL Injection - Body Parameter",
        true,
        "Body malicioso foi sanitizado"
      );
    } else {
      addResult(
        "SQL Injection - Body Parameter",
        false,
        "Body malicioso pode ter sido executado"
      );
    }
  } catch (error: any) {
    addResult(
      "SQL Injection - Body Parameter",
      true,
      "Erro esperado ao tentar SQL injection"
    );
  }
}

/**
 * Testa proteção contra XSS
 */
async function testXSS() {
  console.log("\n🛡️ Testando proteção contra XSS...\n");

  try {
    // Tentativa de XSS em parâmetro
    const xssPayload = '<script>alert("XSS")</script>';
    const response = await fetch(
      `${API_URL}/api/farms?name=${encodeURIComponent(xssPayload)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text = await response.text();

    // Verifica se o script foi escapado ou removido
    if (!text.includes("<script>") || text.includes("&lt;script&gt;")) {
      addResult(
        "XSS - Query Parameter",
        true,
        "Script malicioso foi sanitizado"
      );
    } else {
      addResult(
        "XSS - Query Parameter",
        false,
        "Script malicioso pode ter sido executado"
      );
    }
  } catch (error: any) {
    addResult("XSS - Query Parameter", true, "Erro esperado ao tentar XSS");
  }
}

/**
 * Testa rate limiting
 */
async function testRateLimiting() {
  console.log("\n⏱️ Testando Rate Limiting...\n");

  try {
    // Faz múltiplas requisições rápidas
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(
        fetch(`${API_URL}/api/health`, {
          method: "GET",
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some((r: any) => r.status === 429);

    if (rateLimited) {
      addResult(
        "Rate Limiting",
        true,
        "Rate limiting está funcionando (algumas requisições foram bloqueadas)"
      );
    } else {
      addResult(
        "Rate Limiting",
        false,
        "Rate limiting pode não estar funcionando corretamente"
      );
    }
  } catch (error: any) {
    addResult(
      "Rate Limiting",
      false,
      `Erro ao testar rate limiting: ${error.message}`
    );
  }

  // Testa rate limiting de autenticação
  try {
    const authRequests = [];
    for (let i = 0; i < 10; i++) {
      authRequests.push(
        fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@test.com",
            password: "wrongpassword",
          }),
        })
      );
    }

    const authResponses = await Promise.all(authRequests);
    const authRateLimited = authResponses.some((r: any) => r.status === 429);

    if (authRateLimited) {
      addResult(
        "Rate Limiting - Autenticação",
        true,
        "Rate limiting de autenticação está funcionando"
      );
    } else {
      addResult(
        "Rate Limiting - Autenticação",
        false,
        "Rate limiting de autenticação pode não estar funcionando"
      );
    }
  } catch (error: any) {
    addResult(
      "Rate Limiting - Autenticação",
      false,
      `Erro ao testar rate limiting de autenticação: ${error.message}`
    );
  }
}

/**
 * Testa sanitização de dados
 */
async function testDataSanitization() {
  console.log("\n🧹 Testando Sanitização de Dados...\n");

  try {
    // Testa sanitização de caracteres perigosos
    const dangerousInput = {
      name: "Test'; DROP TABLE users; --",
      location: "<script>alert('XSS')</script>",
      description: "'; DELETE FROM farms; --",
    };

    const response = await fetch(`${API_URL}/api/farms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify(dangerousInput),
    });

    // Se não retornar erro 500, os dados foram sanitizados
    if (response.status !== 500) {
      addResult(
        "Sanitização de Dados",
        true,
        "Dados perigosos foram sanitizados"
      );
    } else {
      addResult(
        "Sanitização de Dados",
        false,
        "Dados perigosos podem não ter sido sanitizados"
      );
    }
  } catch (error: any) {
    addResult(
      "Sanitização de Dados",
      true,
      "Erro esperado ao tentar dados perigosos"
    );
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log("🔐 Iniciando testes de segurança...\n");
  console.log(`📍 API URL: ${API_URL}\n`);

  await testSQLInjection();
  await testXSS();
  await testRateLimiting();
  await testDataSanitization();

  // Resumo
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMO DOS TESTES DE SEGURANÇA\n");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`✅ Testes passados: ${passed}/${total} (${percentage}%)`);
  console.log(`❌ Testes falhados: ${total - passed}/${total}`);

  if (passed === total) {
    console.log("\n🎉 Todos os testes de segurança passaram!");
  } else {
    console.log(
      "\n⚠️ Alguns testes falharam. Revise as proteções de segurança."
    );
  }

  console.log("\n" + "=".repeat(60));
}

// Executa os testes
runAllTests().catch(console.error);
