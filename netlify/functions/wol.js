

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const bookId = Number(params.bookId);
  const chapter = Number(params.chapter);

  if (
    !Number.isInteger(bookId) || bookId < 1 || bookId > 66 ||
    !Number.isInteger(chapter) || chapter < 1 || chapter > 150
  ) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Riferimento biblico non valido'
    };
  }

  const url = `https://wol.jw.org/it/wol/b/r6/lp-i/nwt/${bookId}/${chapter}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JW-Bible/1.0)',
        'Accept': 'text/html,application/xhtml+xml'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: `WOL ha risposto con HTTP ${response.status}`
      };
    }

    const html = await response.text();

    if (!html || html.length < 1000) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        body: 'Risposta WOL incompleta'
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'X-Content-Type-Options': 'nosniff'
      },
      body: html
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: 'Impossibile raggiungere WOL dal server Netlify: ' +
        (error && error.message ? error.message : 'errore di rete')
    };
  }
};
