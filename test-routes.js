// Simular acesso às rotas do AgroXP
console.log('Testando rotas do AgroXP...');

// Testar rota de registro
fetch('http://localhost:8081/register')
  .then(response => {
    console.log('Rota /register:', response.status);
    return response.text();
  })
  .then(html => {
    console.log('Conteúdo da página de registro:', html.substring(0, 200) + '...');
  })
  .catch(error => {
    console.error('Erro ao acessar /register:', error);
  });

// Testar rota de login
fetch('http://localhost:8081/login')
  .then(response => {
    console.log('Rota /login:', response.status);
    return response.text();
  })
  .then(html => {
    console.log('Conteúdo da página de login:', html.substring(0, 200) + '...');
  })
  .catch(error => {
    console.error('Erro ao acessar /login:', error);
  });