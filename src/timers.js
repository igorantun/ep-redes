// Atualização dos temporizadores (X tempo até o próximo sorteio)

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
