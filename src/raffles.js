module.exports = {
  "Mega-Sena": {
    "name": "Mega-Sena",
    "description": "A loteria que paga milhões para o acertador dos 6 números sorteados.",
    "interval": "0 0 0 */1 * *", // intervalo entre sorteios de um dia
    "prize": [0, 0, 0, 0, 1000, 71000, 45000000], // premios para cada quantidade de acerto (1 acerto = prize[1])
    "draws": 6, // quantidade de numeros que irao ser sorteados
    "choices": 6, // quantidade de numeros que o jogador vai escolher
    "range": [1, 60], // range de numeros que podem ser escohidos
    "cost": 4.5 // custo da aposta
  },
  "Lotofácil": {
    "name": "Lotofácil",
    "description": "Mais chances de ganhar.",
    "interval": "0 0 */1 * * *", // intevalo entre sorteios de 1 hora
    "prize": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 25, 1800, 220000],
    "draws": 15,
    "choices": 15,
    "range": [1, 25],
    "cost": 2.5
  },
  "Lotomania": {
    "name": "Lotomania",
    "description": "Fácil de apostar e ganhar.",
    "interval": "0 */5 * * * *", // intervalo entre sorteios de 5 minutos
    "prize": [180000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 34, 201, 1700, 3300, 6546000],
    "draws": 20,
    "choices": 50,
    "range": [1, 100],
    "cost": 2.5
  },
  "Rapidinha": {
    "name": "Rapidinha",
    "description": "Sorteios a cada minuto.",
    "interval": "0 */1 * * * *", // intervalo entre sorteios de 1 minuto
    "prize": [0, 0.3, 2.5, 5, 100, 1000],
    "draws": 5,
    "choices": 5,
    "range": [1, 10],
    "cost": 1
  }
}
