var idList = [];

function parseIDs() {
    //parse ID
    var regex = /[推→] ([A-Za-z0-9]+):.*[\s\S]/g;
    var content = document.getElementById('pushcontent').value;
    var result;
    idList = [];
    while(result = regex.exec(content)) {
        idList.push(result[1]);
    }
    idList = unique(idList);
    
    //update ID count
    document.getElementById('idCount').innerHTML = idList.length;
    
    //update ID List
    var idString = '';
    for (var i in idList) {
      idString += idList[i] + ' ';
    }
    document.getElementById('idStr').innerHTML = idString;
}

function roll() {
    document.getElementById('result').innerHTML = '';
    if(!document.getElementById('nocheat').checked) {
        alert('不要作弊啦QAQ');
        return;
    }
    if(idList.length==0) {
        alert('沒有半個人想抽哭哭');
        return;
    }
    var winner = idList[randomFloor(0, idList.length-1)];
    var congrats = '恭喜 <b>' + winner + ' </b>獲得大獎！'
    document.getElementById('result').innerHTML = congrats;
}

function randomFloor(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function unique(list) {
  var result = [];
  $.each(list, function(i, e) {
    if ($.inArray(e, result) == -1) result.push(e);
  });
  return result;
}
