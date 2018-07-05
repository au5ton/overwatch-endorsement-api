const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const RateLimit = require('express-rate-limit');
const responseTime = require('response-time')

const express = require('express')
const app = express()

app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 
let limiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});
app.use('/api', limiter); // only apply to requests that begin with /api/
app.use(responseTime())

// why tf isn't this enable by default
process.on('unhandledRejection', r => console.error('unhandledRejection: ',r.stack,'\n',r));

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => res.json('The world could use more heroes.'))
app.get('/api/:platform/:id', (req, response) => {
    console.log(req.params)
    response.set('X-Source-Code','https://github.com/au5ton/overwatch-endorsement-api');
    fetch('https://playoverwatch.com/en-us/career/'+encodeURI(req.params.platform.trim())+'/'+encodeURI(req.params.id.trim()))
    .then(res => res.text()).then(body => {
        let dom = new JSDOM(body);
        let results = {};
        results['_query'] = {
            platform: req.params.platform,
            id: req.params.id
        };
        results['reported_total'] = dom.window.document.querySelector('.EndorsementIcon-border--shotcaller').getAttribute('data-total');
        results['shotcaller_count'] = dom.window.document.querySelector('.EndorsementIcon-border--shotcaller').getAttribute('data-value');
        results['teammate_count'] = dom.window.document.querySelector('.EndorsementIcon-border--teammate').getAttribute('data-value');
        results['sportsmanship_count'] = dom.window.document.querySelector('.EndorsementIcon-border--sportsmanship').getAttribute('data-value');
        results['endorsement_level'] = dom.window.document.querySelector('.endorsement-level .u-center').textContent;
        response.json(results);
    }).catch(err => {
        console.error(err)
        response.sendStatus(500);
    })
})

app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port '+ (process.env.PORT || 3000) +'!'))