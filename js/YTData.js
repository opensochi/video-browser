(function( $ ){

/**
 * Класс для получения данных с YouTube через API:
 *
 * http://code.google.com/intl/ru-RU/apis/youtube/reference.html
 *
 * Манипуляция происходит только с публичныи данными, тоесть не поддерживает авторизацию в сервисе.
 */
YTData = {};

YTData.USERS_URI = "http://gdata.youtube.com/feeds/api/users";
YTData.VIDEOS_URI = "http://gdata.youtube.com/feeds/api/videos";
YTData.PLAYLISTS_URI = "http://gdata.youtube.com/feeds/api/playlists";

YTData.MAX_RESULT = 50; // в YouTube API есть ограничение на количесво элементов в фиде


// Модель видео
YTData.Video = function () {

    this.id = null;          // индетификатор
	this.title = null;       // заголовок
	this.description = null; // описание
	this.thumbSmall = null;    // маленькая миниатюра
	this.thumbLarge = null;    // большая миниатюра
    this.uploader = null;    // пользователь загрузивший видео на сервер
    this.geoLat = null;      // гео координаты (latitude)
    this.geoLng = null;     // гео координаты (longitude)
    
}


// Модель плейлиста
YTData.Playlist = function () {
    
    this.id = null;          // индетификатор
    this.author = null;      // автор плейлиста
	this.title = null;       // заголовок
	this.description = null; // описание
    this.size = null;        // количество видео в плейлисте
    
}


/**
 * Функция загрузки данных с YouTube.
 * В параметре который является объектом {} opt (options) передаются опции запроса и метод
 * обработки полученных данных.
 * 
 * 
 * callback:   функция вызываемая при успешном выполнении запроса, в неё передаются разультаты запроса
 * через объект. Набор переменных в передаваемом объекте зависит от параметра method. ( callback({}) )
 * 
 * 
 * error:   функция вызываемая в случае ошибки.
 * 
 * 
 * max-results:   параметр задает максимальное число результатов в наборе результатов.
 * Этот параметр работает совместно с параметром start-index и определяет, какие из результатов
 * будут возвращены. Например, чтобы запросить второй набор из 10 результатов – допустим, результаты
 * от 11 до 20, задайте значение параметра max-results равным 10 и параметра start-index равным 11.
 * Значение этого параметра по умолчанию равно 25.
 * 
 * 
 * start-index:   Параметр start-index задает индекс первого результата в наборе результатов.
 * Нумерация параметра начинается с единицы, то есть первый результат имеет номер 1, второй 2 и т. д.
 * Этот параметр работает совместно с параметром max-results и определяет, какие из результатов
 * будут возвращены. Например, чтобы запросить второй десяток результатов (с 11 по 20),
 * присвойте параметру start-index значение 11, а параметру max-results – 10. По умалчанию значение
 * этого параметра равно 1.
 * 
 * 
 * method:   параметр указвающий на тип запроса и метод обработки полученных данных.
 * Доступны селедующие значения этого параметра:
 * 
 * 
 *      'video'
 *      Загрузка одного видео через его ID который передаётся в параметре videoid.
 *      Ответ в объект callback функции передаётся в параметре video - объект YTData.Video
 *      
 *      
 *      'playlist'
 *      Загрузка одного плейлиста через его ID который передаётся в параметре playlistid, а также
 *      загрузка видео содержащегося в этом плейлисте.
 *      Для массива видео действуют параметры start-index и max-results.
 *      Ответ в объект callback функции передаётся в параметрах playlist и items, где playlist -
 *      объект данных YTData.Playlist, а items это массив объектов YTData.Video.
 * 
 *           
 *      'user-playlists'
 *      Загружает плейлисты пользователя указаного в параметре username.
 *      В запросе за массивом плейлистов также учитываются параметры start-index и max-results.
 *      Ответ в объект callback функции передаётся в параметрах items и totalItems,
 *      где items - это массив объектов YTData.Playlist,
 *      а totalItems - это общее количество плейлистов у пользователя.
 *      
 *      
 *      'videos'
 *      Загружает список видео. У этого метода множество параметров. Если указан параметр username -
 *      имя пользователя, то будут возвращены лишь видео загруженные этим пользователем, иначе будет
 *      произведён поиск по всему видео на YouTube. Отсортировывать весь этот список пожно по
 *      следующим параметрам:
 *      'q'   задает формулировку поискового запроса. YouTube будет искать соответствия этой
 *      формулировке в метаданных видео. Метаданные видео включают название, ключевые слова, описания,
 *      принадлежащие авторам имена пользователей и категории. Следует учитывать, что пробелы,
 *      кавычки и другие знаки пунктуации в значении параметра должны быть преобразованы в соответствии
 *      с требованиями к URL (encodeURIComponent). Чтобы выполнить поиск точно по определенному
 *      словосочетанию, заключите его в кавычки. Например, чтобы найти видео, соответствующие
 *      словосочетанию "spy plane", задайте для параметра q значение %22spy+plane%22. В запросе можно
 *      также использовать логические операторы NOT (-) и OR (|), чтобы исключить из поиска видео,
 *      соответствующие ключевому слову, или найти видео, соответствующие одному или нескольким
 *      поисковым словам. Например, чтобы найти видео, соответствующие словам "boating" или "sailing",
 *      нужно установить для параметра q значение boating%7Csailing. (Вертикальная черта должна быть
 *      преобразована в соответствии с требованиями к URL.) Аналогично, чтобы найти видео,
 *      соответствующие словам "boating" или "sailing", но не "fishing", нужно установить для параметра
 *      q значение "boating&7Csailing+-fishing".
 *      'time'   позволяет искать видео, загруженное в указанный период времени. Допустимые значения
 *      для этого параметра – today (за прошедший день), this_week (за прошедшие 7 дней), this_month
 *      (за прошедший месяц) и all_time (без ограничения времени). Значение по умолчанию для этого
 *      параметра – all_time.
 *      В запросе за массивом видео также учитываются параметры start-index и max-results.
 *      Ответ в объект callback функции передаётся в параметрах items и totalItems, где items -
 *      это массив объектов YTData.Video, а totalItems - это общее количество доступных видео на сервере.
 * 
 */
YTData.load = function (opt) {
    // 0.
    // описываем переменные
    var uriParams = { // постоянные параметры которые буду перечеслятся после ? в URI
        'alt'   : 'jsonc',  // формат фида JSON Callback
        'v'     : '2'         // версия API
    };   
    var feedsURI = [];      // URI загружаемых фидов
    var feeds = [];         // загруженные фиды
    var startIndex = opt['start-index']  ||  1;  // 
    var maxResult = opt['max-results']   ||  25; //
    
    
    // 1.
    // собираем URI фидов для загрузки, в зависимости от метода
    switch (opt.method) {
        case 'video' :
            feedsURI[0] = YTData.VIDEOS_URI + '/' + opt['videoid']
                            + '?' + _ytd_paramsToString(uriParams);
            break;
        case 'playlist' :
            feedsURI = _ytd_feedsArray(YTData.PLAYLISTS_URI + '/' + opt['playlistid'],
                                                     startIndex, maxResult, uriParams);
            break;
            
        case 'videos' :
            if(opt['q']) uriParams['q'] = opt['q'];
            if(opt['time']) uriParams['time'] = opt['time'];
            if(opt['username']) {
                feedsURI = _ytd_feedsArray(YTData.USERS_URI + '/' + opt['username'] + '/uploads',
                                                     startIndex, maxResult, uriParams);
            } else {
                feedsURI = _ytd_feedsArray(YTData.VIDEOS_URI, startIndex, maxResult, uriParams);
            }
            break;
            
        case 'user-playlists' :
            feedsURI = _ytd_feedsArray(YTData.USERS_URI + '/' + opt['username'] + '/playlists',
                                                     startIndex, maxResult, uriParams);
            break;
        default : // если указан несуществующий метод, тогда ошибка
            error('Не указан, или указан неверный метод загрузки данных с YouTube');
            return;
    }
    
    
    // 2.
    // загружаем фиды, обращая внимание на параметры start-index и max-results
    var feedIndex = 0; // индекс текущего загружаемого фида
    var stopCycle = false; // полностью остановить цикл на следующей итерации

    (function loadNextFeed() {
        if(stopCycle  ||  !feedsURI[feedIndex]) { // если флаг 'остановить', или закончились URI
            convertFeeds();
            return;
        }
        
        $.ajax({
			url: feedsURI[feedIndex],
			dataType : 'jsonp',
			success : _success,
			error : error
		});
        
        function _success(feed) { // фид получен
            var skipFeed = false; // не добавлять текущий фид в набор загруженных
            
            switch (opt.method) { // методы проверки загружённого фида
                // стандартные массивы данных
                case 'videos':
                case 'user-playlists':
                case 'playlist':
                    stopCycle = !feed.data
                                ||  (feed.data.startIndex + feed.data.itemsPerPage >= feed.data.totalItems);
                    break;
            }
            if(!skipFeed) feeds.push(feed);
            feedIndex++;
            loadNextFeed();
        }
    })();
    
    
    // 3.
    // конвертируем загруженные фиды и возвращаем результат
    function convertFeeds() {
        switch (opt.method) {
            
            case 'video' :
                var entries = [];
                for(var i=0, feed ; feed=feeds[i] ; i++) {
                    entries[i] = feed.data;
                }
                opt.callback({
                        'video' : _ytd_videosFromEntries(entries)[0]
                    });
                return;
                
            case 'playlist':
                var videoEntries = [];
                for(var f=0, feed ; feed=feeds[f] ; f++) {
                    if(!feed  ||  !feed.data) {
                        error("Ошибка при загрузке фида плейлиста.");
                        return;
                    }
                    
                    var items = feed.data.items != undefined ? feed.data.items : [];
                    for(var i=0, item ; item=items[i] ; i++) {
                        videoEntries.push(item.video);
                    }
                }
                opt.callback({
                        'playlist' : _ytd_playlistsFromEntries([feeds[0].data])[0],
                        'totalItems': feeds[0].data.totalItems,
                        'items' : _ytd_videosFromEntries(videoEntries)
                    });        
                return;
            
            case 'user-playlists':
                var plsEntries = [];
                for(var f=0, feed ; feed=feeds[f] ; f++) {
                    if(!feed  ||  !feed.data) {
                        error("Ошибка при загрузке фида плейлистов пользователя.");
                        return;
                    }

                    var items = feed.data.items != undefined ? feed.data.items : [];
                    for(var i=0, item ; item=items[i] ; i++) {
                        plsEntries.push(item);
                    }
                }
                opt.callback({
                        'items': _ytd_playlistsFromEntries(plsEntries),
                        'totalItems': feeds[0] ? feeds[0].data.totalItems : 0
                    });
                return;
                
            case 'videos':
                var videoEntries = [];
                for(var f=0, feed ; feed=feeds[f] ; f++) {
                    if(!feed  ||  !feed.data) {
                        error("Ошибка при загрузке массива видео.");
                        return;
                    }

                    var items = feed.data.items != undefined ? feed.data.items : [];
                    for(var i=0, item ; item=items[i] ; i++) {
                        videoEntries.push(item);
                    }
                }
                opt.callback({
                        'items' : _ytd_videosFromEntries(videoEntries),
                        'totalItems' : feeds[0] ? feeds[0].data.totalItems : 0
                    });
                return;
        }
    }

    function error(text) {
        if(text  &&  console  &&  console.error) console.error(text);
        if(opt.error) opt.error();
    }
}


// возвращает массив URI, сформированных по правилам запросов за масивами данных.
function _ytd_feedsArray (uri, startIndex, maxResult, params) {
    var result = [];
    var count = (maxResult/YTData.MAX_RESULT) * YTData.MAX_RESULT;
    
    for(var i=1, x=0 ; i<=maxResult ; i += YTData.MAX_RESULT, x++) {
        var p = {
            'start-index' : (i + startIndex - 1),
            'max-results'  : ((maxResult - i) < YTData.MAX_RESULT
                                ? (maxResult - i) + 1
                                : YTData.MAX_RESULT)
        };
        result[x] = uri + '?' + _ytd_paramsToString(_.extend(params, p));
    }
    
    return result;
}


// преобразует массив params в строку параметров, вида ключ0=значение0&ключ1=значение1
// params - массив параметров
function _ytd_paramsToString (params) {
    var result = '';
    for(var key in params) {
        result = result + key + '=' + params[key] + '&';
    }
    if(result.length > 0) result = result.slice(0, -1); // удаляем последний символ &
    return result;
}


// конвертирует данные возвращённые с сервера в YTData.Video
// entries - массив элементов из фида
// возвращает массив YTData.Video длиной entries.length
function _ytd_videosFromEntries (entries) {
    var result = [];
    for(var i = 0, entry ; entry = entries[i] ; i++) {
        var v = new YTData.Video();
        v.id = entry.id;
        v.uploader = entry.uploader;
		v.title = entry.title;
		v.description = entry.description;
		if(entry.thumbnail) {
			v.thumbSmall = entry.thumbnail.sqDefault;
			v.thumbLarge = entry.thumbnail.hqDefault;
		}
        if(entry.geoCoordinates) {
            v.geoLat = entry.geoCoordinates.latitude;
            v.geoLng = entry.geoCoordinates.longitude;
        }
		result[i] = v;
    }
    return result;
}

function _ytd_playlistsFromEntries (entries) {
    var result = [];
    for(var i = 0, entry ; entry = entries[i] ; i++) {
        var p = new YTData.Playlist();
        p.id = entry.id;
        p.author = entry.author;
		p.title = entry.title;
		p.description = entry.description;
        p.size = entry.size != undefined ? entry.size : entry.totalItems;
		result[i] = p;
    }
    return result;
}


})( jQuery );