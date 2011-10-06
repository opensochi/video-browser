/**
 * @fileOverview Вид видео страницы. работает с YTData.Video.
 */
(function( $ ){

// для уникальной индетификации DOM элемента карты
_yt_video_view_map_id = 0;

App.Views.Video = Backbone.View.extend({
	
	model: new (Backbone.Model.extend({
        defaults: {
            video: null // Видео YTData.Video
        }
    })),

    el: $('<div class=video-view />'),
    elTitle: null,
    elDescription: null,
    elPlayer: null,
    elSocialButtons: null,
    elShareLink: null,
    elEmbedCode: null,
    elMap: null,
    
    geoMap: null,
    geoMapMarker: null,

    yaShareInstance : null,

    _currentDisplay: false, // этот дисплей текущий
	//className: "video-view",

	initialize: function() {
        this.dsEl = this.el;
        this.elTitle = $('<div class="title topic" />').appendTo(this.el);
        var lColumn = $('<div class=l-column />').appendTo(this.el);
        this.elPlayer = $('<iframe class=player width=560 height=345 />').appendTo(lColumn);
        this.elDescription = $('<div class=description />').appendTo(lColumn);
        this.elMap = $('<div class=map />').appendTo(lColumn);
        
        var rColumn = $('<div class=r-column />').appendTo(this.el);
        
        this.elSocialButtons = $('<div class=socialbuttons />').appendTo(rColumn);

        var shareInputs = $('<div class=shareinputs />').appendTo(rColumn);
        $('<span>Ссылка на это видео:</span>').appendTo(shareInputs);
        this.elShareLink = $('<input type=text readonly=readonly class=sharelink />').appendTo(shareInputs);
        
        $('<span>Код для вставки видео:</span>').appendTo(shareInputs);
        this.elEmbedCode = $('<input type=text readonly=readonly class=embedcode />').appendTo(shareInputs);
        
		this.model.bind('change', this._changeModel, this);
	},
    
    // вызывается при смене значений полей в модели (model)
    _changeModel: function () {
        if(this.model.hasChanged('video')) {
            var video = this.model.get('video'),
                id = video.get('id'),
                title = video.get('title'),
                description = video.get('description');

            if(video &&  title)
                this.elTitle.text(title).show();
            else this.elTitle.text('').hide();
            
            if(video &&  description)
                this.elDescription.text(description).show();
            else this.elDescription.text('').hide();

            // Создание кномок соц.сетей
            this.elSocialButtons.empty();
            if(video) this._createSocialButtons(this.elSocialButtons, video);

            if(video) {
                this.elShareLink.attr('value', window.location);
                this.elEmbedCode.attr('value', '<iframe width="560" height="315" src="http://www.youtube.com/embed/' + id + '?rel=0" frameborder="0" allowfullscreen></iframe>');
            } else {
                this.elShareLink.attr('value', '');
                this.elEmbedCode.attr('value', '');
            }
        }
    },

    _createSocialButtons: function (el, video) {
    console.log(video.get('thumbLarge'));
        el.append('<div id=ytv_ya_share >');
        var YaShareInstance = new Ya.share({
            element: 'ytv_ya_share',
            title: video.get('title'),
            description: video.get('description'),
            image: video.get('thumbLarge')
        });
        
        // Блок еще не проинициализировался, поэтому ничего не произойдет
        //YaShareInstance.updateShareLink();



        // Vkontakte Like Button
        // http://vkontakte.ru/pages.php?o=-1&p=%C4%EE%EA%F3%EC%E5%ED%F2%E0%F6%E8%FF%20%EA%20%E2%E8%E4%E6%E5%F2%F3%20%CC%ED%E5%20%ED%F0%E0%E2%E8%F2%F1%FF
        var pageId = crc32(video.get('id'));
        var vkId = 'vk_like_btn_' + pageId;
        el.append('<div id="'+vkId+'"></div>');
        VK.Widgets.Like(vkId, {
                type: "button",
                verb: 1,
                pageTitle: video.get('title'),
                pageDescription: video.get('description'),
                pageImage: video.get('thumbLarge'),
                pageUrl: window.location
            }, pageId);
    },
    
    setMapLocation: function (lat, lng) {
        var pos = new L.LatLng(lat, lng);
        this._getMap().setView(pos, 20);
        this.geoMapMarker.setLatLng(pos);
    },
    
    _getMap: function () {
        if(this.geoMap) return this.geoMap;
        
        var mapId = 'map_' + (_yt_video_view_map_id++);
        this.elMap.attr('id', mapId);
        
        this.geoMap = new L.Map(mapId, {
            center: new L.LatLng(21.505, -2.09), 
            zoom: 2
        });
        var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/' + App.MAP_API + '/997/256/{z}/{x}/{y}.png',
        cloudmadeAttrib = 'video.opensochi.org',
        cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttrib});

        this.geoMap.addLayer(cloudmade);

        this.geoMapMarker = new L.Marker(new L.LatLng(51.5, -0.09));
        this.geoMap.addLayer(this.geoMapMarker);

        return this.geoMap;
    }
});

// Реализуем интерфейс DisplaySystem.Display
_.extend(App.Views.Video.prototype, DisplaySystem.Display, {

    dsVisible: function (visible) {
        var video = this.model.get('video');
        if(video) {
            if(visible) {
                this.elPlayer.attr('src', 'http://www.youtube.com/embed/' + video.get('id')).show();
            } else {
                this.elPlayer.attr('src', '' ).hide();
            }
        }
        
        // Geo location map
        this.elMap.hide();
        if( visible  &&  video  &&  video.get('geoLat') !== null  &&  video.get('geoLng') !== null ) {
            this.elMap.show();
            this.setMapLocation(video.get('geoLat'), video.get('geoLng'));
        }
    },

    dsChange: function (current) {
        this._currentDisplay = current;
    }

});

})(jQuery)