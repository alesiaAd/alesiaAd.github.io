// Controller encapsulates all the logic of the application and rules over all other modules. I tried to write an app in clean MVC pattern

var youHelper = null;
var controller = null;
var maxPages = 5;


Array.prototype.extend = function (other_array) {
    other_array.forEach(function(v) {this.push(v)}, this);    
}

class Controller {
    constructor() {
        this.items = [];
        this.currentPage = 0;
        var self = this;
        this.amountPerPage = 0;
        this.padding = parseFloat(getComputedStyle(document.getElementById('search-container')).padding);
        this.width = 250;
        this.margin = 10;
        detectswipe('search-container', function(element, direction) {
            console.log(element, direction)
            if(direction === 'r') {
                if(self.canMoveBack()) {
                    pagePrev();
                }
            }
            if(direction === 'l') {
                if(self.canMoveForward()) {
                    pageNext();
                }
            }
        })
    }

    itemsUpdated(items) {
        this.items.extend(items);
        this.updateUI();
    }

    updateUI() {    
        //console.log(parseFloat(getComputedStyle(document.getElementById('video')).margin));
        document.getElementById('search-container').innerHTML = "";
        this.countAmountPerPage(this.amountPerPage);
        var maxIndex = (this.currentPage + 1) * this.amountPerPage;
        maxIndex = maxIndex > youHelper.total ? youHelper.total : maxIndex;
        for (var i = this.currentPage * this.amountPerPage; i < maxIndex; i++) {
	         var item = this.items[i];
             var vidHtml = addItem(item);
             document.getElementById('search-container').innerHTML += vidHtml;
        }
        document.getElementById('pagination').innerHTML = "";
        
        if (this.canMoveBack()) {
            var arrowLeftHtml = addArrowLeft();
            document.getElementById('pagination').innerHTML = arrowLeftHtml;
        }

        var startPage = 0;
        var maxPageCount = Math.ceil(youHelper.total / this.amountPerPage);
        var pagesCount = maxPageCount > maxPages ? maxPages : maxPageCount;
        if(this.currentPage - 3 < 0) {
            startPage = 0;
        }
        else if(this.currentPage + 3 >= maxPageCount) {
            startPage = maxPageCount - pagesCount;
        }
        else {
            startPage = this.currentPage - 2;
        }
        for (var j = startPage; j < startPage + pagesCount; j++) {
            var pageHtml = addPage(j + 1, j == this.currentPage);
            document.getElementById('pagination').innerHTML += pageHtml;
        }
        if(this.canMoveForward()) {
            var arrowRightHtml = addArrowRight();
            document.getElementById('pagination').innerHTML += arrowRightHtml;
        }
    }

    countAmountPerPage (amountPerPage) {
        if (document.documentElement.clientWidth > (this.padding * 2 + (amountPerPage + 1)*this.width + this.margin * 2 * (amountPerPage + 1))) {
            this.amountPerPage++;
            return this.countAmountPerPage(this.amountPerPage);
        }
        else if (this.padding * 2 + amountPerPage*this.width + this.margin * 2 * amountPerPage  > document.documentElement.clientWidth) {
            this.amountPerPage--;
            return this.countAmountPerPage(this.amountPerPage);
        }
        else {
            return this.amountPerPage;
        }
    }

    canMoveBack() {
        return this.currentPage > 0;
    }

    canMoveForward() {
        return this.currentPage * this.amountPerPage + this.amountPerPage < youHelper.total;
    }
}

function search() {
    var string = document.getElementById("query").value;
    if(string != this.lastSearchString) {
        youHelper = null;
    }
    if(youHelper == null) {
        youHelper = new YouHelper(string, 30);
        youHelper.next();
        document.getElementById('search-container').innerHTML = '<img alt="loading..." src="img/loader.gif"/>';
    }
    
    controller = new Controller();
    youHelper.newItemsReceived = function(items) {
        controller.itemsUpdated(items);
    }
    
}

var isClicked = false;

function pagePrev() {
    if (!isClicked) {
        slide('ltr', function(){
            controller.currentPage = controller.currentPage - 1;
            controller.updateUI();
        })
        isClicked = true;
        setTimeout(function(){
                isClicked = false;
        },500)
    }   
}

function pageNext() {
    if (!isClicked) {
        slide('rtl', function() {
            controller.currentPage = controller.currentPage + 1;
            controller.updateUI();
            if(((controller.currentPage + 2) * controller.amountPerPage + 1) > controller.items.length - 1) {
                youHelper.next();
            }
        })
        isClicked = true;
        setTimeout(function(){
                isClicked = false;
        },500)
    }
}

function pageHandler(a) {
    if (!isClicked) {
        var index = parseInt(a.innerHTML) - 1;
        if(controller.currentPage != index) {
            var direction = controller.currentPage > index ? 'ltr' : 'rtl'
            slide(direction, function(){
                controller.currentPage = index;
                controller.updateUI();
                if(((controller.currentPage + 2) * controller.amountPerPage + 1) > controller.items.length - 1) {
                    youHelper.next();
                }
            })
            isClicked = true;
            setTimeout(function(){
                isClicked = false;
            },500) 
        }
    }   
}

function isEnter(event) {
    if (event.keyCode == 13) {
        return search();
    }
}