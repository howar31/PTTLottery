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
	var pushtype = $(".chk_pushtype:checked").map(function() {return this.value;}).get().join("");
//console.log(pushtype);
	var regex = new RegExp("([" + pushtype + "]) ([A-Za-z0-9]+)[\\s]*:(.*[^\\s])[\\s]+([0-9]+/[0-9]+)[\\s]+([0-9]+:[0-9]+)", "g");
	var content = document.getElementById("pushcontent").value;
	var result;
	idList = [];
	while(result = regex.exec(content)) {
		idList.push(result[2]);
//console.log(result);
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
		url: url, 
		type: "GET",
		dataType: "text",
		success:function(result){
//console.log(result);
			var webresult = result.responseText;
//console.log(webresult);

			var plaintext = "";
			var regex = new RegExp("<div class=\"push\">\n[\\s]*<span.*\">(.*)</span>[\\s]*\n[\\s]*<span.*\">(.*)</span>[\\s]*\n[\\s]*<span.*\">:(.*)</span>[\\s]*\n[\\s]*<span.*\">([0-9]+/[0-9]+) ([0-9]+:[0-9]+)</span></div>", "g");
			while(rst = regex.exec(webresult)) {
//console.log(rst);
//console.log("MATCH: "+rst);
				plaintext += rst[1]+" "+rst[2]+":"+rst[3]+" "+rst[4]+" "+rst[5]+"\n";
			}
//console.log(templist);

//			var div = document.createElement("div");
//			div.innerHTML = webresult;
//			var plaintext = div.textContent || div.innerText || "";
//console.log(plaintext);

			$("#pushcontent").val(plaintext);
			parseIDs();
			showinfo("網頁內容匯入完成", "success");
		},
		error:function(xhr,status,error){
			showinfo("網頁內容匯入過程發生錯誤！", "danger");
			$("#pushcontent").val("");
			$("#result").html("");
			parseIDs();
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
console.log(lock);
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
		parseIDs();
		$("#result").html("");

		var weburl = $("#pushurl").val();
		if (!weburl.match("^.*://")) {
			weburl = "http://"+weburl;
			$("#pushurl").val(weburl);
		}
		webimport(weburl);
	});
	$( document ).on("keyup click", "#pushcontent, .chk_pushtype", function() {
		parseIDs();
		$("#result").html("");
	});
	$( document ).on("click", "#pushroll", function() {
		roll();
	});
	$( document ).on("click", "#nocheat", function() {
		lockdown(this.checked);
	});
});
