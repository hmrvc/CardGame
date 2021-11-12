const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}
const Symbols = [
  'https://cdn-icons-png.flaticon.com/512/1/1438.png', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://cdn-icons-png.flaticon.com/512/2869/2869376.png' // 梅花
]

const view = {

  getCardElement(index) {
    return `
      <div data-index="${index} "class="card back"></div>
    `
  },
  getCardContent(index) {
    const number = this.transformationNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return`
      <p>${number}</p>
      <img src="${symbol}" alt="cardimg">
      <p>${number}</p>
      `
  },
  transformationNumber(number){
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    rootElement.innerHTML = indexes.map( index => this.getCardElement(index)).join('') 
 },
 // flipCards(card)
 // flipCards(1,2,3,4,5) cards = [1,2,3,4,5]
  flipCards(...cards) {
    cards.map(card => {
    //回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
    //回傳背面
      card.classList.add('back')
      card.innerHTML = null

    })


  },
  pairCard(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
    
  },
  renderScore(score) {
    document.querySelector(".score").innerHTML = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").innerHTML = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add("wrong")
      card.addEventListener("animationend", e => {
      card.classList.remove("wrong")
      }, 
      {
        once:true
      }
    )

    })

  }
}



const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index --) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealedCards: [],

  isRevealedCardMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState =GAME_STATE.SecondCardAwaits
        break 
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        
        if (model.isRevealedCardMatched()) {
        //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(...model.revealedCards)
          model.revealedCards = []
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
        //配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('current state:', this.currentState)
    console.log('revealed card: ', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
  view.flipCards(...model.revealedCards)
  model.revealedCards = []
  controller.currentState = GAME_STATE.FirstCardAwaits
  }
}



controller.generateCards()

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card) 
  })
})