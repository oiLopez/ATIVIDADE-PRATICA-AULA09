const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

async function testarChrome() {
  const opcoes = new chrome.Options();
  opcoes.addArguments('--headless');

  if (process.env.CODESPACES === 'true') {
    opcoes.addArguments('--no-sandbox', '--disable-dev-shm-usage');
  }

  const navegador = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(opcoes)
    .build();
  
  try {
    const html = `
  <meta charset="utf-8">
  <title>Aula 09</title>
  <nav>
    <a href="#cursos">Cursos</a>
  </nav>
  <main id="cursos">
    <h1>Catálogo de cursos</h1>
  </main>
`;
    await navegador.get(`data:text/html,${encodeURIComponent(html)}`);

  const titulo = await navegador.getTitle();
  expect(titulo).to.equal('Aula 09');
  console.log('PASSOU: título correto');
  const menu = await navegador.findElement(By.css('nav'));
const menuVisivel = await menu.isDisplayed();

expect(menuVisivel).to.equal(true);
console.log('PASSOU: menu visível');
  } finally {
    await navegador.quit();
  }
}

testarChrome().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
