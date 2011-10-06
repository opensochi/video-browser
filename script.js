$(document).ready(function(){

    // TODO перемести весь код в App
	
	// search-box - форма поиска (в заголовке страницы) ---------------
	$("#search-wrap > form").submit(onSearch);
	
	function onSearch() {
		var text = encodeURIComponent($('#search-wrap .search-box').attr('value'));
		if(text == '') return;
		window.location.hash = '#!/search/' + text;
		return false;
	};

});