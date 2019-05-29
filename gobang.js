
// 当前下的位置(x, y) 第x行、第y列，以及整个棋盘的数据(当前点下过之后的数据)
function win(x, y, data){ // 15*15
    //console.log(x,y,"win")
    var p_label = data[x][y]
    var size = data.length
    // horizontal
    var y_left = y-4
    var y_right = y+4
    if (y_left <= 0) y_left = 0
    if (y_right >= size) y_right = size-1
    var match = 0
    for (var i=y_left; i<=y_right; i++){
        if (data[x][i] == p_label){
            match += 1
            if (match == 5){ // win
                console.log("horizontal")
                return true
            }
        } else {
            match = 0
        }
    }
    // vertical
    var x_top = x-4
    var x_bottom = x+4
    if (x_top <= 0) x_top = 0
    if (x_bottom >= size) x_bottom = size-1
    var match = 0
    for (var i=x_top; i<=x_bottom; i++){
        if (data[i][y] == p_label){
            match += 1
            if (match == 5){ // win
                console.log("vertical")
                return true
            }
        } else {
            match = 0
        }
    }
    //diagonal
    var d1 = Math.min(x-x_top, y-y_left)
    var d2 = Math.min(x_bottom-x, y_right-y)
    var x1 = x-d1
    var y1 = y-d1
    var match = 0
    for (var i=0; i<=d1+d2; i++){
        if (data[x1+i][y1+i] == p_label){
            match += 1
            if (match == 5){
                console.log("diagonal")
                return true
            }
        } else {
            match = 0
        }
    }
    //anti-diagonal 
    var d1 = Math.min(x-x_top, y_right-y)
    var d2 = Math.min(x_bottom-x, y-y_left)
    var x1 = x-d1
    var y1 = y+d1
    var match = 0
    for (var i=0; i<=d1+d2; i++){
        if (data[x1+i][y1-i] == p_label){
            match += 1
            if (match == 5){
                console.log("anti-diagonal")
                return true
            }
        } else {
            match = 0
        }
    }
    return false
}

function evaluate_full(x, y, data, label){
    var self = evaluate(x,y,data,label)
    var opponent = evaluate(x, y, data, -label) //考虑对手的棋
    return self*0.6+opponent*0.4
}

function evaluate(x, y, data, label){
    if (data[x][y] != 0){ // 已经被占用了
        return -1
    }
    var size = data.length
    // horizontal
    var y_left = y-4
    var y_right = y+4
    if (y_left <= 0) y_left = 0
    if (y_right >= size) y_right = size-1
    var seq1 = [], value1 = 0
    for (var i=y_left; i<=y_right; i++){
        seq1.push(data[x][i])
    }
    value1 = eval_seq(y-y_left,seq1,label)
    // vertical
    var x_top = x-4
    var x_bottom = x+4
    if (x_top <= 0) x_top = 0
    if (x_bottom >= size) x_bottom = size-1
    var seq2 = [], value2 = 0
    for (var i=x_top; i<=x_bottom; i++){
        seq2.push(data[i][y])
    }
    value2 = eval_seq(x-x_top,seq2,label)
    //diagonal
    var d1 = Math.min(x-x_top, y-y_left)
    var d2 = Math.min(x_bottom-x, y_right-y)
    var x1 = x-d1
    var y1 = y-d1
    var seq3 =[], value3 = 0
    for (var i=0; i<=d1+d2; i++){
        seq3.push(data[x1+i][y1+i])
    }
    value3 =eval_seq(d1,seq3,label)
    //anti-diagonal 
    var d1 = Math.min(x-x_top, y_right-y)
    var d2 = Math.min(x_bottom-x, y-y_left)
    var x1 = x-d1
    var y1 = y+d1
    var seq4 = [], value4 = 0
    for (var i=0; i<=d1+d2; i++){
        seq4.push(data[x1+i][y1-i])
    }
    value4 = eval_seq(d1,seq4,label)
    //console.log(value1,value2,value3,value4)
    return value1+value2+value3+value4+0.1/(Math.exp((x-7)*(x-7)+(y-7)*(y-7))) // 10000会溢出，导致错误？？
}
function eval_seq(index, seq, label){ // label目前还没下，seq依然原样
    // seq = [0,0,-1,1,0,1,1,-1]
    // calculate useful space 两端的限制情况
    if (seq[index]==0){
        seq[index] = label
    } else {
        console.log("error!")
        return -1
    }
    var left = 0, right=seq.length-1
    for (var i=index; i>=0; i--){
        if (seq[i] == -label){
            break
        }
    }
    left = i
    for (var i=index; i<=right; i++){
        if (seq[i] == -label){
            break
        }
    }
    right = i 
    var space = right - left
    if (space < 6){ // 再怎么下也没意义
        return 0
    }
    //console.log(left)
    //console.log(right)
    var subseq = get_subseq(seq, left+1, right)
    return eval_subseq(subseq, label)
}
function eval_subseq(subseq, label){
    var len = subseq.length
    var continuous = 0
    var start_index = 0
    for (var i=0; i<len; i++){ // 如果两个相同长度的连续序列，则评分就看谁先出现了
        if (subseq[i] == label){
            var tmp_i = i
            for (var j=i; j<len; j++){
                if (subseq[j] != label){
                    break
                }
            }
            if (j-tmp_i >continuous){
                continuous = j-tmp_i
                start_index = tmp_i
            }
            i = j
        }
    }
    var condi1 = start_index > 0
    var condi2 = start_index + continuous < len
    switch(continuous){
        case 5:
            return 200
        case 4:
            if (condi1 && condi2){
                return 100
            }
            return 8
        case 3:
            if (condi1 && condi2){
                return 6
            }
            return 3
        case 2:
            if (condi1 && condi2){
                return 4
            }
            return 2
        case 1:
            if (condi1 && condi2){
                return 2
            }
            return 1
    }
}
function get_subseq(seq, i, j){
    var p = []
    for (var k=i; k<j; k++){
        p.push(seq[k])
    }
    return p
}

function get_all_value(data, label){
    var values = []
    var indices = []
    for (var i=0,len=data.length; i<len; i++){
        for (var j=0; j<len; j++){
            values.push(evaluate_full(i,j,data,label))
            indices.push([i,j])
        }
    }
    sort(values, indices, 5) // 只取前5个值
    values = get_subseq(values,0,5)
    indices =get_subseq(indices,0,5)
    return {"value":values, "index":indices}
}
function AI_play(data, label){
    var rst = get_all_value(data, label)
    var point = rst["index"][0] // 取最大的值
    console.log(point)
    var dom = document.getElementsByClassName("grid2")[point[0]*15+point[1]]
    //dom.onclick()
    var obj = dom
        obj.style.background = 'white';
		obj.style.borderRadius = '13px';
		x = obj.getAttribute('row');
		y = obj.getAttribute('col');
		setgame(x,y,label);
}
function sort(key, value, top_k){ // key: score of (i,j), value:(i,j)
    var len = key.length
    if (top_k > len) top_k = key.length
    for (var i=0; i<top_k; i++){
        for (var j=i; j<len; j++){
            if (key[j]>key[i]){
                var tmp = key[j]
                key[j] = key[i]
                key[i] = tmp
                tmp = value[j]
                value[j] = value[i]
                value[i] = tmp
            }
        }   
    }
}
var auto = 1
var over = false
function auto_play(){
    if (!over){
        var rst = get_all_value(game, auto)
        var point = rst["index"][0] // 取最大的值
        var r = Math.random()
        if (r < 0.1){
            point = rst["index"][random_choice(rst["value"])] // 取随机值
        }
        //console.log(point)
        var dom = document.getElementsByClassName("grid2")[point[0]*15+point[1]]
        //dom.onclick() 这个暂时不对
        if(win(point[0],point[1],game)){
            over = true
        }
        auto = auto*-1
    }
}
function random_choice(key){
    var sum = 0
    var tmp = [0]
    for (var i=0; i<key.length; i++){
        sum += key[i]*key[i]
    }
    for (var i=0; i<key.length; i++){
        tmp.push(key[i]*key[i]/sum+tmp[i])
    }
    var r = Math.random()
    for (var i=0; i<tmp.length-1; i++){
        if (r > tmp[i] && r <= tmp[i+1]){
            return i
        }
    }
}