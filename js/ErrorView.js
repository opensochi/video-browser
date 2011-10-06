/* 
 * @fileOverview Вид показывающий ошибку
 */

(function( $ ){


// Модель
ErrorViewModel = Backbone.Model.extend({
    defaults: {
        // 'key' : 'value'
    }
});


// Вид
ErrorView = Backbone.View.extend({
    
    model : new ErrorViewModel(),
    
    el : $('<div class=error-view />'),
    
    initialize : function () {
        this.dsEl = this.el;
        $('<h2>Ошибка!</h2>').appendTo(this.el);
    }
    
});
_.extend(ErrorView.prototype, DisplaySystem.Display.prototype);

})(jQuery)
