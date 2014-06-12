var rawList = [];	//All content list
var QAList = [];	//Qualified ID index list based on filter settings
var QAID = [];		//Qualified ID list
var infodisplaying = false;

function randomFloor(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function timeCompare (Aa, Ab, Ba, Bb) {
	//if A > B return 1
	//if A = B return 0
	//if A < B return -1
	if (Aa > Ba) {
		return 1;
	} else if (Aa == Ba) {
		if (Ab > Bb) return 1;
		if (Ab == Bb) return 0;
		if (Ab < Bb) return -1;
	} else if (Aa < Ba) {
		return -1;
	}
}

function timeWithin (SAa, SAb, SAc, SAd, Ta, Tb, Tc, Td, SBa, SBb, SBc, SBd) {
	//if (SA <= T <= SB) or (SA >= T >= SB) return 1 else 0
	var xd = timeCompare(SAa, SAb, SBa, SBb);
	var xt = timeCompare(SAc, SAd, SBc, SBd);
	if ((xd == 1) || (xd == 0 && xt == 1)) {
		var Xa = SAa; SAa = SBa; SBa = Xa;
		var Xb = SAb; SAb = SBb; SBb = Xb;
		var Xc = SAc; SAc = SBc; SBc = Xc;
		var Xd = SAd; SAd = SBd; SBd = Xd;
	}
	var Ad = timeCompare(SAa, SAb, Ta, Tb);
	var Bd = timeCompare(Ta, Tb, SBa, SBb);
	var At = timeCompare(SAc, SAd, Tc, Td);
	var Bt = timeCompare(Tc, Td, SBc, SBd);
	if ((Ad == 1 || (Ad == 0 && At == 1)) || (Bd == 1 || (Bd == 0 && Bt ==1))) {
		return 0;
	} else {
		return 1;
	}
}

function unique(list) {
	var result = [];
	$.each(list, function(i, e) {
		if ($.inArray(e, result) == -1) result.push(e);
	});
	return result;
}

function parseContent() {
	var rst;
	var content = $("#pushcontent").val();

	//parse Analytics
	var regex = new RegExp("([推→噓]) ([A-Za-z0-9]+)[\\s]*:(.*)[\\s]+([0-9]+/[0-9]+)[\\s]+([0-9]+:[0-9]+)", "g");
	rawList = [];
	var i = 0;
	while(rst = regex.exec(content)) {
		rawList.push({
			floor: i+1,
			type: rst[1],
			id: rst[2],
			content: rst[3],
			date: rst[4],
			time: rst[5]
		});
		i++;
	}

	//update Analytics List
	var tmpString = "";
	for (var i in rawList) {
		tmpString += 
			"<div class=\"col-md-1\">" + rawList[i].floor + "</div>" +
			"<div class=\"col-md-1\">" + rawList[i].type + "</div>" +
			"<div class=\"col-md-2\">" + rawList[i].id + "</div>" +
			"<div class=\"col-md-6\">" + rawList[i].content + "</div>" +
			"<div class=\"col-md-1\">" + rawList[i].date + "</div>" +
			"<div class=\"col-md-1\">" + rawList[i].time + "</div>";
	}
	$("#sum_push_list_insert").html(tmpString);

	//update push count
	$("#pushCount").html(rawList.length);

	//parse qualified
	qualification();
}

function qualification() {
	QAList = [];
	QAID = [];

	//pick qualified ID up based on filter settings
	//type filtering, this one is necessary, no opt-out
	var pushtype = $(".chk_pushtype:checked").map(function() {return this.value;}).get().join("");
	for (var i in rawList) {
		if (pushtype.indexOf(rawList[i].type) >= 0) QAList.push(i);
	}

	//content filtering, optional
	if ($("#chk_filter_content").prop("checked")) {
		var tmpList = QAList;
		QAList = [];
		for (var i in tmpList) {
			if (rawList[tmpList[i]].content.indexOf($("#text_filter_content").val()) >= 0) QAList.push(tmpList[i]);
		}
	}

	//date filtering, optional
	if ($("#chk_filter_date").prop("checked")) {
		var tmpList = QAList;
		QAList = [];
		for (var i in tmpList) {
			var pd = rawList[tmpList[i]].date.split("/");
			var pt = rawList[tmpList[i]].time.split(":");
			if (timeWithin($("#sel_filter_start_date_m").val(), $("#sel_filter_start_date_d").val(), $("#sel_filter_start_time_h").val(), $("#sel_filter_start_time_m").val(), pd[0], pd[1], pt[0], pt[1], $("#sel_filter_end_date_m").val(), $("#sel_filter_end_date_d").val(), $("#sel_filter_end_time_h").val(), $("#sel_filter_end_time_m").val())) QAList.push(tmpList[i]);
		}
	}

	//id filitering, optional
	if ($("#chk_filter_id").prop("checked")) {
		var tmpList = QAList;
		QAList = [];
		var bl = $("#text_filter_id").val().trim().replace(/[\s,]+/g, ",").split(",");
		for (var i in tmpList) {
			if ($.inArray(rawList[tmpList[i]].id, bl) == -1) QAList.push(tmpList[i]);
		}
	}

	//process all qualified ID
	for (var i in QAList) {
		QAID.push(rawList[QAList[i]].id);
	}
	//update ID count
	QAID = unique(QAID);
	$("#idCount").html(QAID.length);

	//update ID List
	var tmpString = "";
	for (var i in QAID) {
		tmpString += "<div class=\"col-xs-3\">" + QAID[i] + "</div>";
	}
	$("#sum_id_list").html(tmpString);
	setOptions("#sel_winnum", 1, QAID.length);
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
			parseContent();

			showinfo("網頁內容匯入完成", "success");
		},
		error:function(xhr,status,error){
			showinfo("網頁內容匯入過程發生錯誤！", "danger");
			$("#pushcontent").val("");
			$("#result").html("");
			parseContent();
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
	$(".chk_pushtype").prop("disabled", lock);
	$("#pushimport").prop("disabled", lock);
	$("#pushurl").prop("disabled", lock);
	$("#pushcontent").prop("disabled", lock);

	$("#chk_filter_content").prop("disabled", lock);
	$("#text_filter_content").prop("disabled", lock);

	$("#chk_filter_date").prop("disabled", lock);
	$("#sel_filter_start_date_m").prop("disabled", lock);
	$("#sel_filter_start_date_d").prop("disabled", lock);
	$("#sel_filter_start_time_h").prop("disabled", lock);
	$("#sel_filter_start_time_m").prop("disabled", lock);
	$("#sel_filter_end_date_m").prop("disabled", lock);
	$("#sel_filter_end_date_d").prop("disabled", lock);
	$("#sel_filter_end_time_h").prop("disabled", lock);
	$("#sel_filter_end_time_m").prop("disabled", lock);

	$("#chk_filter_id").prop("disabled", lock);
	$("#text_filter_id").prop("disabled", lock);

	$("#chk_winnum").prop("disabled", !lock);
	$("#sel_winnum").prop("disabled", !lock);
}

function setOptions(sel, min, max) {
	$(sel).find("option").remove();
	for (var i = min; i <= max; i++) {
		var j = (i < 10)?"0"+i:i;
		var o = new Option(j, j);
		$(o).html(j);
		$(sel).append(o);
	}
}

$( document ).ready(function() {
	//initialization
	//set optiosn for selects
	setOptions("#sel_filter_start_date_m", 1, 12);
	setOptions("#sel_filter_start_date_d", 1, 31);
	setOptions("#sel_filter_end_date_m", 1, 12);
	setOptions("#sel_filter_end_date_d", 1, 31);
	setOptions("#sel_filter_start_time_h", 0, 23);
	setOptions("#sel_filter_start_time_m", 0, 59);
	setOptions("#sel_filter_end_time_h", 0, 23);
	setOptions("#sel_filter_end_time_m", 0, 59);

	//dynamic change day options accroding to month selects
	$( document ).on("change", "#sel_filter_start_date_m, #sel_filter_end_date_m", function() {
		var str = $(this).prop("id");
		str = "#" + str.substring(0, str.length - 1) + "d";
		switch ($(this).val()) {
			case "01": case "03": case "05": case "07": case "08": case "10": case "12":
				setOptions(str, 1, 31);
				break;
			case "04": case "06": case "09": case "11":
				setOptions(str, 1, 30);
				break;
			case "02":
				setOptions(str, 1, 29);
				break;
		}
	});

	//webimport
	$( document ).on("click", "#pushimport", function() {
		$("#pushcontent").val("匯入中...");
		parseContent();
		$("#result").html("");

		var weburl = $("#pushurl").val();
		if (!weburl.match("^.*://")) {
			weburl = "http://"+weburl;
			$("#pushurl").val(weburl);
		}
		webimport(weburl);
	});
	//toggle summary collapse
	$( document ).on("click", ".sum_title", function() {
		$(this).siblings(".sum_list").toggle("fast", "linear");
	});
	//auto select url while click
	$( document ).on("click", "#pushurl", function() {
		$(this).select();
	});
	//update summary while changing input or settings
	$( document ).on("keyup click", ".instantupdate", function() {
		parseContent();
		$("#result").html("");
	});
	//lockdown the settings and input before rolling
	$( document ).on("click", "#nocheat", function() {
		lockdown(this.checked);
	});
	//rock n roll!
	$( document ).on("click", "#pushroll", function() {
		$("#result").html("");
		//initial check
		if (!$("#nocheat").prop("checked")) {
			showinfo("不要作弊啦QAQ","danger");
			return;
		}
		if(QAID.length==0) {
			showinfo("沒有半個人想抽哭哭","warning");
			return;
		}

		//lockdown the roll button
		$("#nocheat").prop("disabled", true);
		$("#chk_winnum").prop("disabled", true);
		$("#sel_winnum").prop("disabled", true);
		$("#pushroll").prop("disabled", true);

		var winner = [];
		var tmpWin = -1;
		var winnum = ($("#chk_winnum").prop("checked"))?$("#sel_winnum").val():1;
		for (var i = 1; i <= winnum; i++) {
			while ($.inArray(tmpWin = randomFloor(0, winnum - 1), winner) > -1);
			winner.push(tmpWin);
		}

		var tmpString = "";
		for (var i in winner) {
			tmpString += "<div class=\"col-xs-3\">" + QAID[winner[i]] + "</div>";
		}

		//get a random winner
		$("#resultnum").html(parseInt(winnum)+"位");
		$("#result").html(tmpString);
		$("#data-result").toggle("fast", "linear");
		showinfo("開獎啦！","success");
	});
	//toggle sub-settings
	$( document ).on("click", ".filter", function() {
		$(this).parent("label").parent(".checkbox").next(".filter_block").toggle("fast", "linear");
		$(this).parent("label").parent(".checkbox").next(".filter_block").find(".filter_sub").prop("disabled", !this.checked);
	});
});
