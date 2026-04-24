//start by defining the start and goal positions
const start = { row: 0, col: 0 };
const goal = { row: 9, col: 9 };
let mode = null; // "start", "end", or null



class Cell { //builds the individual cell
    constructor(row, col, ele) { //vertical, horizontal, element (actual small box)
        this.row = row;
        this.col = col;
        this.ele = ele;

        this.wall = false;
        this.visit = false;
    }

    makeStart() {
        this.ele.classList.add('start'); //marks start cell with a different color
    }

    makeEnd() {
        this.ele.classList.add('end');  //marks end cell with a different color
    }

    makeWall() {
        this.wall = !this.wall
        this.ele.classList.toggle('wall'); //changes color and flips it on and off
    }

    makeVisited() {
        this.ele.classList.add('visit'); //makes the cell a different color to show it has been visited by the algorithm
    }
}

class Grid { //build the whole grid

    reset() {
        //loop through every row in the grid
    for (let row of this.grid) {
        //loop through every cell in the row
        for (let cell of row) {
            //reset the properties of the cell
            cell.visit = false;
            cell.parent = null;

            //remove the visit and path classes to reset the colors
            cell.ele.classList.remove("visit", "path");
        }
    }
}
    
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];

        this.container = document.getElementById('grid');
    }

    createGrid() { //goes row by row and creates a cell in each row
        for (let i = 0; i < this.rows; i++) {
            const row_array = [];
            for (let j = 0; j < this.cols; j++) {

                let cellele = document.createElement('div');
                cellele.classList.add('cell');

                //object of cell class
                const cell = new Cell(i, j, cellele);


                 // start cell
                if (i === start.row && j === start.col) {
                    cell.makeStart();
                }

                // goal cell
                if (i === goal.row && j === goal.col) {
                    cell.makeEnd();
                }

                //if cell is start or end, then don't make a wall 

            cellele.addEventListener("click", () => {
                // MOVE START
                if (mode === "start") {

                    // remove old start color
                    let oldStart = document.querySelector(".start");
                    if (oldStart) oldStart.classList.remove("start");

                    // remove wall if placing start on a wall
                    cell.wall = false;
                    cellele.classList.remove("wall");

                    // update position
                    start.row = i;
                    start.col = j;

                    // add new start color
                    cell.makeStart();

                    mode = null;
                    return;
                }

                // MOVE END
                if (mode === "end") {

                    // remove old end color
                    let oldEnd = document.querySelector(".end");
                    if (oldEnd) oldEnd.classList.remove("end");

                    // remove wall if placing end on a wall
                    cell.wall = false;
                    cellele.classList.remove("wall");

                    // update position
                    goal.row = i;
                    goal.col = j;

                    // add new end color
                    cell.makeEnd();

                    mode = null;
                    return;
                }

        // prevent start/end from becoming walls
        if (cellele.classList.contains("start") ||
            cellele.classList.contains("end")) {
            return;
        }

        // normal wall toggle
        cell.makeWall();
    });

        this.container.append(cellele); //show cell on the screen
        row_array.push(cell); //show cell in the grid array
        }

        this.grid.push(row_array); //show grid
    }
}
};

class Pathfinder {
    constructor(store_grid) {
        this.store_grid = store_grid; //storing the grid to be accessed later
    }

    bfs() {
        //accessing the start and goal cells from the grid
        let startC = this.store_grid.grid[start.row][start.col];
        let goalC = this.store_grid.grid[goal.row][goal.col];

        //making the queue and adding the start cell to it
        let q = [];
        q.push(startC);

        //marking the start cell as visited
        startC.visit = true;

        //looping through cells until queue is empty
        while (q.length > 0) {
            let current = q.shift();

            // if we reached the goal → stop
            if (current === goalC) {
                this.retracePath(goalC);
                return;
            }

            // looking at neighbor cells through the getNeighbors function
            let neighbors = this.getNeighbors(current);

            //looping through the neighbors to check if they are visited or walls
            for (let n of neighbors) {
                if (!n.visit && !n.wall) {
                    n.visit = true; //marking the neighbor as visited
                    n.parent = current; //needed to backtracking path later

                    n.makeVisited(); // shows blue color

                    q.push(n); //adding the neighbor to the queue
                }
            }
        }
    }

    getNeighbors(cell) {
        
    // directions: down, up, right, left
        let direction = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];

        //storing all neighboring cells in an array to be returned later
        let neighbor_stor = [];

        //loop through the directions to find the neighboring cells
        for (let d of direction) {
            let newR = cell.row + d[0];
            let newC = cell.col + d[1];

            //check if the new position is inside the grid boundaries
            if (
                newR >= 0 &&
                newR < this.store_grid.rows &&
                newC >= 0 &&
                newC < this.store_grid.cols
            ) {
                //if valid, neighboring cells are added to the list
                neighbor_stor.push(this.store_grid.grid[newR][newC]);
            }
        }

        //return all valid neighboring cells
        return neighbor_stor;
    }


    retracePath(cell) {
        //start from goal cell
        let current = cell;

        //following each parent back to the start cell 
        while (current.parent) {
            current.ele.classList.add("path"); // coloring path
            current = current.parent; //moving back
        }
    }
}

// create grid (10x10) by making an instance of the Grid class and calling the createGrid method
const make_grid = new Grid(10, 10);
make_grid.createGrid();

// create pathfinder object by making an instance of the Pathfinder class and passing in the grid
const pathfinder_obj = new Pathfinder(make_grid);

// when button is clicked → run BFS
document.getElementById("start").addEventListener("click", () => {
    make_grid.reset(); // clear old run
    const al = document.getElementById("algorithm").value;

    if (al === "BFS") {
        pathfinder_obj.bfs();
    } else if (al === "A*") {
        window.alert("A* is not implemented yet!");
    }
});

//setting the mode to start or end when the corresponding buttons are clicked so the cell can be changed
document.getElementById("move_start").addEventListener("click", () => {
    mode = "start";
});

document.getElementById("move_end").addEventListener("click", () => {
    mode = "end";
});

//changing the size of the grid through width and height input boxes
document.getElementById("change_width").addEventListener("click", () => {
    let newW = parseInt(prompt("Enter new width:"));
    make_grid.cols = newW;

    make_grid.container.innerHTML = "";
    make_grid.grid = [];
    make_grid.createGrid();
});

document.getElementById("change_height").addEventListener("click", () => {
    let newH = parseInt(prompt("Enter new height:"));
    make_grid.rows = newH;

    make_grid.container.innerHTML = "";
    make_grid.grid = [];
    make_grid.createGrid();
});