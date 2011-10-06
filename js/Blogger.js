
Blogger = {};

Blogger.FEEDS_URI = "http://www.blogger.com/feeds";

/**
 * Страница блоггера.
 * Используй функцию Blogger.loadPage для загрузки страниц с сервера
 */
Blogger.Page = function () {

	this.id = ""; // индетификатор страницы
	this.blogid = ""; // индетификатор блога
    this.title = ""; // заголовок
	this.content = ""; // содержание
	
	/**
	 * Загружает страницу
	 * 
	 * @param id индетификатор страницы
     * @param blogid индетификатор блога, из которого будет взята страница
	 * @param callback(playlist) вызываемая функция при удачной загрузки. Передаётся Blogger.Page
	 * @param error function вызывается при возникновении ошибки
	 */
	this.load = function (id, blogid, callback, error) {
		var _page = this;
		$.ajax({
			url: Blogger.FEEDS_URI + '/' + blogid + '/pages/full/' + id + '?v=2&alt=json',
			dataType : 'jsonp',
			success : _success,
			error : error
		});
		
		// AJAX запрос выполнен, данные с сервера получены
		function _success(json, jqXHR, textStatus) {
			_page.id = json.id;
            _page.blogid = blogid;
			_page.title = json.entry.title.$t;
			_page.content = json.entry.content.$t;
			callback(_page);
		}
		return this;
	};
};

