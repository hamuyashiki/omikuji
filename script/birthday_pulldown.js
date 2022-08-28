'use strict';
var optionLoop, this_day, this_month, this_year, today;

today = new Date();
this_year = today.getFullYear();　 // 西暦で取得
this_month = today.getMonth() + 1; // 0が一月のため1を加算
this_day = today.getDate();

optionLoop = function(start, end, id, ini_display) {
	var i, opt;

	opt = null;

	for (i = start; i <= end ; i++) {
		if (i === ini_display) {
			opt += "<option value='" + i + "' selected>" + i + "</option>";
		} else {
			opt += "<option value='" + i + "'>" + i + "</option>";
		}
	}
	return document.getElementById(id).innerHTML = opt;
};

optionLoop(1950, this_year, 'id_year', this_year);
optionLoop(1, 12, 'id_month', this_month);
optionLoop(1, 31, 'id_day', this_day);