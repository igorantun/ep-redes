let userId

// Regras de negócio de cada sorteio
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

// Apostas feitas pelo usuário
const bets = {
  megasena: [],
  lotofacil: [],
  lotomania: [],
  rapidinha: [],
}

// Carrinho
const cart = {
  total: 0,
  bets: [],
}

// Funções auxiliares
const sortAscending = (array) => array.sort((a, b) => a - b) // Ordena números de forma crescente
const formatCurrency = (amount) => amount.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'}) // Formata valores monetários
const showToast = (title, body, delay = 5000) => { // Exibe notificação na tela
  const toastId = Date.now()

  $('#toast-container').append(`
    <div id="${toastId}" class="toast" data-delay="${delay}">
      <div class="toast-header">
        <strong id="toast-header" class="mr-auto">${title}</strong>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">&times;</button>
      </div>
      <div id="toast-body" class="toast-body">${body}</div>
    </div>
  `)

  $(`#${toastId}`).toast('show')
}

// Websocket
const ws = new WebSocket(`ws://${location.host}`)

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
      const numbers = sortAscending(data.bet.numbers).join(', ')
      const draw = sortAscending(data.draw).join(', ')
      showToast('Você ganhou!', `Você acertou os números sorteados pela ${data.raffle.name}!<br>Seu prêmio: <b>${formatCurrency(data.prize)}</b><br>Sua aposta: ${numbers}<br>Números sorteados: ${draw}`, 30000)
      break
  }
}

// Função que finaliza e confirma as apostas realizadas
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
        const numbers = sortAscending(bets[lottery]).join(', ')
        showToast('Sucesso', `Você apostou na ${lottery}<br>Seus números: <b>${numbers}</b><br>Boa sorte :)`)
      }
    }
  }

  clearBets()
}

// Função que limpa as apostas feitas anteriormente
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

// Função que atualiza os itens e valor total do carrinho
const updateCart = () => {
  for (const lottery in bets) {
    if (bets[lottery].length === raffles[lottery].bets) {
      if (!cart.bets.find(bet => bet === lottery)) {
        cart.bets.push(lottery)
        cart.total = cart.total + raffles[lottery].cost

        $('#cart').append(`
          <small id="${lottery}-cart"><p class="card-text">1x ${raffles[lottery].name} | ${formatCurrency(raffles[lottery].cost)}</p></small>
        `)
      }
    } else {
      cart.bets = cart.bets.filter(bet => bet !== lottery)

      if ($(`#${lottery}-cart`).length) {
        cart.total = cart.total - raffles[lottery].cost
        $(`#${lottery}-cart`).remove()
      }
    }
  }

  $('#total').text(`Total: ${formatCurrency(cart.total)}`)
  $('#finish').prop('disabled', !cart.bets.length)
}

// Função que desabilita ou reabilita os números da aposta
const updateCheckmarks = (lottery, disable) => {
  $(`[id^=${lottery}-number-]`).each((_, checkbox) => {
    checkbox.disabled = disable ? !checkbox.checked : false
  })
}

// Função que registra a escolha de um número
const checkNumber = (lottery, id) => {
  const checkbox = $(`#${id}`)[0]

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

// Função que adiciona os checkboxes de opções de números dinamicamente
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

// Função que adiciona as opções de loterias dinamicamente
const generateLottery = (lottery) => {
  $('#lotteries').append(`
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

  $(`#${lottery}-numbers`).html(generateCheckboxes(lottery, raffles[lottery].numbers))
}

for (const lottery in raffles) {
  generateLottery(lottery)
}
