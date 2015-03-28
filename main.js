(function(){
    var canvas, ctx,

        scoreField, difficultyField,

        COLS = 20,
        ROWS = 20,

        gridState = {EMPTY: 0, SNAKE: 1, FOOD: 2},

        direction = {UP: 0, RIGHT: 1, DOWN: 2, LEFT: 3},

        frames = 0,

        keys = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40},

        controls = {};

    var grid = {
        rows: null,
        cols: null,
        _grid: null,

        init: function(r, c){
            this.rows = r;
            this.cols = c;
            this._grid = [];
            for(var i = 0; i < this.rows; i++){
                this._grid.push([]);
                for(var j = 0; j < this.cols; j++){
                    this._grid[i].push(gridState.EMPTY);
                }
            }
        },
        set: function(row, col, state){
            this._grid[row][col] = state;
        },
        get: function(row, col){
            return this._grid[row][col];
        },
        draw: function(){
            var rw = canvas.height / this.rows;
            var ch = canvas.width / this.cols;
            for (var i = 0; i < this.cols; i++) {
                for (var j = 0; j < this.rows; j++) {
                    switch (this.get(j, i)) {
                        case gridState.EMPTY:
                            ctx.fillStyle = "#fff";
                            break;
                        case gridState.SNAKE:
                            ctx.fillStyle = "#0f0";
                            break;
                        case gridState.FOOD:
                            ctx.fillStyle = "#f00";
                            break;
                    }
                    ctx.fillRect(i * rw, j * ch, rw, ch);
                }
            }

            ctx.beginPath();
            ctx.strokeStyle = "#fff";
            ctx.moveTo(0.5, 0.5);
            ctx.lineTo(0.5, canvas.height - 0.5);
            ctx.lineTo(canvas.width - 0.5, canvas.height - 0.5);
            ctx.lineTo(canvas.width - 0.5, 0.5);
            ctx.lineTo(0.5, 0.5);
            ctx.stroke();

            for (var x = 1; x < this.cols; x ++){
                ctx.beginPath();
                ctx.strokeStyle = "#fff";
                ctx.moveTo(x * ch + 0.5, 0);
                ctx.lineTo(x * ch + 0.5, canvas.height);
                ctx.stroke();
            }
            for (var y = 1; y < this.rows; y ++){
                ctx.beginPath();
                ctx.strokeStyle = "#fff";
                ctx.moveTo(0, y * rw + 0.5);
                ctx.lineTo(canvas.width, y * rw + 0.5);
                ctx.stroke();
            }
        }
    };

    var snake = {
        direction: null,
        _queue: null,
        head: null,

        init: function(d, r, c){
            this.direction = d;
            this._queue = [];
            for(var i = 0; i < 4; i++){
                this.insert(r, c - i);
            }
        },
        insert: function(r, c){
            this._queue.unshift({row: r, col: c});
            this.head = this._queue[0];
        },
        remove: function(){
            return this._queue.pop();
        }
    };

    var score = {
        value: 0,
        clear: function(){
            this.value = 0;
        },
        increase: function(val){
            this.value += val;
        },
        get: function(){
            return score.value;
        }
    };

    var difficulty = {
        value: 1,
        state: {easy: 0, normal: 1, hard: 2},
        set: function(val){
            this.value = val;
        },
        get: function(){
            for(var val in this.state){
                if(this.state[val] === this.value){
                    return val;
                }
            }
        }
    };

    function main(){
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");

        scoreField = document.getElementsByClassName("score")[0];
        scoreField.textContent = "score: " + score.get();

        difficultyField = document.getElementsByClassName("diff")[0];
        difficultyField.textContent = "difficulty: " + difficulty.get();

        document.addEventListener('keydown', function(e){
            controls[e.keyCode] = true;
        }, false);

        document.addEventListener('keyup', function(e){
            delete controls[e.keyCode];
        }, false);

        init();

        loop();
    }

    function init(){
        grid.init(ROWS, COLS);

        score.clear();
        difficulty.set('normal');

        snake.init(direction.LEFT, ROWS/2, COLS/2 + 2);

        spawnFood();
    }

    function loop(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        update();

        scoreField.innerText = "score: " + score.get();

        grid.draw();

        window.requestAnimationFrame(loop);
    }

    function update(){
        frames++;

        if(controls[keys.LEFT] && snake.direction != direction.RIGHT){snake.direction = direction.LEFT;}
        if(controls[keys.UP] && snake.direction != direction.DOWN){snake.direction = direction.UP;}
        if(controls[keys.RIGHT] && snake.direction != direction.LEFT){snake.direction = direction.RIGHT;}
        if(controls[keys.DOWN] && snake.direction != direction.UP){snake.direction = direction.DOWN;}

        if(frames % 10 === 0) {
            var nh_row;
            var nh_col;
            switch(snake.direction){
                case direction.UP: {
                    nh_row = snake.head.row - 1;
                    nh_col = snake.head.col;
                    break;
                }
                case direction.RIGHT: {
                    nh_row = snake.head.row;
                    nh_col = snake.head.col + 1;
                    break;
                }
                case direction.DOWN: {
                    nh_row = snake.head.row + 1;
                    nh_col = snake.head.col;
                    break;
                }
                case direction.LEFT: {
                    nh_row = snake.head.row;
                    nh_col = snake.head.col - 1;
                    break;
                }
            }

            if(nh_row < 0 || nh_row > ROWS - 1 || nh_col < 0 || nh_col > COLS - 1 || grid.get(nh_row, nh_col) === gridState.SNAKE){
                return init();
            }

            if(grid.get(nh_row, nh_col) != gridState.FOOD){
                var tail = snake.remove();
                grid.set(tail.row, tail.col, gridState.EMPTY);
            } else {
                spawnFood();
                score.increase(5);
            }

            snake.insert(nh_row, nh_col);

            for(var i = 0; i < snake._queue.length; i++){
                grid.set(snake._queue[i].row, snake._queue[i].col, gridState.SNAKE);
            }
        }
    }

    function spawnFood(){
        var empty = [];
        for (var i = 0; i < grid.rows; i++) {
            for (var j = 0; j < grid.cols; j++) {
                if (grid.get(i, j) === gridState.EMPTY) {
                    empty.push({row: i, col: j});
                }
            }
        }
        var pos = empty[Math.round(Math.random()*(empty.length - 1))];
        grid.set(pos.row, pos.col, gridState.FOOD);
    }

    main();
}());
