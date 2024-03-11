const port = process.env.PORT || 8888;

const SERVER = {
    PORT: port,
    LOCALHOST_URL: `http://localhost:${port}/`
}

const ROUTES = {

}

const URLS = {
    NRSR_HLASOVANIA_DNES: 'https://www.nrsr.sk/web/default.aspx?SectionId=108',
    NRSR_HLASOVANIE_DETAIL: 'https://www.nrsr.sk/web/Default.aspx?sid=schodze/hlasovanie/hlasovanie&ID=',
}

module.exports = {SERVER, URLS, ROUTES};