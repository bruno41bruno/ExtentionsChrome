async function init(){
    const price = document.querySelector(
        'div.ui-pdp-price__second-line > span.andes-money-amount.ui-pdp-price__part.andes-money-amount--cents-superscript > span.andes-money-amount__fraction')
    ?.innerText.replace('.', '') || '0';

    const cents = document.querySelector(
        'div.ui-pdp-price__second-line > span > span.andes-money-amount__cents')
    ?.innerHTML || '0';
    
    const sold = Number(document.querySelector('.ui-pdp-subtitle')
    ?.innerHTML.split(' ')[4]);

    const container = document.querySelector('.ui-pdp-header__title-container');

    const idAd = document.querySelector('meta[name="twitter:app:url:googleplay"]')
    ?.content.split('id=')[1];
    
    const result = await handleUrl(`https://api.mercadolibre.com/items?ids=${idAd}`);   

    const {
        body: {
            category_id, listing_type_id, start_time
        },
    } = result[0] || null;

    const fee = (await handleUrl(
        `https://api.mercadolibre.com/sites/MLB/listing_prices?price=${price}&listing_type_id=${listing_type_id}$category_id=${category_id}`
        )) || {};


    const total = Number(price +'.'+ cents) * sold;
    const unitReceipt = price - fee[0].sale_fee_amount;
    const receipt = unitReceipt * sold;

    const startTime = new Date(start_time);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs(startTime - today) / oneDay);

    const daySellAvg = receipt / diffDays;

    setTimeout(() => {
        container.insertAdjacentHTML('beforebegin', 
        `
            <ul class="extentionMLB-contaner">
                <li>Receita bruta: <span>${formatMoney(total)}</span></li>
                <li>Receita líquida: <span>${formatMoney(receipt)}</span></li>
                <li>Receita por unidade: <span>${formatMoney(unitReceipt)}</span></li>
                <li>Receita média diária: <span>${formatMoney(daySellAvg)}</span></li>
                <li>Comissão do ML: <span>${formatMoney(fee[0].sale_fee_amount)}</span></li>
                <li>Criado em: <span>${formatDate(startTime)} - ${diffDays} dias atrás</span></li>
            </ul>
        `)
    }, 1500)
}

function formatMoney(value){
    return value.toLocaleString('pt-BR',{
        style: 'currency',
        currency: 'BRL'
    });
}

function formatDate(date){
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year =date.getFullYear();

    return `${day}/${month}/${year}`
}

async function handleUrl(url){
    try {
        const config = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, config);
        const finalResponse = await response.json();

        return finalResponse;
    } catch (error) {
        console.log('Falha na requisição!', error)
    }
}

init();