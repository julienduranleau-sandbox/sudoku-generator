;(() => {

    const VALID = 1
    const INCOMPLETE = 0
    const INVALID = -1
    const OUT_OF_RANGE_CHAR = "-"

    class Sudoku {

        constructor() {
            this.grid = null
            this.visibilityGrid = null
            this.isFullyVisible = false
            this.nVisiblePerSquare = 4

            createCanvas(window.innerWidth, window.innerHeight)

            this.initGrid()
            this.initGui()
        }

        initGui() {
            let showAnswerBt = createButton('Toggle Answer')
            showAnswerBt.position(width - 120, 20)
            showAnswerBt.mousePressed(() => {
                this.toggleFullVisibility()
                this.draw()
            })

            let resetBt = createButton('Create New')
            resetBt.position(width - 109, 50)
            resetBt.mousePressed(() => {
                this.fillGrid()
                this.draw()
                this.log()
            })
        }

        initGrid() {
            this.grid = []
            this.visibilityGrid = []

            for (let i = 0; i < 9; i++) {
                let row = []
                let visibilityRow = []

                for (let j = 0; j < 9; j++) {
                    row.push(0)
                    visibilityRow.push(0)
                }

                this.grid.push(row)
                this.visibilityGrid.push(visibilityRow)
            }
        }

        resetGrid() {
            this.grid.forEach((row, i) => {
                row.forEach((val, j) => {
                    this.grid[i][j] = 0
                    this.visibilityGrid[i][j] = 0
                })
            })
        }

        fillGrid() {
            for (let i = 0; i < 10000; i++) {
                this.resetGrid()

                this.fillSquare(1,1) // center
                this.fillSquare(1,0) // top center
                this.fillSquare(1,2) // top bottom
                this.fillSquare(0,1) // left middle
                this.fillSquare(2,1) // right middle
                this.fillSquare(0,0) // top left
                this.fillSquare(2,0) // top right
                this.fillSquare(0,2) // bottom left
                this.fillSquare(2,2) // bottom right

                if (this.validate() === VALID) {
                    console.log('Complete in ' + i + ' attemps')
                    break
                }
            }

            this.setVisibility()
        }

        setVisibility() {
            this.setVisibilityForSquare(0,0) // top left
            this.setVisibilityForSquare(1,0) // top center
            this.setVisibilityForSquare(2,0) // top right
            this.setVisibilityForSquare(0,1) // left middle
            this.setVisibilityForSquare(1,1) // center
            this.setVisibilityForSquare(2,1) // right middle
            this.setVisibilityForSquare(0,2) // bottom left
            this.setVisibilityForSquare(1,2) // bottom center
            this.setVisibilityForSquare(2,2) // bottom right
        }

        setVisibilityForSquare(col, line) {
            let list = []
            let startRow = line * 3
            let startCol = col * 3
            let index = 1

            let randomNumsToShow = (this.shuffledNumbers()).splice(0, this.nVisiblePerSquare)

            for (let i = startRow; i < startRow + 3; i++) {
                for (let j = startCol; j < startCol + 3; j++) {
                    randomNumsToShow.forEach((n) => {
                        if (index === n) {
                            this.visibilityGrid[i][j] = 1
                        }
                    })

                    index++
                }
            }
        }

        toggleFullVisibility() {
            this.isFullyVisible = !this.isFullyVisible

            this.visibilityGrid.forEach((row, i) => {
                row.forEach((val, j) => {
                    if (this.isFullyVisible) {
                        if ( ! this.visibilityGrid[i][j]) {
                            this.visibilityGrid[i][j] = 0.5
                        }
                    } else {
                        if (this.visibilityGrid[i][j] < 1) {
                            this.visibilityGrid[i][j] = 0
                        }
                    }
                })
            })

        }

        fillSquare(col, line) {
            let list = []
            let startRow = Math.max(0, line * 3)
            let startCol = Math.max(0, col * 3)

            for (let i = startRow; i < startRow + 3; i++) {
                for (let j = startCol; j < startCol + 3; j++) {
                    let randomOrderNumberList = this.shuffledNumbers()

                    for (let k = 0; k < 9; k++) {
                        this.grid[i][j] = randomOrderNumberList[k]
                        let validation = this.validate()

                        if (validation !== INVALID) {
                            break
                        } else if (k == 8 && validation === INVALID) {
                            this.grid[i][j] = "-"
                        }
                    }
                }
            }

            return list
        }

        shuffledNumbers() {
            let array = [1,2,3,4,5,6,7,8,9]

            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }

            return array
        }

        validate() {
            let incomplete = false

            for (let row = 0; row < 9; row++) {
                let values = this.getHorizontalLine(row)
                let validation = this.containsAllNumbers(values)

                if (validation === INVALID) {
                    this.error('Invalid row '+row)
                    return INVALID
                } else if (validation === INCOMPLETE) {
                    incomplete = true
                }
            }

            for (let col = 0; col < 9; col++) {
                let values = this.getVerticalLine(col)
                let validation = this.containsAllNumbers(values)

                if (validation === INVALID) {
                    this.error('Invalid col '+col)
                    return INVALID
                } else if (validation === INCOMPLETE) {
                    incomplete = true
                }
            }

            for (let sq = 0; sq < 9; sq++) {
                let values = this.getSquare(sq % 3, Math.floor(sq / 3))
                let validation = this.containsAllNumbers(values)

                if (validation === INVALID) {
                    this.error('Invalid square '+(sq % 3)+","+(Math.floor(sq / 3)))
                    return INVALID
                } else if (validation === INCOMPLETE) {
                    incomplete = true
                }
            }

            return (incomplete) ? INCOMPLETE : VALID
        }

        containsAllNumbers(values) {
            let countOfValues = {}

            values.forEach((v) => {
                if ( ! countOfValues[v]) {
                    countOfValues[v] = 1
                } else {
                    countOfValues[v] += 1
                }
            })

            if (countOfValues[OUT_OF_RANGE_CHAR] > 0) {
                return INVALID
            }

            for (let i = 1; i <= 9; i++) {
                if (countOfValues[i] > 1) {
                    return INVALID
                }
            }

            if (countOfValues[0] > 0) {
                return INCOMPLETE
            }

            return VALID
        }

        getHorizontalLine(line) {
            return this.grid[line]
        }

        getVerticalLine(col) {
            let list = []

            this.grid.forEach((row) => {
                list.push(row[col])
            })

            return list
        }

        getSquare(col, line) {
            let list = []
            let startRow = Math.max(0, line * 3)
            let startCol = Math.max(0, col * 3)

            for (let i = startRow; i < startRow + 3; i++) {
                for (let j = startCol; j < startCol + 3; j++) {
                    list.push(this.grid[i][j])
                }
            }

            return list
        }

        error(msg) {
            //console.warn(msg)
        }

        draw() {
            background(240)

            let sqSize = 40

            textAlign(CENTER, CENTER)
            textSize(16)

            translate(width * 0.5 - (sqSize * 9) * 0.5, height * 0.5 - (sqSize * 9) * 0.5)

            this.grid.forEach((row, i) => {
                row.forEach((value, j) => {
                    let x = j * sqSize
                    let y = i * sqSize

                    fill(255)
                    stroke(0)
                    strokeWeight(2)
                    rect(x, y, sqSize, sqSize)

                    if (this.visibilityGrid[i][j] != 0) {
                        if (this.visibilityGrid[i][j] === 1) {
                            fill(0)
                            stroke(0)
                            strokeWeight(1)

                        } else if (this.visibilityGrid[i][j] === 0.5) {
                            fill(150)
                            stroke(150)
                            strokeWeight(1)
                        }

                        text(value, x + sqSize * 0.5, y + sqSize * 0.5)
                    }
                })
            })

            fill(0)
            noStroke()
            // outside
            rect(-1, 0, 3, sqSize * 9)
            rect(sqSize * 9 - 1, -1, 3, sqSize * 9 + 3)
            rect(0, -1, sqSize * 9, 3)
            rect(-1, sqSize * 9 - 1, sqSize * 9, 3)

            // inside
            rect(sqSize * 3 - 1, 0, 3, sqSize * 9)
            rect(sqSize * 6 - 1, 0, 3, sqSize * 9)
            rect(0, sqSize * 3 - 1, sqSize * 9, 3)
            rect(0, sqSize * 6 - 1, sqSize * 9, 3)
        }

        log() {
            let str = ""

            this.grid.forEach((row, i) => {
                row.forEach((value, j) => {
                    str += " " + value
                    if (j == 2 || j == 5) {
                        str += " |"
                    }
                })
                str += "\n"
                if (i == 2 || i == 5) {
                    str += "---------------------- \n"
                }
            })

            console.log(str)
        }
    }

    window.Sudoku = Sudoku

})()
