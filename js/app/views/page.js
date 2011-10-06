(function( $ ){

App.Views.Page = DisplaySystem.Display.extend({

    model:  new (Backbone.Model.extend({
        defaults: {
            title: '', // Заголовок страницы
            content: '' // содержимое страницы
        }
    })),

    el: $('<div class=page-view />'),
    elTitle: null,
    elContent: null,
    
	initialize: function(){
        this.dsEl = this.el;
		this.elTitle = $('<div class=title />').appendTo(this.el);
        this.elContent = $('<div class=content />').appendTo(this.el);
        
        this.model.bind('change', this._changeModel, this);
	},
    
    // вызывается при смене значений полей в модели (model)
    _changeModel: function () {
        if(this.model.hasChanged('title')) {
            this.elTitle.text(this.model.get('title'));
        }
        
        if(this.model.hasChanged('content')) {
            this.elContent.html(this.model.get('content'));
        }
    }
	
});
//_.extend(App.Views.Page.prototype, DisplaySystem.Display);


})(jQuery)