var idList = [];
var infodisplaying = false;

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

function parseIDs() {
	//parse ID
	var pushtype = "推→";
	var regex = new RegExp("([" + pushtype + "]) ([A-Za-z0-9]+):(.*[^\\s])[\\s]+([0-9]+/[0-9]+)[\\s]+([0-9]+:[0-9]+)", "g");
	var content = document.getElementById("pushcontent").value;
	var result;
	idList = [];
	while(result = regex.exec(content)) {
		idList.push(result[2]);
	}
	idList = unique(idList);

	//update ID count
	document.getElementById("idCount").innerHTML = idList.length;

	//update ID List
	var idString = "";
	for (var i in idList) {
		idString += "<div class=\"col-xs-3\">" + idList[i] + "</div>";
	}
	document.getElementById("idStr").innerHTML = idString;
}

function roll() {
	document.getElementById("result").innerHTML = "";
	if(!document.getElementById("nocheat").checked) {
		showinfo("不要作弊啦QAQ","danger");
		return;
	}
	if(idList.length==0) {
		showinfo("沒有半個人想抽哭哭","warning");
		return;
	}
	var winner = idList[randomFloor(0, idList.length-1)];
	var congrats = "恭喜 <b>" + winner + " </b>獲得大獎！"
	document.getElementById("result").innerHTML = congrats;
	showinfo("開獎啦！","success");
}

function webimport(url) {
	$.ajax({
		url: "http://www.ptt.cc/bbs/Steam/M.1400528184.A.85E.html",   
		type: "GET",
		dataType: "text/html",
		success:function(result){
			console.log("Success");
			console.log(result);
			$("#result").html(result.responseText);
		},
		error:function(xhr,status,error){
			console.log("ERROR");
		}      
	});
}

function showinfo(info, type) {
	if (infodisplaying) return;
	infodisplaying = true;

	if (type != "primary" && type != "success" && type != "info" && type != "warning" && type != "danger") {
		type = "info";
	}
	$("#pushinfo").addClass("text-"+type+" bg-"+type).html(info).fadeIn(200).delay(2500).fadeOut(300).queue(function() {
		$(this).removeClass("text-"+type+" bg-"+type);
		$(this).dequeue();
		infodisplaying = false;
	});
}

$( document ).ready(function() {
	$( document ).on("keyup", "#pushcontent", function() {
		parseIDs();
	});
	$( document ).on("click", "#pushroll", function() {
		roll();
	});
	$( document ).on("click", "#pushimport", function() {
		webimport($("#pushurl").val());
	});
});
