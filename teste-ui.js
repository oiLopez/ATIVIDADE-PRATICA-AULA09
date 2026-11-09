const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');
const { mkdir, mkdtemp, writeFile, appendFile } = require('node:fs/promises');

async function registrar(pasta, mensagem) {
  const linha = `${new Date().toISOString()} ${mensagem}\n`;
  await appendFile(join(pasta, 'execucao.log'), linha, 'utf8');
  console.log(mensagem);
}

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
    const resultados = join(__dirname, 'resultados');
await mkdir(resultados, { recursive: true });

const pastaExecucao = await mkdtemp(join(resultados, 'execucao-'));
console.log('Evidências em:', pastaExecucao);
 const caminho = join(__dirname, 'catalogo.html');
const endereco = pathToFileURL(caminho).href;
await navegador.get(endereco);

  const titulo = await navegador.getTitle();
  expect(titulo).to.equal('Aula 09');
  console.log('PASSOU: título correto');
  const menu = await navegador.findElement(By.css('nav'));
const menuVisivel = await menu.isDisplayed();

expect(menuVisivel).to.equal(true);
console.log('PASSOU: menu visível');
const campoBusca = await navegador.findElement(By.id('busca'));
await campoBusca.sendKeys('software', Key.ENTER);

await navegador.wait(until.urlContains('?busca='), 5000);

const url = new URL(await navegador.getCurrentUrl());
expect(url.searchParams.get('busca')).to.equal('software');
console.log('PASSOU: termo enviado na busca');

const listaCursos = await navegador.findElement(By.id('lista-cursos'));
const cursosVisiveis = await listaCursos.getText();

expect(cursosVisiveis).to.equal('Desenvolvimento de Software Multiplataforma');
console.log('PASSOU: busca filtrou os cursos');

const statusBusca = await navegador.findElement(By.id('status-busca'));
expect(await statusBusca.getText()).to.equal('1 curso encontrado.');
console.log('PASSOU: total da busca visível');

await navegador.get(endereco);

const botaoBuscar = await navegador.findElement(By.css('button[type="submit"]'));
await botaoBuscar.click();

const campoVazio = await navegador.findElement(By.id('busca'));
const mensagemValidacao = await campoVazio.getProperty('validationMessage');

expect(await navegador.getCurrentUrl()).to.equal(endereco);
expect(mensagemValidacao).to.be.a('string').and.not.be.empty;
console.log('PASSOU: busca vazia bloqueada');

await navegador.get(endereco);

const campoNovaBusca = await navegador.findElement(By.id('busca'));
await campoNovaBusca.sendKeys('zzzz', Key.ENTER);
await navegador.wait(until.urlContains('?busca=zzzz'), 5000);

const orientacao = await navegador.findElement(By.css('#busca-sem-resultados p'));
expect(await orientacao.getText()).to.include('Tente outro nome');
await salvarCaptura(navegador, pastaExecucao, 'busca-sem-resultados.png');

const linkTodos = await navegador.findElement(By.linkText('Ver todos os cursos'));
await linkTodos.click();
await navegador.wait(until.urlIs(endereco), 5000);
await salvarCaptura(navegador, pastaExecucao, 'lista-restaurada.png');

const cursosRestaurados = await navegador.findElements(
  By.css('#lista-cursos li:not([hidden])')
);
expect(cursosRestaurados).to.have.lengthOf(3);
console.log('PASSOU: busca sem resultados permite voltar à lista');
  } finally {
    await navegador.quit();
  }
}

testarChrome().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
