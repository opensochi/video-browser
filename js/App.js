App = {

    TITLE : 'video.opensochi.org',

    // Имя пользователя на YouTube, учитывается регистр
    YT_USER : 'maksportal',
    //YT_USER : 'OpenSochi',

    // Blogger blog ID
    BLOG_ID : "78550264219113186", // video-opensochi

    // Cloud Made API KEY
    MAP_API : 'f140f2b8fc9e4b9ebcfc069d7b27a7e3',

    // Google Analytics если указать хоть в одном из параметров пустое значение ''
    // то скрипт для статистики не будет устанавливаться.
    GA_ACCOUNT : 'UA-25770420-1',
    GA_DOMAIN_NAME : 'opensochi.org',

    Controllers: {},
    Models: {},
    Views: {},

    init: function () {
        this._setupGoogleAnalytics();
        new App.Controllers.Application();
        Backbone.history.start();  // Запускаем HTML5 History push
    },

    _setupGoogleAnalytics: function () {
        if(!this.GA_ACCOUNT  ||  !this.GA_DOMAIN_NAME) return;
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', this.GA_ACCOUNT]);
        _gaq.push(['_setDomainName', this.GA_DOMAIN_NAME]);
        _gaq.push(['_setAllowHash', true]);
        _gaq.push(['_trackPageview']);
        
        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    }

}