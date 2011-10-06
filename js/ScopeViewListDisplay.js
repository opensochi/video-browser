/**
 * Дисплей отображающий элементы в виде списка
 */
ScopeViewListDisplay = ScopeViewDisplay.extend({

    pageSize : 12, // Количество элементов на страницу
    scopeView : null, // ScopeView элементы (items) которого будет отображать этот дисплей
    el : null, // корень DOM структуры этого вида
    elLoading : null,
    elError : null,
    elItems : null,
    elPaginator : null,

    initialize : function (scopeView) {
        this.scopeView = scopeView;
        // далее инициализируем DOM структуру вида
        this.el = $('<div class=sv-listdisplay />');
        this.elLoading = $('<img class=loading src="images/scopeview-loading.gif" />')
                .appendTo(this.el)
                .hide();
        this.elError = $('<div class=error >Произошла ошибка при загрузке порции данных.</div>')
                .appendTo(this.el)
                .hide();
        this.elItems = $('<ol class=items />').appendTo(this.el);
        this.elPaginator = $('<div class=paginator />') // пагинатор
                .appendTo(this.el);
    },

    svChangeItems : function (items) { // сменился набор элементов когда этот дисплей текущий
        this._changePage(1, items);
    },

    dsChange : function (current) {
        if(current) {
            this.svChangeItems(this.scopeView.model.get('items'));
        } else {
            this.svChangeItems(null); // чистим
        }
    },

    // Метод не использует свойство scopeView этого объекта
    // getter элементов передаются ему в items
    _changePage : function (page, svItems) { // при смене страницы
        var elItems = this.elItems;
        svItems = svItems ? svItems : new ScopeViewItemsGetter([]);

        this.elLoading.show();

        elItems.slideUp(600, $.proxy(function () {
            elItems.empty();

            svItems.getItems((page - 1) * this.pageSize, this.pageSize, $.proxy(function (items, count) {
                if (!items) {
                    this.elError.show(600);
                    return;
                } else {
                    this.elError.hide();
                }

                var minItems = Math.min(this.pageSize, items.length);

                this._makePaginator(page, count);

                // наполняем список элементами
                for (var i = 0; i < minItems; i++) {
                    var item = items[i],
                        elItem = $('<li/>').appendTo(elItems),
                        icon = item.get('icon');

                    if (icon) {
                        $('<a class=icon />')
                            .roundicon(icon)
                            .appendTo(elItem)
                            .attr('href', item.get('href'));
                    }

                    $('<a class=title />')
                        .text(item.get('title'))
                        .attr({'href':item.get('href')})
                        .appendTo(elItem);
                    $('<p class=description />')
                        .text(item.get('description'))
                        .appendTo(elItem);
                }

                this.elLoading.hide();
                elItems.slideDown(600);
            }, this));

        }, this));
        
    },

    _makePaginator : function (page, count) {
        this.elPaginator.empty(); // сносим старый пагинатор
        if (count > this.pageSize) { // показываем пагинатор только если страниц несколько
            this.elPaginator.smartpaginator({
                totalrecords : count,
                recordsperpage : this.pageSize,
                initval : page,
                onchange: $.proxy(function (page) {
                        this._changePage(page, this.scopeView.model.get('items'));
                    }, this),
                mythis : this
            });
        }
    }

});