var idList = [];
var pushList = [];
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

function parseAll() {
	var rst;
	var content = document.getElementById("pushcontent").value;

	//parse ID
	var pushtype = $(".chk_pushtype:checked").map(function() {return this.value;}).get().join("");
	var regex = new RegExp("([" + pushtype + "]) ([A-Za-z0-9]+)[\\s]*:(.*[^\\s])[\\s]+([0-9]+/[0-9]+)[\\s]+([0-9]+:[0-9]+)", "g");
	idList = [];
	while(rst = regex.exec(content)) {
		idList.push(rst[2]);
	}
	idList = unique(idList);

	//update ID count
	document.getElementById("idCount").innerHTML = idList.length;

	//update ID List
	var tmpString = "";
	for (var i in idList) {
		tmpString += "<div class=\"col-xs-3\">" + idList[i] + "</div>";
	}
	document.getElementById("sum_id_list").innerHTML = tmpString;

	//parse Analytics
	var regex = new RegExp("([推→噓]) ([A-Za-z0-9]+)[\\s]*:(.*[^\\s])[\\s]+([0-9]+/[0-9]+)[\\s]+([0-9]+:[0-9]+)", "g");
	pushList = [];
	var i = 0;
	while(rst = regex.exec(content)) {
		pushList.push({
			floor: i+1,
			type: rst[1],
			id: rst[2],
			content: rst[3],
			date: rst[4],
			time: rst[5]
		});
		i++;
	}
	
	var tmpString = "";
	for (var i in pushList) {
		tmpString += 
			"<div class=\"col-md-1\">" + pushList[i].floor + "</div>" +
			"<div class=\"col-md-1\">" + pushList[i].type + "</div>" +
			"<div class=\"col-md-2\">" + pushList[i].id + "</div>" +
			"<div class=\"col-md-6\">" + pushList[i].content + "</div>" +
			"<div class=\"col-md-1\">" + pushList[i].date + "</div>" +
			"<div class=\"col-md-1\">" + pushList[i].time + "</div>";
	}
	document.getElementById("sum_origin_list_insert").innerHTML = tmpString;
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
		url: url, 
		type: "GET",
		dataType: "text",
		success:function(result){
			var webresult = result.responseText;
			var plaintext = "";
			var regex = new RegExp("<div class=\"push\">\n[\\s]*<span.*\">(.*)</span>[\\s]*\n[\\s]*<span.*\">(.*)</span>[\\s]*\n[\\s]*<span.*\">:(.*)</span>[\\s]*\n[\\s]*<span.*\">([0-9]+/[0-9]+) ([0-9]+:[0-9]+)</span></div>", "g");
			while(rst = regex.exec(webresult)) {
				plaintext += rst[1]+" "+rst[2]+":"+rst[3]+" "+rst[4]+" "+rst[5]+"\n";
			}
			$("#pushcontent").val(plaintext);
			parseAll();

			showinfo("網頁內容匯入完成", "success");
		},
		error:function(xhr,status,error){
			showinfo("網頁內容匯入過程發生錯誤！", "danger");
			$("#pushcontent").val("");
			$("#result").html("");
			parseAll();
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

function lockdown(lock) {
	if (lock) {
		$(".chk_pushtype").attr("disabled", true);
		$("#pushimport").attr("disabled", true);
		$("#pushurl").attr("disabled", true);
		$("#pushcontent").attr("disabled", true);
	} else {
		$(".chk_pushtype").removeAttr("disabled");
		$("#pushimport").removeAttr("disabled");
		$("#pushurl").removeAttr("disabled");
		$("#pushcontent").removeAttr("disabled");
	}
}

$( document ).ready(function() {
	$( document ).on("click", "#pushimport", function() {
		$("#pushcontent").val("匯入中...");
		parseAll();
		$("#result").html("");

		var weburl = $("#pushurl").val();
		if (!weburl.match("^.*://")) {
			weburl = "http://"+weburl;
			$("#pushurl").val(weburl);
		}
		webimport(weburl);
	});
	$( document ).on("click", ".sum_title", function() {
		$(this).siblings(".sum_list").toggle("fast", "linear");
	});
	$( document ).on("click", "#pushurl", function() {
		$(this).select();
	});
	$( document ).on("keyup click", "#pushcontent, .chk_pushtype", function() {
		parseAll();
		$("#result").html("");
	});
	$( document ).on("click", "#pushroll", function() {
		roll();
	});
	$( document ).on("click", "#nocheat", function() {
		lockdown(this.checked);
	});
});
