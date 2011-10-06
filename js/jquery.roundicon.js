(function( $ ){
	
/**
 * 
 */
	jQuery.fn.roundicon = function( options ) {
	
        var $this = $(this);
    
		var settings = {
			'size'		: '40', // диаметр иконки
			'color'		: '', // цвет иконки (фоновый)
            'bgColor'   : '',
            'title'     : '', // всплывающая подвказка над иконкой
			'method'  	: '' // метод отображения иконки
	    };
		
		var methods = {
			'symbol' : function (params) {
                $this.css({
                    'fontWeight' : 'bold',
                    'fontSize' : settings.size / 2 + 'px', // 50%
                    'lineHeight' : settings.size / 100 * 90 + 'px' // 90%
                });
                $this.text(settings.symbol);
			}
		};
		
		return this.each(function() {        
			
		    // если переданны опции, то заносим их в настройки
			if ( options ) { 
				$.extend( settings, options );
		    }
			
			// Базовые настройки иконки
			$this.addClass('round-icon');
			$this.css({
				'backgroundColor' : settings.bgColor,
                'color' : settings.color,
				'width' : settings.size,
				'height' : settings.size,
                'textAlign' : 'center',
                'verticalAlign' : 'middle'
			});
            if(settings.title) $this.attr('title', settings.title);
            if(settings.image) {
                $this.css({
                    'backgroundImage' : 'url("' + settings.image + '")',
                    'backgroundPosition' : 'center center'
                });
            }

		    // Вызов методов
		    if ( methods[settings.method] ) {
		    	return methods[ settings.method ].apply(settings.params);
		    }
		    
		    return this;
		      
		 });
	
	};

})( jQuery );