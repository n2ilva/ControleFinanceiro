// Proteção contra acesso via console do navegador
if (typeof window !== 'undefined') {
  // Desabilitar console em produção
  if (process.env.NODE_ENV === 'production') {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
  }

  // Detectar DevTools aberto
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      console.clear();
      document.body.innerHTML = '<h1 style="text-align:center;margin-top:20%;">⚠️ Acesso não autorizado detectado</h1>';
    }
  };

  // Verificar periodicamente (comentado por padrão - descomente se quiser usar)
  // setInterval(detectDevTools, 1000);

  // Mensagem de aviso no console
  console.log(
    '%c⚠️ ATENÇÃO!',
    'color: red; font-size: 40px; font-weight: bold;'
  );
  console.log(
    '%cEste é um recurso do navegador destinado a desenvolvedores.\n' +
    'Se alguém pediu para você copiar e colar algo aqui, é uma fraude.\n' +
    'Isso pode comprometer sua conta e dados pessoais.',
    'font-size: 16px;'
  );
}

export {};
