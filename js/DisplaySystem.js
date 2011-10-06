/**
 * Система дисплеев в которую добавляются дисплеи (DisplaySystem.Display), а она уже управляет их
 * сменой между друг другом, уведомляя их о смене.
 * В el передаётся jQuery в котором будут храниться дисплеи 
 */
DisplaySystem = function (el) {
    
    this.el = el;
    // массив всех дисплеев в системе
    this._displays = [];
    // имя текущего дисплея
    this._currentDisplayName = null;
    
    // добавляет дисплей в систему, name - это уникальное имя дисплея
    // если дисплей с таким именем уже существует, то будет Exception
    this.addDisplay = function (name, display) {
        if(this._displays[name]) throw 'Дисплей с таким именем уже есть';
        this._displays[name] = display;
        this.el.append(display.el);
    }
    
    // [устанавливает]/возвращает текущий дисплей (его имя), если параметр
    // name не указан (!name), то просто возвращает текущий дисплей
    // ничего не изменяя. Если текущий дисплей не установлен, то возвращет null
    this.current = function (name) {
        if(!name) {
            return this._currentDisplayName;
        }
        
        var display = this._displays[name];
        this.el.slideUp(500, $.proxy(function(){
            var curDisplay = this._currentDisplayName ? this._displays[this._currentDisplayName] : null;
            
            if(curDisplay) {
                curDisplay.el.hide();
                curDisplay.dsVisible(false);
                this._currentDisplayName = null;
                curDisplay.dsChange(false);
            }
            
            this._currentDisplayName = name;
            display.dsChange(true);
            display.el.css('display', ''); // show()
            
            this.el.slideDown(500, $.proxy(function () {
                display.dsVisible(true);
            }, this));
            
        }, this))
    }

    // Возвращает текущий дисплей или null если он не установлен
    this.currentDisplay = function () {
        return this._displays[this._currentDisplayName]  ||  null;
    }
    
    // возвращает дисплей с именем name
    this.getDisplay = function (name) {
        return this._displays[name];
    }

    // перебирает все дисплеи в наборе вызывая вызывая для каждого дисплея функцию iter
    // в которую передаётся имя дисплея в первом параметре, и сам дисплей во втором
    this.iterDisplays = function (iter) {
        for(var d in this._displays)
            iter(d, this._displays[d]);
    }
    
}


// Дисплей (вид) которыми манипулирует DisplaySystem
DisplaySystem.Display = Backbone.View.extend();

// Вызывается при смене дисплея, если current то дисплей стал текущим и наоборот
DisplaySystem.Display.prototype.dsChange = function (current) {};

// Вызывается когда дисплей показан пользователю или скрыт перед сменой дисплеев
// если visible === true то дисплей показан, если false то скрыт
DisplaySystem.Display.prototype.dsVisible = function (visible) {};
