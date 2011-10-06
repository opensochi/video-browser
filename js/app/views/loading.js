(function( $ ){

App.Views.Loading = DisplaySystem.Display.extend({ // вид
    
    model:   new (Backbone.Model.extend({
        defaults: {
            title: '', // Заголовок страницы
            content: '' // содержимое страницы
        }
    })),
    
    el: $('<div class=loading-view />'),
    
    initialize: function () {
        this.dsEl = this.el;
        $('<img src="./images/wait.gif" alt="">').appendTo(this.el);
    }
    
});

})(jQuery)
