const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

fetch('https://playoverwatch.com/en-us/career/pc/BATTLETAG')
.then(res => res.text()).then(body => {
    let dom = new JSDOM(body);
    console.log(dom.window.document.querySelector('.EndorsementIcon-border--shotcaller').getAttribute('data-value'))
    console.log(dom.window.document.querySelector('.EndorsementIcon-border--teammate').getAttribute('data-value'))
    console.log(dom.window.document.querySelector('.EndorsementIcon-border--sportsmanship').getAttribute('data-value'))
})