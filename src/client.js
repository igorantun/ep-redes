const ws = new WebSocket('ws://localhost:3000')

const wsTest = () => {
  ws.send(JSON.stringify({
    message: 'test',
  }))
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data)
}

ws.onopen = () => {
  $('#status').removeClass('badge-warning')
  $('#status').addClass('badge-success')
  $('#status').text('Conectado')
}

ws.onclose = () => {
  $('#status').removeClass('badge-success')
  $('#status').addClass('badge-warning')
  $('#status').text('Desconectado')
}

const raffles = {
  megasena: {
    name: 'Mega-Sena',
    description: 'A loteria que paga milhões.',
    bets: 6,
    numbers: 60,
    cost: 4.5,
    prize: 'R$ 45.000.000',
  },
  lotofacil: {
    name: 'Lotofácil',
    description: 'Mais chances de ganhar.',
    bets: 15,
    numbers: 25,
    cost: 2.5,
    prize: 'R$ 220.000',
  },
  lotomania: {
    name: 'Lotomania',
    description: 'Fácil de ganhar e apostar.',
    bets: 50,
    numbers: 100,
    cost: 2.5,
    prize: 'R$ 6.546.000',
  },
  rapidinha: {
    name: 'Rapidinha',
    description: 'Sorteios a cada minuto.',
    bets: 5,
    numbers: 10,
    cost: 1,
    prize: 'R$ 1.000'
  }
}

const bets = {
  megasena: [],
  lotofacil: [],
  lotomania: [],
  rapidinha: [],
}

const cart = {
  total: 0,
  bets: [],
}

const formatCurrency = (amount) => amount.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})

const updateCart = () => {
  const cartElement = document.getElementById('cart')
  const totalElement = document.getElementById('total')

  for (const lottery in bets) {
    if (bets[lottery].length === raffles[lottery].bets) {
      if (!cart.bets.find(bet => bet === lottery)) {
        cart.bets.push(lottery)

        cart.total = cart.total + raffles[lottery].cost
        cartElement.insertAdjacentHTML('beforeend', `
          <small id="${lottery}-cart"><p class="card-text">1x ${raffles[lottery].name} | ${formatCurrency(raffles[lottery].cost)}</p></small>
        `)
      }
    } else {
      cart.bets = cart.bets.filter(bet => bet !== lottery)

      const lotteryCartElement = document.getElementById(`${lottery}-cart`)
      if (lotteryCartElement) {
        cart.total = cart.total - raffles[lottery].cost
        document.getElementById(`${lottery}-cart`).outerHTML = ''
      }
    }

  }

  totalElement.innerHTML = `Total: ${formatCurrency(cart.total)}`
}

const updateCheckmarks = (lottery, disable) => {
  $(`[id^=${lottery}-number-]`).each((_, e) => {
    e.disabled = disable ? !e.checked : false
  })
}

const checkNumber = (lottery, id) => {
  const checkbox = document.getElementById(id)

  if (checkbox.checked) {
    bets[lottery] = [...bets[lottery], checkbox.value]

    if (bets[lottery].length === raffles[lottery].bets) {
      updateCheckmarks(lottery, checkbox.checked)
    }
  } else {
    if (bets[lottery].length === raffles[lottery].bets) {
      updateCheckmarks(lottery, checkbox.checked)
    }

    bets[lottery] = bets[lottery].filter(n => n !== checkbox.value)
  }

  updateCart()
}

const generateCheckboxes = (lottery, numbers) => {
  let html = ''

  for (let i = 1; i <= numbers; i++) {
    const id = `${lottery}-number-${i}`

    html = html + `
      <div class="col-md-2 form-check-inline justify-content-center">
        <input id="${id}" class="form-check-input" type="checkbox" value="${i}" onclick="checkNumber('${lottery}', '${id}')">
        <label class="form-check-label" for="${id}">${i}</label>
      </div>
    `
  }

  return html
}

const generateLottery = (lottery) => {
  const lotteriesElement = document.getElementById('lotteries')

  lotteriesElement.insertAdjacentHTML('beforeend', `
    <div class="card">
      <div class="card-header">
        <div class="row">
        <div class="col-md-6">
          <h5 class="card-title">${raffles[lottery].name}</h5>
          <h6 class="card-subtitle text-muted">${raffles[lottery].description}</h6>
        </div>
        <div class="col-md-6 text-right">
          <h5 class="card-title">${raffles[lottery].prize}</h5>
          <h6 class="card-subtitle text-muted"><small>PRÊMIO MÁXIMO</small></h6>
        </div>
      </div>
      </div>
      <div class="card-body">
        <div id="${lottery}-numbers"></div>
      </div>
      <div class="card-footer">
        <div class="progress">
          <div id="${lottery}-progress" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
        </div>
        <small><div id="${lottery}-timer" class="text-center">Proximo sorteio em: 5:00</div></small>
      </div>
    </div>
    <br>
  `)

  const numbers = document.getElementById(`${lottery}-numbers`)
  numbers.innerHTML = generateCheckboxes(lottery, raffles[lottery].numbers)
}

for (const lottery in raffles) {
  console.log(raffles[lottery])
  generateLottery(lottery)
}
