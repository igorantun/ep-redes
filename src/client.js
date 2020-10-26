const ws = new WebSocket(`ws://${location.host}`)

let userId

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

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data)

  switch (data.type) {
    case 'user-id':
      userId = data.userId
      break

    case 'bet-made':
      showToast('Nova aposta', `Alguém apostou na ${data.raffle}!`)
      break

    case 'bet-error':
      showToast('Erro', data.message)
      break

    case 'bet-win':
      const numbers = data.bet.numbers.join(', ')
      const draw = data.draw.join(', ')
      showToast('Você ganhou!', `Você acertou os números sorteados pela ${data.raffle.name}!<br>Seu prêmio: <b>${formatCurrency(data.prize)}</b><br>Sua aposta: ${numbers}<br>Números sorteados: ${draw}`)
      break
  }
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

const showToast = (title, body) => {
  const toastId = Date.now()

  $('#toast-container').append(`
    <div id="${toastId}" class="toast" data-delay="5000">
      <div class="toast-header">
        <strong id="toast-header" class="mr-auto">${title}</strong>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
      </div>
      <div id="toast-body" class="toast-body">${body}</div>
    </div>
  `)

  $(`#${toastId}`).toast('show')
}

const startTime = new Date()
let megasenaProgress = (startTime.getHours() * 60 * 60) + (startTime.getMinutes() * 60) + startTime.getSeconds()
let lotofacilProgress = (startTime.getMinutes() * 60) + startTime.getSeconds()
let lotomaniaProgress = ((startTime.getMinutes() % 5) * 60) + startTime.getSeconds()
let rapidinhaProgress = startTime.getSeconds()

const updateProgress = () => {
  const now = new Date()
  const secondsUntilNextMinute = (60 - now.getSeconds())
  const minutesUntilNextHour = (60 - now.getMinutes())
  const minutesUntilNextLotomania = now.getMinutes() % 5 === 0 ? (5 - (now.getMinutes() % 5)) - 1 : (5 - (now.getMinutes() % 5))
  const hoursUntilNextDay = (24 - now.getHours())
  megasenaProgress++
  lotofacilProgress++
  lotomaniaProgress++
  rapidinhaProgress++
  if (megasenaProgress % (60 * 60 * 24) === 0) megasenaProgress = 0
  if (lotofacilProgress % (60 * 60) === 0) lotofacilProgress = 0
  if (lotomaniaProgress % (60 * 5) === 0) lotomaniaProgress = 0
  if (rapidinhaProgress % 60 === 0) rapidinhaProgress = 0

  const megasenaPercentage = megasenaProgress / (60 * 60 * 24) * 100
  $('#megasena-progress').css('width', `${megasenaPercentage}%`).attr('aria-valuenow', megasenaPercentage);
  $('#megasena-timer').text(`Próximo sorteio em ${hoursUntilNextDay} horas, ${minutesUntilNextHour} minutos e ${secondsUntilNextMinute} segundos`)

  const lotofacilPercentage = lotofacilProgress / (60 * 60) * 100
  $('#lotofacil-progress').css('width', `${lotofacilPercentage}%`).attr('aria-valuenow', lotofacilPercentage);
  $('#lotofacil-timer').text(`Próximo sorteio em ${minutesUntilNextHour} minutos e ${secondsUntilNextMinute} segundos`)

  const lotomaniaPercentage = lotomaniaProgress / (60 * 5) * 100
  $('#lotomania-progress').css('width', `${lotomaniaPercentage}%`).attr('aria-valuenow', lotomaniaPercentage);
  $('#lotomania-timer').text(`Próximo sorteio em ${minutesUntilNextLotomania} minutos e ${secondsUntilNextMinute} segundos`)

  const rapidinhaPercentage = rapidinhaProgress / 60 * 100
  $('#rapidinha-progress').css('width', `${rapidinhaPercentage}%`).attr('aria-valuenow', rapidinhaPercentage);
  $('#rapidinha-timer').text(`Próximo sorteio em ${secondsUntilNextMinute} segundos`)
}

setInterval(updateProgress, 1000)
updateProgress()

const formatCurrency = (amount) => amount.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})

const placeBets = async () => {
  for (const lottery in bets) {
    if (bets[lottery].length === raffles[lottery].bets) {
      const data = JSON.stringify({
        userId,
        raffle: raffles[lottery].name,
        numbers: bets[lottery],
      })

      const response = await fetch(`http://${location.host}/bet`, {
        method: 'POST',
        body: data,
      })

      if (response.status === 200) {
        const numbers = bets[lottery].join(', ')
        showToast('Sucesso', `Você apostou na ${lottery}<br>Seus números: <b>${numbers}</b><br>Boa sorte :)`)
      }
    }
  }

  clearBets()
}

const clearBets = () => {
  cart.bets = []
  bets.megasena = []
  bets.lotofacil = []
  bets.lotomania = []
  bets.rapidinha = []
  updateCart()
  cart.total = 0
  $('#total').text(`Total: ${formatCurrency(cart.total)}`)

  for (const lottery in bets) {
    $(`[id^=${lottery}-number-]`).each((_, e) => {
      e.checked = false
      e.disabled = false
    })
  }
}

const updateCart = () => {
  const cartElement = document.getElementById('cart')
  const totalElement = document.getElementById('total')
  const finishElement = document.getElementById('finish')

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
  finishElement.disabled = !cart.bets.length
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
          <div id="${lottery}-progress" class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div>
        </div>
        <small><div id="${lottery}-timer" class="text-center"></div></small>
      </div>
    </div>
    <br>
  `)

  const numbers = document.getElementById(`${lottery}-numbers`)
  numbers.innerHTML = generateCheckboxes(lottery, raffles[lottery].numbers)
}

for (const lottery in raffles) {
  generateLottery(lottery)
}
