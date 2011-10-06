/**
 *
 * id : индетификатор видео
 * title : заголовок видео
 * description : описание
 * uploader : пользователь загрузивший видео на сервер
 * thumbSmall : малая превьюшка
 * thumbLarge : большая превьюшка
 * geoLat : гео координаты (latitude)
 * geoLng : // гео координаты (longitude)
 *
 * Использовать так:
 * video.fetch({
 *     id : '', // индетификатор видео
 *     ...
 * });
 */
App.Models.Video = Backbone.Model.extend({

    sync : function (method, model, options) {
        if(method !== 'read') {
            error();
            return;
        }

        YTData.load({
            videoid: options.id,
            method: 'video',
            username: App.YT_USER,
            callback: callback,
            error: error
        });

        function callback(data) {
            if(options.success) {
                options.success(data.video, 200, null);
            }
        };

        function error() {
            if(options.error) {
                options.error('', ''); // TODO Реализовать возврат информации при ошибке
            }
        };
    }

});