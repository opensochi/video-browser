(function( $ ){

    ScopeViewModel = Backbone.Model.extend({

        defaults: {

            /**
             * Заголовок. Устанавливается через jQuery метод text().
             *
             * Если значение пустое (!title) то DOM элемент прячется через CSS
             * display:none
             *
             * css путь - #scope-view > .title
             */
            title: null,

            /**
             * Описание в заголовке. Желательно краткое. Значение является html
             * данными, чтобы была вожможнось указывать ссылки, выделять текст
             * и тд. Чтобы на ломать дизайн желательно использовать только текстовые
             * данные (не картинки, не iframe и тд)
             * Соответственно устанавливается через jQuery метод html().
             *
             * Если значение пустое (!description) то DOM элемент прячется через CSS
             * display:none
             *
             * css путь - #scope-view > .description
             */
            description: null,

            /**
             * TODO это нужно реализовать
             */
            icon : null, // иконка в заголовке (roundicon)

            /**
             * сайдбар, дополнительная область в ScopeView, гораздо меньшая
             * по размеру списка элементов. Используется для отображения
             * дополнительной информаци в виде виджетов или простого текста.
             *
             * Если этого параметра нет, то эта область скрывается от пользователя
             * (display:none), тем самым освобождает место в виде, которое
             * займут другие элементы вида увеличившись в размере.
             *
             * Значение в этом параметре будет использоваться следующим образом:
             *
             * elSidebar.append($(sidebar_value));
             *
             * Поэтому можно указывать селекторы, DOM элементы, jQuery DOM элементы
             * и тд.
             *
             * При смене значения этого параметра, текущее содержимое области
             * (.sidebar) будет либо перемещено в закулисы (sidebar_backstage), либо удалено.
             */
            sidebar : null,

            /**
             * Параметр регулирующий будет ли текущее содержимое установленное в
             * sidebar при смене удалятся или перемещатся в закулисы
             * Если значение установленно то при смене параметра sidebar, предыдущее содержимое
             * перемещается в закулисы, jQuery элемент которых указан в этом параметре.
             * В качестве примера, это можно показать так:
             *
             * $(old_sidebar).append($(sidebar_backstage));
             *
             * Если же напротив значение не установленно, то предыдущее содержимое
             * удаляется:
             *
             * $(old_sidebar).remove();
             *
             * По умолчанию это параметр установлен в null, тоесть предыдущее содержимое сайдбара
             * при смене будет удалятся.
             */
            sidebar_backstage : null,

            /**
             * Элементы, вернее интерфейс их получения.
             * Параметр класса ScopeViewItemsGetter. Если набор элементов изменился, то следует заного
             * переустановить этот параметр, тем самым застравив вид перерендерить список элементов.
             */
            items : null
        },

        /**
         * Метод помощник (helper), с помощью которого можно разом установить два
         * параметра sidebar и sidebar_backstage
         */
        setSidebar : function (sidebar, sidebar_backstage) {
            this.set({
                sidebar : sidebar,
                sidebar_backstage : (sidebar_backstage || '')
            });
        }
    });

	/**
     * 
     * Главная цель этого вида - отображение списка элементов (ссылок) в удобной
     * для пользователя форме.
     * 
     * Настраивается вид через его модель (как нистранно =)).
     * 
     * Методом items указывается объект получения элементов (ScopeView.Item) из набора (ScopeView.ItemsGetter).
     *    
     */
    App.Views.Scope = DisplaySystem.Display.extend({
	
        /** 
         * Свойства (параметры) вида хранятся в его модели
         * Свойства устанавливаются так:
         * 
         * ScopeView.model.set({
         * 		title : 'Заголовок вида',
         * 		description : 'Краткое описание вида'
         * });
         * 
         */
        model : new ScopeViewModel(),
	
        /**
         * Набор дисплеев (ScopeViewDisplay) переключение между которыми происходит через model.display
         * Дисплеи занимаются отрисовкой элементов (items).
         */
        //displays : {},
        ds : null, // DisplaySystem

        /**
         * Сразу подготавливаем элемент-оббёртку, чтобы его использовать в initialize
         */
        el : null,
        /**
         * DOM структура создаётся в initialize.
         * Часто используемые элементы заносится в параметры ниже для их
         * повторного использования без прибегания к поиску в DOM структуре документа.
         */
        // jQuery DOM объект сайдбара вида
        elSidebar : null,
        // jQuery DOM объект контейнера вида
        elContainer : null,
        // jQuery DOM объект заголовка вида
        elTitle : null,
        // jQuery DOM объект описания вида
        elDescription : null,
        // jQuery DOM объект дисплея отображающего элементы (items)
        elDisplay : null,
        elDisplaysChooser : null, // UI смены дисплеев

        /**
         * Метод инициализации вида при его создании.
         * Создаём DOM структура вида
         * Начинаем следить за изменениями пераметров (model)
         * Инициализируем дисплеи
         */
        initialize : function () {            
            // Создаём DOM структуру вида =========================================
            this.el = $('<div class=scopeview />');
            this.dsEl = this.el;
            this.elSidebar = $('<div class=sidebar />').appendTo(this.el)
                .css({'display':'none'});
            this.elContainer = $('<div class=container />').appendTo(this.el);
            this.elTitle = $('<div class=title />').appendTo(this.elContainer);
            this.elDescription = $('<div class=description />').appendTo(this.elContainer);
            this.elDisplay = $('<div class=display />').appendTo(this.elContainer);

            // прикрепляем обработчики событий параметров (model) ==================
            this.model.bind('change', this._changeModel, this);
            
            // Инициализируем систему дисплеев =====================================
            this.ds = new DisplaySystem(this.elDisplay);

            this.ds.addDisplay('list', new ScopeViewListDisplay(this));

            // UI конролл смены дисплея пользователем
            this.elDisplaysChooser = $('<ul class="displays-chooser">').insertBefore(this.elTitle);

            this.ds.iterDisplays($.proxy(function (name, display) {
                var _li = $('<li class="'+name+'" rel='+display+' />')
                    .appendTo(this.elDisplaysChooser)
                    .click($.proxy(this.displayChoose, this));
            }, this));

            this.ds.current('list');
        },
	
        /**
         * Обработчик события 'change' модели этого вида.
         */
        _changeModel : function () {
            // Изменился заголовок ========================== title
            if(this.model.hasChanged('title')) {
                var _t = this.model.get('title');
                $(this.elTitle).text(_t);
                $(this.elTitle).css( {
                        'display': !_t ? 'none' : ''
                    } );
            }

            // Изменилось описание ===================== description
            if(this.model.hasChanged('description')) {
                var _d = this.model.get('description');
                this.elDescription.html(_d);
                this.elDescription.css({
                        'display': !_d ? 'none' : ''
                    });
            };

            // Изменилcя sidebar ============================= sidebar
            if(this.model.hasChanged('sidebar')) {
                // Сначала разберёмся с предыдущем сайдбаром
                var _ps = this.model.previous('sidebar');

                // если сайдбар был установлен ранее
                if(_ps) {
                    var _psb = this.model.previous('sidebar_backstage');
                    // перемещаем сайдбар в закулисы
                    if(_psb) {
                        $(_ps).appendTo($(_psb));
                    } else { // или удаляем его
                        $(_ps).remove();
                    }
                }

                var _s = this.model.get('sidebar');
                var showSidebar = _s && _s.length > 0;
                if(showSidebar) this.elSidebar.append(_s);
                this.elSidebar.css({
                        'display': (showSidebar ? '' : 'none')
                    });
            }

            // Изменилcя display ============================= display
            if(this.model.hasChanged('display')) {
                // Сначала разберёмся с предыдущем дисплеем
                var _pd = this.model.previous('display');
                // если дисплей был установлен ранее, то даём ему знать чтот он уже не текущий
                if(this.displays[_pd]) {
                    var _display = this.displays[_pd];
                    $(this.displays[_pd].el).hide();
                    _display.svChangeDisplay(false);
                    this.elDisplaysChooser.children('.current').removeClass('current');
                }


                var _d = this.model.get('display');
                _d = this.displays[_d] ? _d : 'list'; // значение по умолчанию
                var _display = this.displays[_d];
                this.elDisplaysChooser.children('.' + _d).addClass('current');

                _display.svChangeDisplay(true); // говорим дисплею, что он стал текущим
                _display.el.show(); // плавно его показываем пользователю
            }

            // Изменился набор элементов ========================== items
            if(this.model.hasChanged('items')) {
                var disp = this.ds.getDisplay(this.ds.current());
                if(disp) {
                    disp.svChangeItems(this.model.get('items'));
                }
            }

        },

        // Пользователь выбрает другой дисплей
        displayChoose : function (el) {
            console.log(el.target);
            this.model.set( {'display' : $(el.target).attr('rel')} )
        }
	
    });
    _.extend(App.Views.Scope.prototype, DisplaySystem.Display);
    
    /**
     * Элемент списка в ScopeView
     */
    ScopeViewItem = Backbone.Model.extend({
        defaults: {
            id:          '', 	// UUID, также присваивается DOM элементу как id
            classes:     '', 	// классы через пробел присваемые DOM элементу
            href:        '', 	// URL на который ссылается этот элемент
            title:       '',	// краткое описание элемента
            description: '',	// краткое описание элемента
            icon:        null // иконка элемента - roundicon
        }
    });
	
	
    //========================================================================= ScopeViewItemsGetter
    /**
     * Класс представляет собой интерфейс получения элементов из упорядоченного списка, где
     * метод getItems используется для получения элементов
     */
    ScopeViewItemsGetter = function (array) {
        this.initialize(array);
    };
    _.extend(ScopeViewItemsGetter.prototype, {
        
        /**
         * Метод вызываемый для инициализации объекта.
         * В стандартной реализации объект работает с массивом, поэтому при перезагрузке этого метода
         * не нужно обращать внимание на параметры этого метода, их можно заменить на свои.
         */
        initialize: function (array) {
            this.arrayOfItems = array  ||  [];
        },
        
        /**
         * Метод запроса порции элементов ScopeViewItem.
         * Вызывает функцию callback(items, count) где items - запрошенные елементы из набора,
         * и count - количество элементов во всём наборе.
         * Вместо обычного способа возврата значения через return, это реализованно через метод
         * callback для дальнейшего более функционального расшрения, например для работы с AJAX,
         * когда данные будут возвращены не сразу, а при возвращении ответа от сервера.
         *
         * Если в callback items будет null, то это будет расматриваться как ошибка получения порции данных,
         * о чём нужно сообщить пользователю.
         */
        getItems: function (index, count, callback) {
            callback(this.arrayOfItems.slice(index, index + count - 1), this.arrayOfItems.length);
        }
        
    }) //===========================================================================================
    
    
    
    /**
     * Абстрактный класс.
     * Дисплей элементов, который отображает элементы вида (ScopeView.items).
     * ScopeView содержит несколько дисплеев и позволяет пользователю переключатся между ними.
     * Этот класс реализует методы вызываемые при смене дисплея, при смене элементов вида (items)
     * и тд
     */
    ScopeViewDisplay = DisplaySystem.Display.extend({

        /**
         * Метод вызывается видом, чтобы сообщить дисплею, что набор элементов был изменён,
         * поэтому требуется перестроить вид.
         * Этот метод будет вызываться при смене набора видов в элементе, лишь если этот дисплей
         * является текущим дисплеем.
         * Заметьте, текущий - не значит в данный момент отображаемый пользователю, а может быть на
         * заднем фоне пока инициализируются другие механизмы перед показом этого пользователю.
         */
        svChangeItems: function (items) {}

    });

    

    /**
     * Дисплей отображающий элементы по кругу
     */
//    ScopeViewSphereDisplay = ScopeViewDisplay.extend({
//
//        // инициализируем дисплей
//        initialize : function () {
//            // инициализируем DOM структуру вида
//            this.el = $('<div class=sv-spheredisplay />');
//        },
//
//        svChangeItems : function (items){},
//
//        // дисплей стал текущим или наоборот
//        svChangeDisplay : function (current) {}
//
//    });


})( jQuery ); // <-- End ( $ )