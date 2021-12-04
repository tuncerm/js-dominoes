function createElement(tag, content){
    const e = document.createElement(tag);
    if(Array.isArray(content)){
        content.map(c=>e.append(c));
    } else {
        e.append(content);
    }
    return e;
}

function print(loc, str) {
    loc.append(createElement('p', str));
}

class Tile {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    contains(val) {
        return (this.left === val || this.right === val);
    }

    turn() {
        [this.left, this.right] = [this.right, this.left];
    }

    toString() {
        return `<${this.left}:${this.right}>`;
    }
}

class Deck {
    constructor() {
        this.tiles = [];
        for (let left = 0; left < 7; left++) {
            for (let right = left; right < 7; right++) {
                this.tiles.push(new Tile(left, right));
            }
        }
    }

    shuffle() {
        let temp = [];
        while (this.tiles.length > 0) {
            temp.push(this.randomTile());
        }
        this.tiles = temp;
    }

    randomTile() {
        return this.tiles.splice(Math.random() * this.tiles.length << 0, 1)[0];
    }

    getTile() {
        return this.tiles.pop();
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    toString() {
        return this.tiles.reduce((acc, item) => `${acc} ${item}`, "");
    }
}

class Board {
    constructor(tile) {
        this.path = [];
        this.path.push(tile);
    }

    insertLeft(tile) {
        this.path.unshift(tile);
    }

    insertRight(tile) {
        this.path.push(tile);
    }

    getEdges() {
        if (this.path.length)
            return [this.path[0].left, this.path[this.path.length - 1].right];
        else
            return undefined;
    }

    left() {
        return this.path[0];
    }

    right() {
        return this.path[this.path.length - 1];
    }

    toString() {
        return this.path.reduce((acc, item) => `${acc} ${item}`, "");
    }

    render(loc){
        loc.append(createElement('div', this.path.map(p=>MakeSVG.makeSVG(78, 40, p.left, p.right))));
    }
}

class Hand {
    constructor() {
        this.tiles = [];
    }

    insertTile(tile) {
        this.tiles.push(tile);
    }

    hasTile(options) {
        return this.tiles.findIndex(tile => tile.contains(options[0]) || tile.contains(options[1])) >= 0;
    }

    getFirstTile(options) {
        let index = this.tiles.findIndex(tile => tile.contains(options[0]) || tile.contains(options[1]))
        return this.tiles.splice(index, 1)[0];
    }

    getRandomTile(options) {
        let tiles = this.tiles.filter(tile => tile.contains(options[0]) || tile.contains(options[1]))
        let tile = tiles[Math.random()*tiles.length<<0];
        let index = this.tiles.indexOf(tile);
        return this.tiles.splice(index, 1)[0];
    }

    length() {
        return this.tiles.length;
    }

    isEmpty() {
        return this.tiles.length === 0;
    }

    toString() {
        return this.tiles.reduce((acc, item) => `${acc} ${item}`, "");
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.hand = new Hand();
    }
}

class Game {
    constructor(loc, players) {
        this.loc = loc;
        this.deck = new Deck();
        this.players = [];
        players.forEach(player => {
            this.players.push(new Player(player));
        });
    }

    start() {
        this.deck.shuffle();
        this.giveInitialTiles();
        print(this.loc, `Game starting with first tile: ${this.board.toString()}`);
        this.board.render(this.loc);
        while (true) {
            let current = this.players[this.turn];
            let edges = this.board.getEdges();
            if (current.hand.hasTile(edges)) {
                let tile = current.hand.getRandomTile(edges);
                if (tile.left === edges[1]) {
                    print(this.loc, `${current.name} plays ${tile.toString()} to connect to tile ${this.board.right().toString()} on the board`);
                    this.board.insertRight(tile);
                } else if (tile.right === edges[0]) {
                    print(this.loc, `${current.name} plays ${tile.toString()} to connect to tile ${this.board.left().toString()} on the board`);
                    this.board.insertLeft(tile);
                } else if (tile.right === edges[1]) {
                    tile.turn();
                    print(this.loc, `${current.name} plays ${tile.toString()} to connect to tile ${this.board.right().toString()} on the board`);
                    this.board.insertRight(tile);
                } else if (tile.left === edges[0]) {
                    tile.turn();
                    print(this.loc, `${current.name} plays ${tile.toString()} to connect to tile ${this.board.left().toString()} on the board`);
                    this.board.insertLeft(tile);
                }
                print(this.loc, `Board is now: ${this.board.toString()}`);
                this.board.render(this.loc);
                this.turn = (this.turn + 1) % 2;
            } else {
                if(this.deck.isEmpty())
                {
                    print(this.loc, "Deck is Empty, Game Over!");
                    break;
                }

                const temp = this.deck.getTile();
                print(this.loc, `${current.name} can't play, drawing tile ${temp}`);
                current.hand.insertTile(temp);
            }

            if(current.hand.isEmpty())
            {
                print(this.loc, `Player ${current.name} has won!`);
                break;
            }
        }

        print(this.loc, 'Thanks for Playing!');
    }

    giveInitialTiles() {
        for (let t = 0; t < 7; t++) {
            for (let p = 0; p < this.players.length; p++) {
                this.players[p].hand.insertTile(this.deck.getTile());
            }
        }
        this.board = new Board(this.deck.getTile());
        this.turn = Math.random() * this.players.length << 0;
    }
}

class MakeSVG{
    static makeRect(x, y, w, h, c){
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", w);
        rect.setAttribute("height", h);
        rect.setAttribute("fill", c);
        return rect;
    }

    static makeCircle(x, y, r, c){
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cy", y);
        circle.setAttribute("cx", x);
        circle.setAttribute("r", r);
        circle.setAttribute("fill", c);
        return circle;
    }

    static makeDominoDots(domino, w, h, n, o = 0){
        const size = h/10;
        switch(n){
            case 5:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 4), 1 * h/4, size, "black"));
                domino.appendChild(MakeSVG.makeCircle(o + (3 * h / 4), 3 * h/4, size, "black"));
            case 3:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 4), 3 * h/4, size, "black"));
                domino.appendChild(MakeSVG.makeCircle(o + (3 * h / 4), 1 * h/4, size, "black"));
            case 1:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 2), h/2, size, "black"));
                break;
            case 6:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 4), 2 * h/4, size, "black"));
                domino.appendChild(MakeSVG.makeCircle(o + (3 * h / 4), 2 * h/4, size, "black"));
            case 4:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 4), 1 * h/4, size, "black"));
                domino.appendChild(MakeSVG.makeCircle(o + (3 * h / 4), 3 * h/4, size, "black"));
            case 2:
                domino.appendChild(MakeSVG.makeCircle(o + (h / 4), 3 * h/4, size, "black"));
                domino.appendChild(MakeSVG.makeCircle(o + (3 * h / 4), 1 * h/4, size, "black"));
        }
    }

    static makeSVG(w, h, l, r) {
        const domino = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        domino.setAttribute("width", w);
        domino.setAttribute("height", h);
        const bt = Math.round(h/20);
        const iw = h - 2 * bt;
        const shell = MakeSVG.makeRect(0, 0, w, h, "black");
        const innerRectLeft = MakeSVG.makeRect(bt, bt, iw, iw, "white");
        const innerRectRight = MakeSVG.makeRect(h, bt, iw, iw, "white");
        domino.appendChild(shell);
        domino.appendChild(innerRectLeft);
        domino.appendChild(innerRectRight);
        MakeSVG.makeDominoDots(domino, w, h, l, 0);
        MakeSVG.makeDominoDots(domino, w, h, r, h - bt);
        return domino;
    }

}

new Game(document.getElementById('svg'), ["Alice", "Bob"]).start();