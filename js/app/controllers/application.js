/**
 * Основной контроллёр приложения.
 */
App.Controllers.Application = Backbone.Router.extend({

    routes : {
        "" : "start", 					// Пустой hash-тэг
        "!/" : "start", 				// Начальная страница
        "!/playlists" : "playlists", 	// плейлисты
        "!/playlists/" : "playlists", 	// плейлисты
        "!/playlists/:id" : "playlist", // плейлист
        "!/videos" : "videos",          // Видео (все)
        "!/videos/" : "videos",         // Видео (все)
        "!/videos/:id" : "video", 		// Видео (одно)
        "!/search/:text" : "search", 	// Видео
        "!/page/:id" : "page", 			// Страница Blogger
        "!/spo" : "spo" 			    // Страница СПО
    },
	
    elContent : null,
    displaySystem : null,
    
    scopeView : null, // вид списка элементов
    loadingView : null, // индикатор загрузки
    errorView : null, // вид отображающий ошибку
    pageView : null, // вид показа страниц (заголовок, содержание)
    videoView : null, // отображает видео


    // Инициализируем контроллер
    initialize : function (params) {
        this.elContent = $('#content');
        this.scopeView = new App.Views.Scope();
        this.loadingView = new App.Views.Loading();
        this.errorView = new ErrorView();
        this.pageView = new App.Views.Page();
        this.videoView = new App.Views.Video();

        this.displaySystem = new DisplaySystem(this.elContent);

        this.errorView.el.hide();
        this.displaySystem.addDisplay('error', this.errorView);

        this.loadingView.el.hide();
        this.displaySystem.addDisplay('loading', this.loadingView);
        
        this.scopeView.el.hide();
        this.displaySystem.addDisplay('scope', this.scopeView);

        this.pageView.el.hide();
        this.displaySystem.addDisplay('page', this.pageView);
        
        this.videoView.el.hide();
        this.displaySystem.addDisplay('video', this.videoView);
    },
	
	
    // от сюда всё начинается (корень) ======================================================= start
    start : function() {
        this.uiTitle('');
        this.displaySystem.current('loading');
        this.scopeView.model.set(this.scopeView.model.defaults);// TODO сброс настроек. Костыльно?
        var intro = $('#intro').show();
        this.scopeView.model.set({
            title: 'Рубрики нашего канала',
            sidebar: intro,
            sidebar_backstage: $('#backstage'),
            items: new YTItemsGetter({
                'method' : 'user-playlists',
                'username' : App.YT_USER
            })
        });
        this.displaySystem.current('scope');
    },
    
    
    // плейлисты ========================================================================= playlists
    playlists : function() {
        this.uiTitle('Рубрики');
        this.displaySystem.current('loading');
        this.scopeView.model.set(this.scopeView.model.defaults);// TODO сброс настроек. Костыльно?            
        this.scopeView.model.set({
            title:'Рубрики нашего канала',
            items: new YTItemsGetter({
                method: 'user-playlists',
                username: App.YT_USER
            })
        });
        this.displaySystem.current('scope');
    },


    // плейлист =========================================================================== playlist
    playlist : function(id) {
        this.uiTitle('');
        this.displaySystem.current('loading');
        YTData.load({
            'method' : 'playlist',
            'playlistid' : encodeURIComponent(id), // данные от пользователя экранируем
            'start-index' : 1,
            'max-results' : 0,
            'callback' : $.proxy(function (data) {
                    this.uiTitle(data.playlist.title);
                    this.scopeView.model.set(this.scopeView.model.defaults); // TODO сброс настроек. Костыльно?            
                    this.scopeView.model.set({
                        'title' : data.playlist.title,
                        'description' : data.playlist.description,
                        'items' : new YTItemsGetter({
                            'method' : 'playlist',
                            'playlistid' : encodeURIComponent(id), // данные от пользователя экранируем
                            'start-index' : 1,
                            'max-results' : 0,
                            'callback' : function () {

                            }
                        })
                    });
                    this.displaySystem.current('scope');
                }, this),
            'error' : $.proxy(function () {
                    this.displaySystem.current('error');
                }, this)
        });
        
    },

	
    // видео (все) ========================================================================== videos
    videos : function() {
        this.uiTitle('Все видеоролики');
        this.displaySystem.current('loading');
        this.scopeView.model.set(this.scopeView.model.defaults);// TODO сброс настроек. Костыльно?            
        this.scopeView.model.set({
            'title':'Все видео на нашем канале',
            'items' : new YTItemsGetter({
                'method' : 'videos',
                'username' : App.YT_USER
            })
        });
        this.displaySystem.current('scope');
    },
    
    
    // видео (одно) ========================================================================== video
    video : function(id) {
        var video = new App.Models.Video();
        this.uiTitle('');
        this.displaySystem.current('loading');

        video.fetch({
            id: id,
            success: $.proxy(_callback, this),
            error: $.proxy(_error, this)
        });

        function _callback() {
            if(App.YT_USER !== video.get('uploader')) { // Если видео загруженно не пользователем, то ошибка
                $.proxy(_error, this)();
                return;
            }
            
            this.uiTitle(video.get('title'));
            this.videoView.model.set(this.videoView.model.defaults); // TODO сброс настроек. Костыльно?
            this.videoView.model.set({
                video: video
            });
            this.displaySystem.current('video');
        }

        function _error() {// не удалось загрузить видео, отображаем ошибку
            this.displaySystem.current('error');
        }
    },
	
	
    // страница =============================================================================== page
    page : function (id) {
        this.uiTitle('');
        this.displaySystem.current('loading');
        new Blogger.Page().load(id, App.BLOG_ID, $.proxy(callback, this), $.proxy(error, this));
		
        function callback(b_page) { // страница загружена
            this.uiTitle(b_page.title);
            this.pageView.model.set(this.pageView.model.defaults);// TODO сброс настроек. Костыльно?
            this.pageView.model.set({
                'title' : b_page.title,
                'content' : b_page.content
            });
            this.displaySystem.current('page');
        }
        
        function error() { // не удалось загрузить страницу, отображаем ошибку
            this.displaySystem.current('error');
        }
    },


    // СПО ===================================================================================== СПО
    spo: function () {
        var title = 'Свободное програмное обеспечение';
        this.uiTitle('');
        $.ajax({
            url: 'spo.html',
            success: $.proxy(success, this),
            error: $.proxy(error, this),
            dataType: 'html'
        });

        function success (content) {
            this.uiTitle(title);
            this.pageView.model.set(this.pageView.model.defaults);// TODO сброс настроек. Костыльно?
            this.pageView.model.set({
                'title' : title,
                'content' : content
            });
            this.displaySystem.current('page');
        };

        function error () {
            this.displaySystem.current('error');
        };
    },
	
    // поиск ================================================================================ search
    search : function(text) {
        this.uiTitle('Поиск');
        this.displaySystem.current('loading');
        this.scopeView.model.set(this.scopeView.model.defaults);// TODO сброс настроек. Костыльно?            
        this.scopeView.model.set({
            'title':'Результаты поиска видеороликов',
            'items' : new YTItemsGetter({
                'method' : 'videos',
                'username' : App.YT_USER,
                'q' : encodeURIComponent(text)
            })
        });
        this.displaySystem.current('scope');
    },
	

    /** 
     * устанавливает основной контент на странице.
     * Скрывает все дочерние элементы элемента elContent, затем добавляет/перемещает в этот же тег
     * содержимое параметра content ($(content))
	 */
    uiContent : function (content) {
        content = $(content); // мало ли что нам передали в этом параметре
        var container = this.elContent;

        container.slideUp(500, $.proxy(function () {// плавненько прячем контейнер
            // останавливаем видео ролик в виде videoView, иначе он играет на фоне при переходе на другой вид
            // TODO костыльно, лучше в самом VideoView отлавливать его скрытие, и остановить видеролик
            if(!content.hasClass('video-view')) {
                this.videoView.model.set({'video' : null});
            }
            container.children().hide(); // скрываем всё содержимое контейнера
            container.append(content); // вставляем новый контент
            content.css('display', ''); // показываем новый контент в контейнере
            container.slideDown(500);// вновь отображаем контейнер
        }, this)); 
    },
    
    /**
     * Изменяет заголовок окна
     */
    uiTitle : function (title) {
        document.title = title ? title + ' | ' + App.TITLE : App.TITLE;
    }
    
});


/**
 * расширенный ScopeViewItemsGetter для работы с массивами данных ютуба. Поддерживает следующие
 * методы (opt.method) 'playlist', 'videos' и 'user-playlists'.
 */
YTItemsGetter = function (opt) {

    _.extend(this, ScopeViewItemsGetter.prototype, {
        
        initialize : function () {},

        getItems : function (index, count, callback) {
            
            opt['start-index'] = index + 1;
            opt['max-results'] = count;
            opt['callback'] = _callback;
            opt['error'] = function (){ callback(null); };
            _this = this;
            YTData.load(opt);
            
            function _callback(data) {
                switch (opt.method) {
                case 'user-playlists' :
                    callback(playlistsToScopeViewItems(data.items), data.totalItems);
                    return;
                case 'playlist' :
                case 'videos' :
                    callback(videosToScopeViewItems(data.items), data.totalItems);
                    return;
                default:
                    callback(null, 0);
                    return;
                }
            }
        }

    });
    
}


/**
 * Метод помощник (helper) конвертирующий массив объектов YTData.Video в массив ScopeViewItem
 */
function videosToScopeViewItems(videos) {
    var items = [];
    for (var i = 0, video; video = videos[i]; i++) {
        items[i] = new ScopeViewItem({
            'title' : video.title,
            'description' : video.description,
            'href' : '#!/videos/' + video.id,
            'classes' : 'video_' + video.id,
            'icon' : {
                'size' : 60,
                'image' : video.thumbSmall
            }
        });                
    };
    return items;
};


/**
 * Метод помощник (helper) конвертирующий массив объектов YTData.Playlist в массив ScopeViewItem
 */
function playlistsToScopeViewItems(playlists) {
    var items = [];
    for (var i = 0, playlist; playlist = playlists[i]; i++) {
        items[i] = new ScopeViewItem({
            'title' : playlist.title,
            'description' : playlist.description,
            'href' : '#!/playlists/' + playlist.id,
            'classes' : 'playlist_' + playlist.id,
            'icon' : {
                'size' : 60,
                'title' : 'Количество видеозаписей в плейлисте',
                'method' : 'symbol',
                'symbol' : playlist.size
            }
        });                
    };
    return items;
};
