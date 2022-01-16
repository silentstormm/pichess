const Board = (gs) => {
  let gameState = gs
  let clicked = [-1, -1]
  let squares = []

  function clearGuides() {
    squares.forEach((row) => {
      row.forEach((square) => {
        square.classList.remove('can-move')
      })
    })
  }

  return {
    init: () => {
      Array.from(document.getElementsByClassName('square')).forEach((square, i) => {
        if (i % 8 === 0) squares[Math.floor(i / 8)] = []
        squares[Math.floor(i / 8)].push(square)
      })

      for (let i = 0; i < 8; i++) {
        let opposite = gameState.getColour() === 'light' ? 'dark' : 'light'

        squares[0][i].classList.add('piece', `piece-${opposite}`)
        squares[1][i].classList.add('piece', `piece-${opposite}`, 'piece-pawn')

        squares[6][i].classList.add('piece', `piece-${gameState.getColour()}`, 'piece-pawn')
        squares[7][i].classList.add('piece', `piece-${gameState.getColour()}`)
      }

      squares[0][0].classList.add('piece-rook')
      squares[0][7].classList.add('piece-rook')
      squares[7][0].classList.add('piece-rook')
      squares[7][7].classList.add('piece-rook')

      squares[0][1].classList.add('piece-knight')
      squares[0][6].classList.add('piece-knight')
      squares[7][1].classList.add('piece-knight')
      squares[7][6].classList.add('piece-knight')

      squares[0][2].classList.add('piece-bishop')
      squares[0][5].classList.add('piece-bishop')
      squares[7][2].classList.add('piece-bishop')
      squares[7][5].classList.add('piece-bishop')

      squares[0][3].classList.add('piece-queen')
      squares[7][3].classList.add('piece-queen')

      squares[0][4].classList.add('piece-king')
      squares[7][4].classList.add('piece-king')

      squares.forEach((row, i) => {
        row.forEach((square, j) => {
          square.addEventListener('click', () => {
            if (
              clicked[0] >= 0 &&
              clicked[0] < 8 &&
              clicked[1] >= 0 &&
              clicked[1] < 8 &&
              square.classList.contains('can-move')
            ) {
              clearGuides()
              let piece = Array.from(squares[clicked[0]][clicked[1]].classList).find((s) => /piece-[kqrnbp]/.test(s))

              squares[clicked[0]][clicked[1]].classList.remove('piece', `piece-${gameState.getColour()}`, piece)
              squares[i][j].classList.add('piece', `piece-${gameState.getColour()}`, piece)

              gameState.move(
                gameState.getColour() === 'light'
                  ? {
                      from: { row: clicked[0], col: clicked[1] },
                      to: { row: i, col: j },
                    }
                  : {
                      from: { row: 7 - clicked[0], col: 7 - clicked[1] },
                      to: { row: 7 - i, col: 7 - j },
                    }
              )
              return
            }

            clearGuides()

            if (Array.from(square.classList).find((s) => /piece-[ld]/.test(s)) !== `piece-${gameState.getColour()}`)
              return

            let piece = Array.from(square.classList).find((s) => /piece-[kqrnbp]/.test(s))

            if (typeof piece !== 'undefined') {
              clicked = [i, j]
            }

            switch (piece) {
              case 'piece-king':
                for (let dx = -1; dx <= 1; dx++) {
                  for (let dy = -1; dy <= 1; dy++) {
                    if (
                      !(dx === 0 && dy === 0) &&
                      i + dy >= 0 &&
                      i + dy < 8 &&
                      j + dx >= 0 &&
                      j + dx < 8 &&
                      Array.from(squares[i + dy][j + dx].classList).find((s) => /piece-[ld]/.test(s)) !==
                        `piece-${gameState.getColour()}`
                    ) {
                      squares[i + dy][j + dx].classList.add('can-move')
                    }
                  }
                }
                break

              case 'piece-queen':
                for (let dx = -1; dx <= 1; dx++) {
                  for (let dy = -1; dy <= 1; dy++) {
                    for (let k = 1; k < 8; k++) {
                      if (
                        !(dx === 0 && dy === 0) &&
                        i + dy * k >= 0 &&
                        i + dy * k < 8 &&
                        j + dx * k >= 0 &&
                        j + dx * k < 8
                      ) {
                        if (
                          Array.from(squares[i + k * dy][j + k * dx].classList).find((s) => /piece-[ld]/.test(s)) ===
                          `piece-${gameState.getColour()}`
                        )
                          break
                        squares[i + k * dy][j + k * dx].classList.add('can-move')
                      }
                    }
                  }
                }
                break

              case 'piece-rook':
                for (let dy = -1; dy <= 1; dy += 2) {
                  for (let k = 1; k < 8; k++) {
                    if (!(dy === 0) && i + dy * k >= 0 && i + dy * k < 8) {
                      if (
                        Array.from(squares[i + k * dy][j].classList).find((s) => /piece-[ld]/.test(s)) ===
                        `piece-${gameState.getColour()}`
                      )
                        break
                      squares[i + k * dy][j].classList.add('can-move')
                    }
                  }
                }

                for (let dx = -1; dx <= 1; dx += 2) {
                  for (let k = 1; k < 8; k++) {
                    if (!(dx === 0) && j + dx * k >= 0 && j + dx * k < 8) {
                      if (
                        Array.from(squares[i][j + k * dx].classList).find((s) => /piece-[ld]/.test(s)) ===
                        `piece-${gameState.getColour()}`
                      )
                        break
                      squares[i][j + k * dx].classList.add('can-move')
                    }
                  }
                }
                break

              case 'piece-knight':
                for (let dx = -1; dx <= 1; dx += 2) {
                  for (let dy = -2; dy <= 2; dy += 4) {
                    if (
                      !(dx === 0 && dy === 0) &&
                      i + dy >= 0 &&
                      i + dy < 8 &&
                      j + dx >= 0 &&
                      j + dx < 8 &&
                      Array.from(squares[i + dy][j + dx].classList).find((s) => /piece-[ld]/.test(s)) !==
                        `piece-${gameState.getColour()}`
                    ) {
                      squares[i + dy][j + dx].classList.add('can-move')
                    }
                  }
                }

                for (let dx = -2; dx <= 2; dx += 4) {
                  for (let dy = -1; dy <= 1; dy += 2) {
                    if (
                      !(dx === 0 && dy === 0) &&
                      i + dy >= 0 &&
                      i + dy < 8 &&
                      j + dx >= 0 &&
                      j + dx < 8 &&
                      Array.from(squares[i + dy][j + dx].classList).find((s) => /piece-[ld]/.test(s)) !==
                        `piece-${gameState.getColour()}`
                    ) {
                      squares[i + dy][j + dx].classList.add('can-move')
                    }
                  }
                }
                break

              case 'piece-bishop':
                for (let dx = -1; dx <= 1; dx += 2) {
                  for (let dy = -1; dy <= 1; dy += 2) {
                    for (let k = 1; k < 8; k++) {
                      if (
                        !(dx === 0 && dy === 0) &&
                        i + dy * k >= 0 &&
                        i + dy * k < 8 &&
                        j + dx * k >= 0 &&
                        j + dx * k < 8
                      ) {
                        if (
                          Array.from(squares[i + k * dy][j + k * dx].classList).find((s) => /piece-[ld]/.test(s)) ===
                          `piece-${gameState.getColour()}`
                        )
                          break
                        squares[i + k * dy][j + k * dx].classList.add('can-move')
                      }
                    }
                  }
                }
                break

              case 'piece-pawn':
                if (
                  i - 1 >= 0 &&
                  Array.from(squares[i - 1][j].classList).find((s) => /piece-[ld]/.test(s)) !==
                    `piece-${gameState.getColour()}`
                ) {
                  squares[i - 1][j].classList.add('can-move')
                }
                break

              default:
                break
            }
          })
        })
      })
    },
  }
}
