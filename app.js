export default function init(express, bodyParser, createReadStream, crypto, http) {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type');
    next();
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    if (req.path.length > 1 && !req.path.endsWith('/')) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, req.path + '/' + query);
    }
    next();
  });

  app.get('/login/', (req, res) => {
    res.type('text/plain').send('alkor');
  });

  app.get('/code/', (req, res) => {
    res.type('text/plain');
    createReadStream(import.meta.url.substring(7)).pipe(res);
  });

  app.get('/sha1/:input/', (req, res) => {
    const hash = crypto.createHash('sha1').update(req.params.input).digest('hex');
    res.type('text/plain').send(hash);
  });

  const handleReq = (req, res) => {
    const addr = req.query.addr || (req.body && req.body.addr);
    if (!addr) return res.type('text/plain').send('');
    http.get(addr, (r) => {
      let data = '';
      r.on('data', (chunk) => { data += chunk; });
      r.on('end', () => res.type('text/plain').send(data));
    }).on('error', () => res.type('text/plain').status(500).send(''));
  };

  app.get('/req/', handleReq);
  app.post('/req/', handleReq);

  app.all('*', (req, res) => {
    res.type('text/plain').send('alkor');
  });

  return app;
}
